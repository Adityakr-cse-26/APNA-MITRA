const fs = require('fs');
let code = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');

code = code.replace(
  /setReadError\(err\.message\);/g,
  "let errMsg2 = err.message;\n      if (errMsg2 === 'Failed to fetch') errMsg2 = 'Network error (Failed to fetch). This is often caused by an Ad Blocker (like Brave Shields or uBlock Origin) blocking the secure connection to the database. Please disable it for this site and try again.';\n      setReadError(errMsg2);"
);

fs.writeFileSync('src/components/BooksSection.tsx', code);
