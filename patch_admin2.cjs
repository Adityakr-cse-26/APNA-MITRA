const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/bucketName: 'books'/g, "bucketName: 'book'");
code = code.replace(/\.from\('books'\)\n\s*\.upload/g, ".from('book')\n          .upload");
code = code.replace(/\.from\('books'\)\.getPublicUrl/g, ".from('book').getPublicUrl");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
