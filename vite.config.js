const path = require('path');
const fs = require('fs');

const apps = fs.readdirSync(path.resolve(__dirname, 'apps'));
const excludeApps = ['common'];
const input = {};
for (const app of apps.filter(app => !excludeApps.includes(app))) {
    input[app] = path.resolve(__dirname, 'apps', app, 'index.html')
}

module.exports = {
    base: '/three-demo/',
    build: {
        rollupOptions: {
            input
        },
        target: 'es2015',
        outDir: 'docs',
        assetsDir: 'static'
    },
    server: {
        open: '/three-demo/apps/entry/index.html'
    }
};
