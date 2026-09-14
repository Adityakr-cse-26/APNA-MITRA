const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

content = content.replace(
`        // The following columns are omitted to prevent PGRST204 schema cache errors 
        // as they are not present in the default profiles table.
        // age: parseInt(profile.age) || 0,
        // gender: profile.gender,
        // blood_group: profile.bloodGroup,
        // health_info: profile.basicHealthInfo,
        // lifestyle: profile.passionsLifestyle,`,
`        age: parseInt(profile.age) || 0,
        gender: profile.gender,
        blood_group: profile.bloodGroup,
        health_info: profile.basicHealthInfo,
        lifestyle: profile.passionsLifestyle,`
);

fs.writeFileSync('src/services/db.ts', content);
console.log("Restored db.ts");
