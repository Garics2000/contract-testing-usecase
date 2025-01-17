const appsData = require('./apps.test.json');

const getAppByName = (appName) => appsData.find(app => app.appName === appName);

const searchApps = (term) => appsData.filter(app =>
    app.appName.toLowerCase().includes(term.toLowerCase()) ||
    app.appData.appOwner.toLowerCase().includes(term.toLowerCase())
);

module.exports = {
    getAppByName,
    searchApps
};