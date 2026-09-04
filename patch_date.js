import fs from 'fs';
let code = fs.readFileSync('src/components/SpreadsheetViewModal.tsx', 'utf8');
code = code.replace(
  '{new Date(hc.createdAt?.seconds * 1000).toLocaleDateString() || "Unknown"}',
  '{hc.createdAt?.seconds ? new Date(hc.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}'
);
fs.writeFileSync('src/components/SpreadsheetViewModal.tsx', code);
console.log("Patched Date.");
