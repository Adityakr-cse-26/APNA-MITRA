const fs = require('fs');
let code = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');

code = code.replace(
  "const { data, error } = await supabase",
  "const newWindow = window.open('', '_blank');\n      const { data, error } = await supabase"
);

code = code.replace(
  "if (data?.signedUrl) {\n                const newWindow = window.open(data.signedUrl, '_blank', 'noopener,noreferrer');\n        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {\n            setPdfErrorUrl(data.signedUrl);\n        }\n      }",
  "if (data?.signedUrl) {\n        if (newWindow) {\n          newWindow.location.href = data.signedUrl;\n        } else {\n          setPdfErrorUrl(data.signedUrl);\n        }\n      } else if (newWindow) {\n        newWindow.close();\n      }"
);

fs.writeFileSync('src/components/BooksSection.tsx', code);
