import fs from 'fs';

let code = fs.readFileSync('src/components/SpreadsheetViewModal.tsx', 'utf8');

// Add Heart Pulse Icon
code = code.replace(
  'X, Table2, Activity, Pill, Calendar as CalendarIcon, ClipboardList',
  'X, Table2, Activity, Pill, Calendar as CalendarIcon, ClipboardList, HeartPulse'
);

// Add health_checks state
code = code.replace(
  'const [checkins, setCheckins] = useState<any[]>([]);',
  'const [checkins, setCheckins] = useState<any[]>([]);\n  const [healthChecks, setHealthChecks] = useState<any[]>([]);'
);

// Update activeTab type
code = code.replace(
  'const [activeTab, setActiveTab] = useState<"vitals" | "medications" | "appointments" | "checkins">("vitals");',
  'const [activeTab, setActiveTab] = useState<"vitals" | "medications" | "appointments" | "checkins" | "health_checks">("vitals");'
);

// Add fetch
code = code.replace(
  'const checkinsSnap = await getDocs(collection(db, `users/${user.uid}/checkins`));\n        setCheckins(checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));',
  'const checkinsSnap = await getDocs(collection(db, `users/${user.uid}/checkins`));\n        setCheckins(checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n        \n        const hcSnap = await getDocs(collection(db, `users/${user.uid}/health_checks`));\n        setHealthChecks(hcSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));'
);

// Add tab button
const checkinTabBtn = `<button
            onClick={() => setActiveTab("checkins")}
            className={\`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap \${
              activeTab === "checkins" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }\`}
          >
            <ClipboardList className="w-4 h-4" /> Daily Check-ins
          </button>`;
const hcTabBtn = `<button
            onClick={() => setActiveTab("health_checks")}
            className={\`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap \${
              activeTab === "health_checks" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }\`}
          >
            <HeartPulse className="w-4 h-4" /> AI Health Checks
          </button>`;
          
code = code.replace(checkinTabBtn, checkinTabBtn + '\\n          ' + hcTabBtn);

// Add Table Body
const hcTable = `{activeTab === "health_checks" && (
                  <>
                    <thead className="bg-[#EEF3EA] text-[#153A34] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 border-b border-[#D8E2DA]">Date</th>
                        <th className="p-3 border-b border-[#D8E2DA]">Symptoms</th>
                        <th className="p-3 border-b border-[#D8E2DA]">Urgency</th>
                        <th className="p-3 border-b border-[#D8E2DA]">Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthChecks.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-stone-500">No data found</td></tr> : null}
                      {healthChecks.map(hc => (
                        <tr key={hc.id} className="border-b border-[#EEF3EA] hover:bg-stone-50">
                          <td className="p-3 font-mono text-[#3A4E45]">{new Date(hc.createdAt?.seconds * 1000).toLocaleDateString() || "Unknown"}</td>
                          <td className="p-3 font-bold">{hc.symptoms}</td>
                          <td className="p-3">
                            <span className={\`px-2 py-1 rounded-md \${hc.urgencyColor === 'rose' ? 'bg-rose-100 text-rose-800' : hc.urgencyColor === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}\`}>
                              {hc.urgency}
                            </span>
                          </td>
                          <td className="p-3 text-[#3A4E45]">{hc.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}`;
                
code = code.replace('</table>', hcTable + '\\n              </table>');

fs.writeFileSync('src/components/SpreadsheetViewModal.tsx', code);
console.log("Patched SpreadsheetViewModal.tsx");
