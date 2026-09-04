const fs = require('fs');
let content = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');

content = content.replace(
  `              full_name: fullName, 
              email: email,
              phone: phone,
              guardian_name: guardianName,
              guardian_phone: guardianPhone,
              role: authMode`,
  `              full_name: fullName, 
              phone: phone,
              guardian_name: guardianName,
              guardian_phone: guardianPhone,
              role: authMode`
);

content = content.replace(
  `               full_name: meta.full_name || meta.name || data.user.email || (authMode === 'admin' ? 'Admin' : authMode === 'guardian' ? 'Guardian' : 'Patient'), 
               email: data.user.email,
               phone: meta.phone || '',
               guardian_name: meta.guardian_name || '',
               guardian_phone: meta.guardian_phone || '',
               role: role`,
  `               full_name: meta.full_name || meta.name || data.user.email || (authMode === 'admin' ? 'Admin' : authMode === 'guardian' ? 'Guardian' : 'Patient'), 
               phone: meta.phone || '',
               guardian_name: meta.guardian_name || '',
               guardian_phone: meta.guardian_phone || '',
               role: role`
);

fs.writeFileSync('src/components/AuthScreen.tsx', content);
console.log("Reverted AuthScreen to NOT include email");
