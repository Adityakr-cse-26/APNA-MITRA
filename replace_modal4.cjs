const fs = require('fs');
let code = fs.readFileSync('src/components/NearbyDirectorySection.tsx', 'utf8');

code = code.replace(
  'const [bookingSuccessModal, setBookingSuccessModal] = useState<string | null>(null);',
  'const [confirmedAppointment, setConfirmedAppointment] = useState<any | null>(null);'
);

code = code.replace(
  `      const newAppt = await bookDoctorAppointment(
        user.id,
        selectedDoctor.id,
        bookingDate,
        bookingTime,
        patientReason
      );
      setSelectedDoctor(null);
      setBookingDate("");
      setBookingTime("");
      setPatientReason("");
      setBookingSuccessModal(\`Appointment confirmed with \${selectedDoctor.name} for \${bookingDate} at \${bookingTime}.\`);`,
  `      const newAppt = await bookDoctorAppointment(
        user.id,
        selectedDoctor.id,
        bookingDate,
        bookingTime,
        patientReason
      );
      setConfirmedAppointment({
        id: newAppt.id,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization || selectedDoctor.speciality,
        date: bookingDate,
        time: bookingTime,
        status: newAppt.status || 'Confirmed'
      });
      setSelectedDoctor(null);
      setBookingDate("");
      setBookingTime("");
      setPatientReason("");`
);
fs.writeFileSync('src/components/NearbyDirectorySection.tsx', code);
