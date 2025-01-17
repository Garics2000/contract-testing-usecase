const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');

const JSON_FILE_PATH = process.env.JSON_FILE_PATH
    ? path.join(__dirname, '../..', process.env.JSON_FILE_PATH)
    : path.join(__dirname, '../../data/apps.json');

// Helper function to get apps
const getApps = async (req) => {
    try {
        if (req.app.locals.isTestMode && req.app.locals.testData !== null) {
            return req.app.locals.testData;
        }
        const data = await fs.readFile(JSON_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading apps:', error);
        return [];
    }
};

// Get all apps
router.get('/', async (req, res) => {
    try {
        const apps = await getApps(req);
        res.header('Content-Type', 'application/json').json(apps);
    } catch (error) {
        console.error('Get all error:', error);
        res.status(500)
            .header('Content-Type', 'application/json')
            .json({ error: 'Failed to get apps' });
    }
});

// Search apps
router.get('/search', async (req, res) => {
    try {
        // Check for server error simulation first
        if (req.app.locals.forceError) {
            return res.status(500)
                .header('Content-Type', 'application/json')
                .json({ error: 'Failed to search apps' });
        }

        const { term } = req.query;
        if (!term || term.trim() === '') {
            return res.header('Content-Type', 'application/json')
                .json([]);
        }

        const apps = await getApps(req);
        const filtered = apps.filter(app =>
            app.appName.toLowerCase().includes(term.toLowerCase()) ||
            app.appData.appOwner.toLowerCase().includes(term.toLowerCase())
        );

        res.header('Content-Type', 'application/json')
            .json(filtered);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500)
            .header('Content-Type', 'application/json')
            .json({ error: 'Failed to search apps' });
    }
});

// Update app
router.put('/:appName', async (req, res) => {
    try {
        const { appName } = req.params;
        const updatedApp = req.body;
        const apps = await getApps(req);

        const index = apps.findIndex(app => app.appName === appName);
        if (index === -1) {
            return res.status(404)
                .header('Content-Type', 'application/json')
                .json({ error: 'App not found' });
        }

        if (updatedApp.appName !== apps[index].appName) {
            return res.status(400)
                .header('Content-Type', 'application/json')
                .json({ error: 'appName cannot be modified' });
        }

        if (updatedApp.appData.appPath !== apps[index].appData.appPath) {
            return res.status(400)
                .header('Content-Type', 'application/json')
                .json({ error: 'appPath cannot be modified' });
        }

        apps[index] = updatedApp;
        if (!req.app.locals.isTestMode) {
            await fs.writeFile(JSON_FILE_PATH, JSON.stringify(apps, null, 2));
        } else {
            req.app.locals.testData = apps;
        }

        res.header('Content-Type', 'application/json')
            .json(updatedApp);
    } catch (error) {
        console.error('Update error:', error);
        res.status(500)
            .header('Content-Type', 'application/json')
            .json({ error: 'Failed to update app' });
    }
});

// Delete app
router.delete('/:appName', async (req, res) => {
    try {
        const { appName } = req.params;
        const apps = await getApps(req);
        const filteredApps = apps.filter(app => app.appName !== appName);

        if (filteredApps.length === apps.length) {
            return res.status(404)
                .header('Content-Type', 'application/json')
                .json({ error: 'App not found' });
        }

        if (!req.app.locals.isTestMode) {
            await fs.writeFile(JSON_FILE_PATH, JSON.stringify(filteredApps, null, 2));
        } else {
            req.app.locals.testData = filteredApps;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500)
            .header('Content-Type', 'application/json')
            .json({ error: 'Failed to delete app' });
    }
});

module.exports = router;