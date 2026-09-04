const fs = require('fs');
let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf-8');

code = code.replace(
  "let errorMsg = err.message || 'An error occurred during authentication.';",
  "let errorMsg = err.message || 'An error occurred during authentication.';\n      if (err.message === 'Failed to fetch') errorMsg = 'Network error (Failed to fetch). This is commonly caused by an Ad Blocker (like uBlock Origin or Brave Shields) blocking authentication requests. Please disable ad blockers for this site and try again.';"
);

fs.writeFileSync('src/components/AuthScreen.tsx', code);
