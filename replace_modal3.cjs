const fs = require('fs');
let code = fs.readFileSync('src/components/NearbyDirectorySection.tsx', 'utf8');

const newModal = `        {/* Booking feedback modal / toast */}
        {confirmedAppointment && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#D8E2DA] space-y-6 animate-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-center text-[#153A34] text-2xl mb-1 tracking-tight">Appointment Confirmed ✓</h4>
                <p className="text-center text-stone-500 font-medium text-sm">Your booking was successful</p>
              </div>
              
              <div className="bg-stone-50 rounded-2xl p-5 space-y-3 border border-stone-100">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">ID</span>
                  <span className="font-mono text-sm text-[#153A34] font-bold">{confirmedAppointment.id.slice(0,8).toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
                  <div className="text-stone-500 font-medium">Doctor:</div>
                  <div className="text-[#153A34] font-bold text-right">{confirmedAppointment.doctorName}</div>
                  
                  <div className="text-stone-500 font-medium">Specialization:</div>
                  <div className="text-[#153A34] font-bold text-right truncate" title={confirmedAppointment.specialization}>{confirmedAppointment.specialization}</div>
                  
                  <div className="text-stone-500 font-medium">Date:</div>
                  <div className="text-[#153A34] font-bold text-right">{confirmedAppointment.date}</div>
                  
                  <div className="text-stone-500 font-medium">Time:</div>
                  <div className="text-[#153A34] font-bold text-right">{confirmedAppointment.time}</div>
                  
                  <div className="text-stone-500 font-medium">Status:</div>
                  <div className="text-emerald-600 font-bold text-right flex items-center justify-end gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Confirmed
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setConfirmedAppointment(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 bg-[#1F4E46] text-white rounded-xl font-bold text-sm hover:bg-[#153A34] transition shadow-sm"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => {
                    setConfirmedAppointment(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 bg-white text-[#1F4E46] border border-[#1F4E46]/20 rounded-xl font-bold text-sm hover:bg-stone-50 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};`;

const splitCode = code.split('{/* Booking feedback modal / toast */}');
code = splitCode[0] + newModal;
fs.writeFileSync('src/components/NearbyDirectorySection.tsx', code);
