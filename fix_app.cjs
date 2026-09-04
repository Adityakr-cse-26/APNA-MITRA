const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `  // Supabase Auth Effect
  useEffect(() => {
    let mounted = true;
    let isChecking = false;

    const checkAdmin = async (user) => {
      if (isChecking) return;
      isChecking = true;

      try {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        const dbRole = data?.role?.toLowerCase()?.trim();
        const metaRole = user.user_metadata?.role?.toLowerCase()?.trim();
        const role = dbRole || metaRole || 'patient';
        
        const intendedPortal = sessionStorage.getItem('intended_portal');
        if (intendedPortal) {
          sessionStorage.removeItem('intended_portal');
          
          if (intendedPortal === 'guardian' && role !== 'guardian') {
            await supabase.auth.signOut();
            sessionStorage.setItem('authError', "This is a patient account. Please use Patient Login.");
            if (mounted) {
              setCurrentUser(null);
              setRoleChecked(true);
            }
            isChecking = false;
            return;
          }
          
          if (intendedPortal === 'patient' && role === 'guardian') {
            await supabase.auth.signOut();
            sessionStorage.setItem('authError', "This is a guardian account. Please use Guardian Login.");
            if (mounted) {
              setCurrentUser(null);
              setRoleChecked(true);
            }
            isChecking = false;
            return;
          }
        }
        
        if (mounted) {
          setIsAdmin(role === 'admin');
          setIsGuardian(role === 'guardian');
          if (role === 'admin') setShowAdminDashboard(true);
        }
      } catch (err) {
        console.error("Error checking role:", err);
        if (mounted) {
          setIsAdmin(false);
          setIsGuardian(false);
        }
      } finally {
        if (mounted) {
          setRoleChecked(true);
        }
        isChecking = false;
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (mounted) {
        setCurrentUser(user);
        if (user) {
          checkAdmin(user);
        } else {
          setRoleChecked(true);
        }
        setAuthChecking(false);
      }
    }).catch(err => {
      console.error("Supabase session error:", err);
      if (mounted) {
        setAuthChecking(false);
        setRoleChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (mounted) {
        setCurrentUser(user);
        if (user) {
          setRoleChecked(false);
          checkAdmin(user);
        } else {
          setRoleChecked(true);
        }
        setAuthChecking(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);`;

const startIndex = code.indexOf('  // Supabase Auth Effect');
const endIndex = code.indexOf('  // Sync to localStorage');
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + replacement + '\n' + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched src/App.tsx");
} else {
  console.log("Could not find start/end indices");
}
