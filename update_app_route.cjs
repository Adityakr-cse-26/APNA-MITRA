const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  if (isAdmin) {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div `;

const replacement = `  if (isAdmin) {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (userProfile?.role === 'guardian') {
    return (
      <GuardianDashboardView
        currentLang={currentLang}
        user={currentUser}
        profile={userProfile}
        onLogout={handleLogout}
        onSwitchToSeniorView={() => {}}
      />
    );
  }

  return (
    <div `;

content = content.replace(target, replacement);

const importTarget = `import { GuardianDashboardView } from "./components/GuardianDashboardView";`;
if (!content.includes(importTarget)) {
  content = content.replace(
    `import { AdminDashboard } from "./components/AdminDashboard";`,
    `import { AdminDashboard } from "./components/AdminDashboard";
import { GuardianDashboardView } from "./components/GuardianDashboardView";`
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('done updating App.tsx routing');
