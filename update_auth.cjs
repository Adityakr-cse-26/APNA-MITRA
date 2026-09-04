const fs = require('fs');
let content = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

content = content.replace(
  `const [isAdminMode, setIsAdminMode] = useState(false);`,
  `const [authMode, setAuthMode] = useState<'patient' | 'admin' | 'guardian'>('patient');`
);

content = content.replace(
  `const role = isAdminMode ? 'admin' : 'patient';`,
  `const role = authMode;`
);

content = content.replace(
  `full_name: meta.full_name || meta.name || data.user.email || (isAdminMode ? 'Admin' : 'Patient'),`,
  `full_name: meta.full_name || meta.name || data.user.email || (authMode === 'admin' ? 'Admin' : authMode === 'guardian' ? 'Guardian' : 'Patient'),`
);

content = content.replace(
  `if (isAdminMode) {
             const rawRole = profile?.role;
             if (typeof rawRole !== 'string' || rawRole.toLowerCase().trim() !== 'admin') {
               await supabase.auth.signOut();
               throw new Error(\`Access denied. Your role in the database is '\${rawRole}', expected 'admin'.\`);
             }
           }`,
  `if (authMode !== 'patient') {
             const rawRole = profile?.role;
             if (typeof rawRole !== 'string' || rawRole.toLowerCase().trim() !== authMode) {
               await supabase.auth.signOut();
               throw new Error(\`Access denied. Your role in the database is '\${rawRole}', expected '\${authMode}'.\`);
             }
           }`
);

content = content.replace(
  `role: isAdminMode ? 'admin' : 'patient'`,
  `role: authMode`
);

content = content.replace(
  `{isReset ? 'Reset Your Password' : isLogin ? (isAdminMode ? 'Admin Sign In' : 'Sign In to Your Account') : (isAdminMode ? 'Create Admin Account' : 'Create a New Account')}`,
  `{isReset ? 'Reset Your Password' : isLogin ? (authMode === 'admin' ? 'Admin Sign In' : authMode === 'guardian' ? 'Guardian Sign In' : 'Sign In to Your Account') : (authMode === 'admin' ? 'Create Admin Account' : authMode === 'guardian' ? 'Create Guardian Account' : 'Create a New Account')}`
);

content = content.replace(
  `<button onClick={() => { setIsAdminMode(!isAdminMode); setIsLogin(true); setError(null); }} className="text-indigo-600 font-bold hover:text-indigo-700 transition">
                {isAdminMode ? "Patient Login" : "Admin Login"}
              </button>`,
  `<div className="flex justify-center gap-4 text-sm mt-4">
                <button onClick={() => { setAuthMode('patient'); setIsLogin(true); setError(null); }} className={\`font-bold transition \${authMode === 'patient' ? 'text-emerald-700 underline' : 'text-gray-500 hover:text-emerald-600'}\`}>
                  Patient Login
                </button>
                <button onClick={() => { setAuthMode('guardian'); setIsLogin(true); setError(null); }} className={\`font-bold transition \${authMode === 'guardian' ? 'text-emerald-700 underline' : 'text-gray-500 hover:text-emerald-600'}\`}>
                  Guardian Login
                </button>
                <button onClick={() => { setAuthMode('admin'); setIsLogin(true); setError(null); }} className={\`font-bold transition \${authMode === 'admin' ? 'text-emerald-700 underline' : 'text-gray-500 hover:text-emerald-600'}\`}>
                  Admin Login
                </button>
              </div>`
);

// We also need to add a "Patient Phone to link" if Guardian registers, but the prompt says:
// "A guardian should only see SOS notifications belonging to the patient connected to that guardian."
// So when authMode === 'guardian' during signup, we should maybe capture patient phone, or maybe the guardian phone IS the one we use.
// "Use the existing Supabase profiles table and notifications table."
// Let's check where the guardian phone is captured.
// Wait, I can just change the guardian phone field for the guardian themselves. Let's see what inputs are rendered.

fs.writeFileSync('src/components/AuthScreen.tsx', content);
console.log('done updating auth screen');
