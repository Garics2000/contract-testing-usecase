import React, { useState, useEffect } from 'react';
import {
    Container, TextField, Button, Card, CardContent,
    Typography, Grid, Switch, Box, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import debounce from 'lodash.debounce';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
    const [apps, setApps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editDialog, setEditDialog] = useState({
        open: false,
        app: null
    });
    const [editFormData, setEditFormData] = useState({
        appOwner: '',
        isValid: false
    });

    const fetchApps = async () => {
        try {
            const response = await fetch(`${API_URL}/api/apps`);
            if (!response.ok) throw new Error('Failed to fetch apps');
            const data = await response.json();
            setApps(data);
        } catch (error) {
            console.error('Failed to fetch apps:', error);
        }
    };

    const handleSearch = debounce(async () => {
        if (!searchTerm.trim()) {
            // If the search term is empty, fetch all apps
            await fetchApps();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/apps/search?term=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Failed to search apps');
            const data = await response.json();
            setApps(data);
        } catch (error) {
            console.error('Failed to search apps:', error);
        }
    }, 300); // Debounce search by 300ms

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const deleteApp = async (appName) => {
        try {
            const response = await fetch(`${API_URL}/api/apps/${appName}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete app');
            await fetchApps(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete app:', error);
        }
    };

    const openEditDialog = (app) => {
        setEditDialog({
            open: true,
            app
        });
        setEditFormData({
            appOwner: app.appData.appOwner,
            isValid: app.appData.isValid
        });
    };

    const closeEditDialog = () => {
        setEditDialog({
            open: false,
            app: null
        });
    };

    const updateApp = async () => {
        try {
            const updatedApp = {
                ...editDialog.app,
                appData: {
                    ...editDialog.app.appData,
                    appOwner: editFormData.appOwner,
                    isValid: editFormData.isValid
                }
            };

            const response = await fetch(`${API_URL}/api/apps/${editDialog.app.appName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedApp)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update app');
            }

            await fetchApps(); // Refresh the list after successful update
            closeEditDialog();
        } catch (error) {
            console.error('Failed to update app:', error);
            alert(error.message);
        }
    };

    // Initial load
    useEffect(() => {
        fetchApps();
    }, []);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    label="Search apps"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    fullWidth
                >
                    Search
                </Button>
            </Box>

            <Grid container spacing={2}>
                {apps.map(app => (
                    <Grid item xs={12} sm={6} key={app.appName}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">
                                        {app.appName}
                                    </Typography>
                                    <Box>
                                        <IconButton
                                            color="primary"
                                            onClick={() => openEditDialog(app)}
                                            aria-label="edit"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => deleteApp(app.appName)}
                                            aria-label="delete"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="textSecondary">
                                    Owner: {app.appData.appOwner}
                                </Typography>
                                <Typography color="textSecondary">
                                    Path: {app.appData.appPath}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                    <Typography>Valid: {app.appData.isValid ? 'Yes' : 'No'}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onClose={closeEditDialog}>
                <DialogTitle>Edit App</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Owner"
                        fullWidth
                        value={editFormData.appOwner}
                        onChange={(e) => setEditFormData({
                            ...editFormData,
                            appOwner: e.target.value
                        })}
                    />
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography>Valid:</Typography>
                        <Switch
                            checked={editFormData.isValid}
                            onChange={(e) => setEditFormData({
                                ...editFormData,
                                isValid: e.target.checked
                            })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog}>Cancel</Button>
                    <Button onClick={updateApp} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default App;