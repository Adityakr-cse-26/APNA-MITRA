const fs = require('fs');
const content = fs.readFileSync('src/supabase.ts', 'utf-8');
const urlMatch = content.match(/const fallbackUrl = ['"]([^'"]+)['"]/);
const keyMatch = content.match(/const fallbackAnonKey = ['"]([^'"]+)['"]/);
console.log(urlMatch[1], keyMatch[1]);
