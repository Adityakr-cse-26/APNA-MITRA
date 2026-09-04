const fs = require('fs');
let code = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');

code = code.replace(
  "const match = path.match(/\\/\\/object\\/(?:public|sign)\\/(?: ook|books)\\/(.+)$/);",
  "const match = path.match(/\\/object\\/(?:public|sign)\\/(?:book|books)\\/(.+)$/);"
);

fs.writeFileSync('src/components/BooksSection.tsx', code);
