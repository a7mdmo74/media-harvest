const { readFileSync } = require('fs');
const { join } = require('path');

// Read version from root package.json
const rootPackagePath = join(__dirname, '../../package.json');
const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf8'));

const version = rootPackage.version;
const getVersion = () => rootPackage.version;

module.exports = { version, getVersion };
