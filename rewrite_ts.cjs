const fs = require('fs');
let code = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
code.compilerOptions.types = ["vite/client"];
fs.writeFileSync('tsconfig.json', JSON.stringify(code, null, 2));
