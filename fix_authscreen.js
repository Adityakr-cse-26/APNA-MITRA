import fs from 'fs';
let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

code = code.replace(/import \{ createUserWithEmailAndPassword[\s\S]*?\} from 'firebase\/auth';/, '');
fs.writeFileSync('src/components/AuthScreen.tsx', code);
console.log("Fixed AuthScreen");
