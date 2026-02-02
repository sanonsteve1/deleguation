const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

const version = require('./package.json').version;
let sha1 = 'dev';

try {
    sha1 = execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
} catch (error) {
    // Si git n'est pas disponible ou que ce n'est pas un dépôt git, on utilise 'dev'
    sha1 = 'dev';
}

const content = `
export const VERSION = '${version}';
export const SHA1 = '${sha1}';
`;

writeFileSync('./environments/version.ts', content, { encoding: 'utf8' });
console.log(`Version ${version} - SHA1 ${sha1}`);
