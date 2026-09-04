const fs = require('fs');
let code = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

code = code.replace(/import \{ auth, db \} from "\.\.\/firebase";\nimport \{ signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail \} from "firebase\/auth";\nimport \{ doc, getDocFromServer, setDoc \} from "firebase\/firestore";/, `import { supabase } from "../supabase";`);

code = code.replace(/await getDocFromServer\(doc\(db, 'test', 'connection'\)\);\n\s*const error = null;/, `const { error } = await supabase.auth.getSession();`);

code = code.replace(/Firebase/g, 'Supabase');

code = code.replace(/const userCredential = await signInWithEmailAndPassword\(auth, email, password\);\n\s*if \(userCredential\.user\) \{/, `const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) {`);

code = code.replace(/const userCredential = await createUserWithEmailAndPassword\(auth, email, password\);\n\s*if \(userCredential\.user\) \{[\s\S]*?try \{[\s\S]*?await setDoc\(doc\(db, 'profiles', userCredential\.user\.uid\), \{ full_name: name, role: 'patient' \}\);[\s\S]*?\} catch\(e\) \{[\s\S]*?console\.error\("Profile creation error:", e\);[\s\S]*?\}/, `const { data, error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (signUpError) throw signUpError;
        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert([{ id: data.user.id, full_name: name, role: 'patient' }]);
          if (profileError) console.error("Profile creation error:", profileError);`);

code = code.replace(/await sendPasswordResetEmail\(auth, email\);/, `const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;`);

fs.writeFileSync('src/components/AuthScreen.tsx', code);
