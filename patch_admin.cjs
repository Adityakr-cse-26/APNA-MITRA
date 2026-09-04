const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/\.from\('books'\)\n\s*\.upload/g, ".from('book')\n          .upload");
code = code.replace(/\.from\('books'\)\.getPublicUrl/g, ".from('book').getPublicUrl");
code = code.replace(/bucketName: 'books'/g, "bucketName: 'book'");
code = code.replace(/objectName: 'books\/'/g, "objectName: 'book/'");
code = code.replace(/objectName: `books\//g, "objectName: `");
code = code.replace(/objectName: fileName/g, "objectName: fileName");

// Wait, let's verify what `objectName` says in tus.Upload metadata.
