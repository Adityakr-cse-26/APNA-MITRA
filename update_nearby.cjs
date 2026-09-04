const fs = require('fs');
let code = fs.readFileSync('src/components/NearbyDirectorySection.tsx', 'utf8');

// Replace imports
code = code.replace(
  'import { saveAppointment } from "../services/db";',
  'import { saveAppointment, Doctor, fetchDoctors, fetchBookedTimes, bookDoctorAppointment } from "../services/db";'
);

code = code.replace(
  'const [selectedDoctor, setSelectedDoctor] = useState<NearbyDoctor | null>(null);',
  `const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchDoctors().then(data => setDoctorsList(data));
  }, []);

  const generateTimeSlots = (startStr: string, endStr: string) => {
    const slots: string[] = [];
    if (!startStr || !endStr) return slots;
    
    const parseTime = (str: string) => {
      const parts = str.split(':');
      return new Date(2000, 0, 1, parseInt(parts[0]), parseInt(parts[1]), 0);
    };
    
    let current = parseTime(startStr);
    const end = parseTime(endStr);
    
    while (current < end) {
      const hh = current.getHours().toString().padStart(2, '0');
      const mm = current.getMinutes().toString().padStart(2, '0');
      slots.push(\`\${hh}:\${mm}:00\`);
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  React.useEffect(() => {
    if (selectedDoctor && bookingDate) {
      const slots = generateTimeSlots(selectedDoctor.available_time_start, selectedDoctor.available_time_end);
      setAvailableSlots(slots);
      
      fetchBookedTimes(selectedDoctor.id, bookingDate).then(booked => {
        setBookedSlots(booked);
      });
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
    }
  }, [selectedDoctor, bookingDate]);
`
);

// Delete the hardcoded doctors list
code = code.replace(/const doctors: NearbyDoctor\[\] = \[[\s\S]*?\];\s*const hospitals: NearbyHospital\[\] = \[/, 'const hospitals: NearbyHospital[] = [');

// Update filteredDoctors to use doctorsList
code = code.replace(
  /const filteredDoctors = doctors\.filter\([\s\S]*?\);/,
  `const filteredDoctors = doctorsList.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );`
);

// Update rendering of doctors in Tab 1
code = code.replace(
  /<span>1\. Medicine Specialists \(\{doctors\.length\}\)<\/span>/,
  `<span>1. Medicine Specialists ({doctorsList.length})</span>`
);

code = code.replace(
  /<div>\s*<h3 className="font-serif text-lg font-bold text-\[#153A34\]">\{doc\.name\}<\/h3>\s*<p className="text-xs text-\[#586C62\] font-medium">\{doc\.speciality\} • \{doc\.degree\}<\/p>\s*<p className="text-xs text-\[#586C62\] mt-1">\{doc\.experience\} • \{doc\.hospital\}<\/p>\s*<\/div>/g,
  `<div>
                    <h3 className="font-serif text-lg font-bold text-[#153A34]">{doc.name}</h3>
                    <p className="text-xs text-[#586C62] font-medium">{doc.specialization || doc.speciality} • {doc.qualification || doc.degree}</p>
                    <p className="text-xs text-[#586C62] mt-1">{doc.experience} • {doc.hospital || 'Clinic'}</p>
                  </div>`
);

code = code.replace(
  /\{doc\.distance\}\s*<\/span>\s*<\/div>\s*<div className="flex items-center gap-1">/,
  `{doc.distance || 'Near you'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">`
);

code = code.replace(
  /<span>Fees: \{doc\.consultationFee\}<\/span>/,
  `<span>Fees: {doc.consultationFee || '₹500'}</span>`
);

// Update booking handle function
const newHandleBook = `const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDoctor) return;
    
    setBookingError(null);
    setIsBooking(true);
    try {
      await bookDoctorAppointment(
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
      setBookingSuccessModal(\`Appointment confirmed with \${selectedDoctor.name} for \${bookingDate} at \${bookingTime}.\`);
    } catch (err: any) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };`;

code = code.replace(
  /const handleBookAppointment = async \(e: React\.FormEvent\) => \{[\s\S]*?\} finally \{\s*setIsBooking\(false\);\s*\}\s*\};/,
  newHandleBook
);

// Update Date Picker to handle available_days
// The user asks: "Only allow dates that match the doctor's available_days."
// We can use the 'onChange' or HTML date input to validate, or a custom approach.
// Since standard <input type="date"> doesn't support disabling specific days of week easily without custom logic,
// let's add a JS validation on change and set custom validity or an error message.

const datePickerHTML = `<div className="col-span-2 text-rose-600 text-xs font-bold">{bookingError}</div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        const dateObj = new Date(val);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        const availDays = selectedDoctor?.available_days || [];
                        const daysArray = Array.isArray(availDays) ? availDays : availDays.split(',').map((d:string)=>d.trim());
                        if (daysArray.length > 0 && !daysArray.includes(dayName)) {
                          setBookingError(\`Doctor is only available on: \${daysArray.join(', ')}\`);
                          setBookingDate("");
                        } else {
                          setBookingError(null);
                          setBookingDate(val);
                        }
                      }}
                      className="w-full bg-white border border-[#D8E2DA] focus:border-[#1F4E46] focus:ring-1 focus:ring-[#1F4E46] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Time</label>
                    <select 
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-white border border-[#D8E2DA] focus:border-[#1F4E46] focus:ring-1 focus:ring-[#1F4E46] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    >
                      <option value="">Select time</option>
                      {availableSlots.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <option key={slot} value={slot} disabled={isBooked}>
                            {slot} {isBooked ? '(Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>`;

code = code.replace(
  /<div className="grid grid-cols-2 gap-3">\s*<div>\s*<label className="block text-xs font-bold text-\[#2A3D34\] mb-1">Date<\/label>[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/,
  `<div className="grid grid-cols-2 gap-3">\n${datePickerHTML}\n</div>`
);

fs.writeFileSync('src/components/NearbyDirectorySection.tsx', code);
console.log("Updated NearbyDirectorySection.tsx");
