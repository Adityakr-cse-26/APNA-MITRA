const fs = require('fs');
let code = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');

const regexPattern = /const match = path\.match\(.*\);/;
code = code.replace(regexPattern, "const match = path.match(/\\/object\\/(?:public|sign)\\/(?:book|books)\\/(.+)$/);");

fs.writeFileSync('src/components/BooksSection.tsx', code);
