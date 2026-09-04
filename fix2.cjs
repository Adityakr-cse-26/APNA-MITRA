const fs = require('fs');

let lines = fs.readFileSync('src/components/SeniorSchemesSection.tsx', 'utf8').split('\n');

// Find all occurrences of "useEffect(() => {"
let effectIndices = [];
let categoryIndices = [];

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useEffect(() => {')) {
    effectIndices.push(i);
  }
  if (lines[i].includes('const categories = [')) {
    categoryIndices.push(i);
  }
}

console.log("effectIndices:", effectIndices);
console.log("categoryIndices:", categoryIndices);

if (effectIndices.length > 1) {
  // We want to delete from the second effect index until the end of the second categories array
  let endIdx = -1;
  for (let i = categoryIndices[1]; i < lines.length; i++) {
    if (lines[i].includes('];')) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx !== -1) {
    lines.splice(effectIndices[1], endIdx - effectIndices[1] + 1);
  }
}

fs.writeFileSync('src/components/SeniorSchemesSection.tsx', lines.join('\n'));
console.log("Fixed duplicates!");
