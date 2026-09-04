const fs = require('fs');

// Patch BooksSection.tsx
let booksCode = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');
booksCode = booksCode.replace(
  "setReadError(error.message);",
  "let errMsg = error.message;\n        if (errMsg === 'Failed to fetch') errMsg = 'Network error (Failed to fetch). This is often caused by an Ad Blocker (like Brave Shields or uBlock Origin) blocking the secure connection to the database. Please disable it for this site and try again.';\n        setReadError(errMsg);"
);
booksCode = booksCode.replace(
  "setFetchError(error.message);",
  "let errMsg = error.message;\n      if (errMsg === 'Failed to fetch') errMsg = 'Network error (Failed to fetch). If you have an Ad Blocker, please disable it for this site to load the books.';\n      setFetchError(errMsg);"
);
fs.writeFileSync('src/components/BooksSection.tsx', booksCode);

// Patch AdminDashboard.tsx
let adminCode = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
adminCode = adminCode.replace(
  "alert('Error uploading PDF: ' + (error.message || 'Unknown error'));",
  "let errMsg = error.message || 'Unknown error';\n             if (errMsg === 'Failed to fetch') errMsg = 'Network error (Failed to fetch). This can happen if an Ad Blocker is active or your internet connection dropped. Please disable ad blockers and try again.';\n             alert('Error uploading PDF: ' + errMsg);"
);
adminCode = adminCode.replace(
  "alert('Error uploading PDF: ' + (err.message || 'Unknown error'));",
  "let errMsg = err.message || 'Unknown error';\n      if (errMsg === 'Failed to fetch') errMsg = 'Network error (Failed to fetch). This can happen if an Ad Blocker is active or your internet connection dropped. Please disable ad blockers and try again.';\n      alert('Error uploading PDF: ' + errMsg);"
);
fs.writeFileSync('src/components/AdminDashboard.tsx', adminCode);

