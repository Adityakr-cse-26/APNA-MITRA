const fs = require('fs');
let code = fs.readFileSync('src/components/ChatbotWidget.tsx', 'utf8');

code = code.replace(
  "const chatHeader = document.querySelector('.chat-header');",
  "const chatHeader = document.querySelector('.chat-header') as HTMLElement;"
);

fs.writeFileSync('src/components/ChatbotWidget.tsx', code);
