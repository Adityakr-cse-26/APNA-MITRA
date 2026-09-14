const fs = require('fs');
let code = fs.readFileSync('src/components/RegistrationModal.tsx', 'utf8');

const tab2Code = `
          {/* TAB 2: Elderly Details */}
          {activeTab === "elderly" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#153A34]">B. Elderly (User) Profile Details</h3>
                  <p className="text-xs text-[#586C62]">Personalized medical records &amp; lifestyle preferences</p>
                </div>
                <span className="text-[10px] bg-[#EBF3EF] text-[#1F4E46] px-2.5 py-1 rounded-full font-bold">
                  User Form
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Senior's Full Name *</label>
                  <input
                    type="text"
                    value={elderlyName}
                    onChange={(e) => setElderlyName(e.target.value)}
                    placeholder="e.g. Ramakant Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Primary Phone Number *</label>
                  <input
                    type="tel"
                    value={elderlyPhone}
                    onChange={(e) => setElderlyPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Age</label>
                    <input
                      type="number"
                      value={elderlyAge}
                      onChange={(e) => setElderlyAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Gender</label>
                    <select
                      value={elderlyGender}
                      onChange={(e) => setElderlyGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Blood</label>
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      placeholder="e.g. B+"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#2A3D34] mb-1">
                  Basic Health Information (Medical conditions, ongoing medications)
                </label>
                <textarea
                  rows={2}
                  value={basicHealthInfo}
                  onChange={(e) => setBasicHealthInfo(e.target.value)}
                  placeholder="e.g. Mild Hypertension, Type 2 Diabetes, Knee joint stiffness..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2A3D34] mb-1">
                  Passion, Lifestyle &amp; Hobbies
                </label>
                <textarea
                  rows={2}
                  value={passionsLifestyle}
                  onChange={(e) => setPassionsLifestyle(e.target.value)}
                  placeholder="e.g. Morning walk in park, Classical music, Gardening, Spiritual reading, Sudoku..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                />
              </div>
              
              <div className="pt-4 mt-4 border-t border-[#E2E4E0]">
                <h4 className="text-sm font-bold text-[#153A34] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Contact Name *</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Relationship *</label>
                    <input
                      type="text"
                      value={emergencyContactRelationship}
                      onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                      placeholder="e.g. Son"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#1F4E46]"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-800 text-sm">Emergency Web Push Notifications</h4>
                      <p className="text-xs text-emerald-600 mt-1">Receive instant SOS alerts on this device when the patient needs help.</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { subscribeUserToPush } = await import("../utils/webPush");
                          const { savePushSubscription } = await import("../services/db");
                          const sub = await subscribeUserToPush();
                          alert("Push subscription generated! Please save the profile to link it.");
                          (window as any).__pendingPushSubscription = sub;
                        } catch (e) {
                          console.error("Push Sub Error:", e);
                          alert("Failed to enable notifications: " + e.message + "\\n\\nIMPORTANT: Web Push Notifications do not work inside the AI Studio preview iframe. Please open the app in a New Tab and try again.");
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#F3F5F4] mt-2">
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
              </div>
            </div>
          )}
`;

code = code.replace(
  '{/* TAB 3: Caretakers Details */}',
  tab2Code + '\n          {/* TAB 3: Caretakers Details */}'
);

fs.writeFileSync('src/components/RegistrationModal.tsx', code);
