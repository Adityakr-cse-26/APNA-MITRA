const fs = require('fs');

let content = fs.readFileSync('src/types.ts', 'utf8');

const healthCheckType = `
export interface HealthCheck {
  id: string;
  symptoms: string;
  age?: number;
  gender?: string;
  duration?: string;
  severity?: string;
  summary?: string;
  urgency?: string;
  urgencyColor?: string;
  possibleCauses?: string[];
  careTips?: string[];
  recommendedSpecialties?: string[];
  redFlagWarnings?: string[];
  createdAt?: any;
  ownerId?: string;
}
`;

if (!content.includes('interface HealthCheck')) {
  fs.writeFileSync('src/types.ts', content + healthCheckType);
  console.log("Types updated.");
}
