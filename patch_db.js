const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');
content = content.replace(/full_name: profile.name,/g, "name: profile.name,");
fs.writeFileSync('src/services/db.ts', content);
