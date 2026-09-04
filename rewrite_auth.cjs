const fs = require('fs');
let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

code = code.replace(/import \{ supabase \} from "\.\.\/supabase";/, `import { auth, db } from "../firebase";\nimport { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";\nimport { doc, getDocFromServer } from "firebase/firestore";`);

code = code.replace(/const \{ error \} = await supabase\.auth\.getSession\(\);/g, `await getDocFromServer(doc(db, 'test', 'connection'));\n        const error = null;`);

code = code.replace(/const \{ data, error: signInError \} = await supabase\.auth\.signInWithPassword\(\{[\s\S]*?\}\);[\s\S]*?if \(signInError\) throw signInError;\n        if \(data\.user\) \{/g, `const userCredential = await signInWithEmailAndPassword(auth, email, password);\n        if (userCredential.user) {`);

code = code.replace(/const \{ error: signUpError \} = await supabase\.auth\.signUp\(\{[\s\S]*?\}\);[\s\S]*?if \(signUpError\) throw signUpError;/g, `await createUserWithEmailAndPassword(auth, email, password);`);

code = code.replace(/const \{ error: resetError \} = await supabase\.auth\.resetPasswordForEmail\(email\);[\s\S]*?if \(resetError\) throw resetError;/g, `await sendPasswordResetEmail(auth, email);`);

fs.writeFileSync('src/components/AuthScreen.tsx', code);
