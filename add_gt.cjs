const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { GoogleTranslate }')) {
  content = content.replace("import { AuthScreen } from './components/AuthScreen';", "import { AuthScreen } from './components/AuthScreen';\nimport { GoogleTranslate } from './components/GoogleTranslate';");
}

if (!content.includes('<GoogleTranslate currentLang={currentLang} />')) {
  content = content.replace("<div className={`min-h-screen", "<GoogleTranslate currentLang={currentLang} />\n      <div className={`min-h-screen");
}

fs.writeFileSync('src/App.tsx', content);
