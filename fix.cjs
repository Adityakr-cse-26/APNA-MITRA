const fs = require('fs');
let code = fs.readFileSync('src/services/db.ts', 'utf8');
code = code.replace(/\\nexport const checkPushSubscription/g, '\nexport const checkPushSubscription');
fs.writeFileSync('src/services/db.ts', code);
