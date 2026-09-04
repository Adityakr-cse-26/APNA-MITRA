const fs = require('fs');
let content = fs.readFileSync('src/services/db.ts', 'utf8');

content = content.replace(
  /status: 'Pending',/g,
  "status: 'scheduled',"
);

content = content.replace(
  /status: appointment.status \|\| 'Requested',/g,
  "status: appointment.status || 'scheduled',"
);

// Remove hospital and patient_name from insert
content = content.replace(
  /hospital: hospital \|\| 'Apna Mitra Partner Clinic',\s*patient_name: patientName \|\| 'Patient',/g,
  ""
);

content = content.replace(
  /patient_name: appointment.patientName,\s*doctor_id/g,
  "doctor_id"
);

content = content.replace(
  /doctor_name: appointment.doctorName,\s*hospital: appointment.hospital,/g,
  "doctor_name: appointment.doctorName,"
);

fs.writeFileSync('src/services/db.ts', content);
