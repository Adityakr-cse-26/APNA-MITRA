const fs = require('fs');
let code = fs.readFileSync('src/components/PatientDashboardView.tsx', 'utf8');

code = code.replace(/import \{ db \} from '\.\.\/firebase';\nimport \{ User \} from 'firebase\/auth';\nimport \{ collection, doc, getDoc, getDocs, query, where, orderBy \} from 'firebase\/firestore';/, `import { supabase } from '../supabase';\nimport { User } from '@supabase/supabase-js';`);

code = code.replace(/const profileSnap = await getDoc\(doc\(db, 'profiles', user\.uid\)\);\n\s*const profileData = profileSnap\.exists\(\) \? profileSnap\.data\(\) : null;\n\s*const profileError = null;/, `const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();`);

code = code.replace(/const apptQ = query\(collection\(db, 'appointments'\), where\('patient_id', '==', user\.uid\), orderBy\('date', 'asc'\)\);\n\s*const apptSnap = await getDocs\(apptQ\);\n\s*const appointmentsData = apptSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \} as any\)\);\n\s*const apptError = null;/, `const { data: appointmentsData, error: apptError } = await supabase.from('appointments').select('*').eq('patient_id', user.id).order('date', { ascending: true });`);

code = code.replace(/const checksQ = query\(collection\(db, 'health_checks'\), where\('patient_id', '==', user\.uid\), orderBy\('created_at', 'desc'\)\);\n\s*const checksSnap = await getDocs\(checksQ\);\n\s*const checksData = checksSnap\.docs\.map\(d => \(\{ id: d\.id, \.\.\.d\.data\(\) \}\)\);\n\s*const checksError = null;/, `const { data: checksData, error: checksError } = await supabase.from('health_checks').select('*').eq('patient_id', user.id).order('created_at', { ascending: false });`);

code = code.replace(/user\.uid/g, 'user.id');
code = code.replace(/user\.displayName/g, 'user.user_metadata?.full_name');

fs.writeFileSync('src/components/PatientDashboardView.tsx', code);
