const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ auth \} from "\.\/firebase";\nimport \{ User, onAuthStateChanged, signOut \} from "firebase\/auth";/, `import { supabase } from "./supabase";\nimport { User } from "@supabase/supabase-js";`);

code = code.replace(/const unsubscribe = onAuthStateChanged\(auth, \(user\) => \{\n\s*setCurrentUser\(user\);\n\s*setAuthChecking\(false\);\n\s*\}\);\n\s*return \(\) => unsubscribe\(\);/, `supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      setAuthChecking(false);
    });
    return () => subscription.unsubscribe();`);

code = code.replace(/await signOut\(auth\);/g, `await supabase.auth.signOut();`);

code = code.replace(/user\.uid/g, 'user.id');
code = code.replace(/currentUser\.uid/g, 'currentUser.id');

fs.writeFileSync('src/App.tsx', code);
