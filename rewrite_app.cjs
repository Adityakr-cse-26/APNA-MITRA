const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ supabase \} from "\.\/supabase";\nimport \{ User \} from "@supabase\/supabase-js";/g, `import { auth } from "./firebase";\nimport { User, onAuthStateChanged, signOut } from "firebase/auth";`);

code = code.replace(/supabase\.auth\.getSession\(\)\.then\(\(\{ data: \{ session \} \}\) => \{[\s\S]*?\}\);[\s\S]*?const \{ data: \{ subscription \} \} = supabase\.auth\.onAuthStateChange\(\(_event, session\) => \{[\s\S]*?\}\);[\s\S]*?return \(\) => subscription\.unsubscribe\(\);/g, `const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubscribe();`);

code = code.replace(/await supabase\.auth\.signOut\(\);/g, `await signOut(auth);`);

fs.writeFileSync('src/App.tsx', code);
