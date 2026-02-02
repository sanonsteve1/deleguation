const { execSync } = require('child_process');
const { writeFileSync } = require('fs');

function getCommits() {
    try {
        const log = execSync(`git log -n 50 --pretty=format:"%h|%an|%ad|%s" --date=iso-strict`, { 
            encoding: 'utf8', 
            stdio: ['ignore', 'pipe', 'ignore'] 
        })
            .toString()
            .split('\n')
            .filter(line => line.trim() !== '')
            .map((line) => {
                const [hash, author, date, message] = line.split('|');
                return { hash, author, date, message };
            });
        return log;
    } catch (error) {
        // Si git n'est pas disponible ou que ce n'est pas un dépôt git, on retourne un tableau vide
        return [];
    }
}

const commits = getCommits();
writeFileSync('./public/commits.json', JSON.stringify(commits));
console.log('✅ commits.json généré avec succès');
