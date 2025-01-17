const app = require('./app');
const path = require('path');
const fs = require('fs/promises');

const PORT = process.env.PORT || 3001;
const JSON_FILE_PATH = process.env.JSON_FILE_PATH
    ? path.join(__dirname, '..', process.env.JSON_FILE_PATH)
    : path.join(__dirname, '../data/apps.json');

async function initializeServer() {
    try {
        // Check if data dir is existing
        const dataDir = path.dirname(JSON_FILE_PATH);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
            console.log('Created directory:', dataDir);
        }

        // Create empty apps.json if it doesn't exist
        try {
            await fs.access(JSON_FILE_PATH);
        } catch {
            await fs.writeFile(JSON_FILE_PATH, '[]');
            console.log('Created empty apps.json file:', JSON_FILE_PATH);
        }

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log('Environment:', process.env.NODE_ENV || 'development');
            console.log('JSON file path:', JSON_FILE_PATH);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});


if (require.main === module) {
    initializeServer().catch(error => {
        console.error('Server initialization failed:', error);
        process.exit(1);
    });
}

module.exports = app;