const fs = require('fs');
let code = fs.readFileSync('src/components/RegistrationModal.tsx', 'utf8');

const target = `              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F3F5F4] mt-2">
                <div className="flex items-center gap-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  ><X className="w-3.5 h-3.5" /> Close</button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("welcome")}
                    className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                  >
                    ← Back
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("caretakers")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Caretaker Details</span>
                  <span>→</span>
                </button>
              </div>`;

const replace = `              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#F3F5F4] mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("elderly")}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Proceed to Elderly Details</span>
                  <span>→</span>
                </button>
              </div>`;

if (code.includes(target)) {
  code = code.replace(target, replace);
  fs.writeFileSync('src/components/RegistrationModal.tsx', code);
  console.log("Success");
} else {
  console.log("Target not found");
}
