const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the PatientDashboardView component and add currentLang prop
content = content.replace(
  /<PatientDashboardView\s+user=\{currentUser\}\s+onLogout=\{handleLogout\}\s+onOpenSymptomChecker=\{[^\}]+\}\s*\/>/g,
  (match) => {
    if (match.includes('currentLang=')) return match;
    return match.replace('/>', ' currentLang={currentLang}\n        />');
  }
);

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx updated");
