const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// Read root version
const rootPackagePath = join(__dirname, '../package.json');
const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf8'));
const version = rootPackage.version;

console.log(`🔄 Syncing version ${version} across all packages...`);

// Packages to update
const packages = [
  'apps/desktop/package.json',
  'apps/web/package.json',
  'packages/version/package.json',
  'packages/build-shared/package.json',
  'packages/license/package.json',
  'packages/react-shared/package.json',
  'packages/styling-shared/package.json',
  'packages/theme/package.json',
  'packages/types/package.json',
  'packages/ui/package.json'
];

let updatedCount = 0;

packages.forEach(packagePath => {
  try {
    const fullPath = join(__dirname, '..', packagePath);
    const packageJson = JSON.parse(readFileSync(fullPath, 'utf8'));
    
    if (packageJson.version !== version) {
      packageJson.version = version;
      writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Updated ${packagePath} to v${version}`);
      updatedCount++;
    } else {
      console.log(`⏭️  ${packagePath} already at v${version}`);
    }
  } catch (error) {
    console.error(`❌ Failed to update ${packagePath}:`, error.message);
  }
});

console.log(`\n🎉 Version sync complete! Updated ${updatedCount} packages to v${version}`);

// Update web app version file
const webVersionPath = join(__dirname, '../apps/web/lib/version.ts');
const webVersionContent = `export const VERSION = "${version}";
export const GITHUB_REPO = "media-harvest/media-harvest";
`;
writeFileSync(webVersionPath, webVersionContent);
console.log(`✅ Updated web version file to v${version}`);
