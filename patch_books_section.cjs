const fs = require('fs');
let code = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');

code = code.replace(/\/object\\\/\(\?\:public\|sign\)\\\/books\\\/\(\.\+\)\$\//, "/\\/object\\/(\?\:public\|sign)\\/(?:\book\|books)\\/(.+)$/");

code = code.replace(
  "if (path.startsWith('books/')) {\n        path = path.replace('books/', '');\n      }",
  "if (path.startsWith('books/')) {\n        path = path.replace('books/', '');\n      }\n      if (path.startsWith('book/')) {\n        path = path.replace('book/', '');\n      }"
);

code = code.replace(
  ".from(\"books\")",
  ".from(\"book\")"
);

fs.writeFileSync('src/components/BooksSection.tsx', code);
