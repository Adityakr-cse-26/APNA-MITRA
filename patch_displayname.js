import fs from 'fs';
['src/components/DoctorVisitPrepModal.tsx', 'src/components/NearbyDirectorySection.tsx', 'src/components/Navbar.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/user\?\.displayName/g, "user?.user_metadata?.full_name");
  fs.writeFileSync(file, code);
});
console.log("Patched displayName");
