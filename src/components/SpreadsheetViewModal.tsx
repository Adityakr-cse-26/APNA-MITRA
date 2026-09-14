import { formatDateTime } from "../utils/healthCalculations";
import { fetchVitalsData } from "../services/db";
import React, { useState, useEffect } from "react";
import { X, Table2, Activity, Pill, Calendar as CalendarIcon, ClipboardList, HeartPulse } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

interface SpreadsheetViewModalProps {
  onClose: () => void;
  user: User | null;
}

export const SpreadsheetViewModal: React.FC<SpreadsheetViewModalProps> = ({ onClose, user }) => {
  const [activeTab, setActiveTab] = useState<"vitals" | "medications" | "appointments" | "checkins" | "health_checks">("vitals");
  
  const [vitals, setVitals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        try {
          const vList = await fetchVitalsData(user.id);
          setVitals(vList);
        } catch (err) {
          console.error("Vitals error", err);
        }
        
        const { data: medsList } = await supabase.from('medications').select('*').eq('patient_id', user.id);
        if (medsList) setMedications(medsList);
        
        const { data: apptsList } = await supabase.from('appointments').select('*').eq('patient_id', user.id);
        if (apptsList) setAppointments(apptsList);
        
        const { data: checkinsList } = await supabase.from('daily_checkins').select('*').eq('patient_id', user.id);
        if (checkinsList) setCheckins(checkinsList);
        
        const { data: checksList } = await supabase.from('health_checks').select('*').eq('patient_id', user.id);
        if (checksList) setHealthChecks(checksList);
      } catch (err) {
        console.error("Error fetching data for spreadsheet view", err);
      }
      setIsLoading(false);
    };
    
    fetchData();
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#F3F5F4] flex justify-between items-center bg-[#F8FAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F4E46] flex items-center justify-center">
              <Table2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#153A34] font-serif">Database Excel View</h2>
              <p className="text-xs text-[#586C62]">View all your health records in a spreadsheet format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F3F5F4] hover:bg-[#DCEAE4] flex items-center justify-center text-[#153A34] font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 bg-white border-b border-[#F3F5F4] overflow-x-auto">
          <button
            onClick={() => setActiveTab("vitals")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "vitals" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Activity className="w-4 h-4" /> Vitals Log
          </button>
          <button
            onClick={() => setActiveTab("medications")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "medications" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <Pill className="w-4 h-4" /> Medications
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "appointments" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> Appointments
          </button>
          <button
            onClick={() => setActiveTab("checkins")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "checkins" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Daily Check-ins
          </button>\n          <button
            onClick={() => setActiveTab("health_checks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "health_checks" ? "bg-[#1F4E46] text-white" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            <HeartPulse className="w-4 h-4" /> AI Health Checks
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#F8FAF8]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-[#1F4E46] text-sm font-bold animate-pulse">
              Loading Spreadsheet...
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E2E4E0] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                {activeTab === "vitals" && (
                  <>
                    <thead className="bg-[#F3F5F4] text-[#153A34] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 border-b border-[#E2E4E0]">Date/Time</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Type</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Value</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-stone-500">No data found</td></tr> : null}
                      {vitals.map(v => (
                        <tr key={v.id} className="border-b border-[#F3F5F4] hover:bg-stone-50">
                          <td className="p-3 font-mono text-[#3A4E45]">{formatDateTime(v.timestamp)}</td>
                          <td className="p-3 font-bold text-[#1F4E46] uppercase">{v.type}</td>
                          <td className="p-3 font-mono">{v.value} {v.unit}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-md ${v.status === 'alert' ? 'bg-rose-100 text-rose-800' : v.status === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
                {activeTab === "medications" && (
                  <>
                    <thead className="bg-[#F3F5F4] text-[#153A34] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 border-b border-[#E2E4E0]">Medicine Name</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Dosage</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Timing</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Taken Today</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medications.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-stone-500">No data found</td></tr> : null}
                      {medications.map(m => (
                        <tr key={m.id} className="border-b border-[#F3F5F4] hover:bg-stone-50">
                          <td className="p-3 font-bold text-[#1F4E46]">{m.name}</td>
                          <td className="p-3 text-[#3A4E45]">{m.dosage}</td>
                          <td className="p-3 text-[#3A4E45]">{m.timing}</td>
                          <td className="p-3">{m.takenToday ? '✅ Yes' : '❌ No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
                {activeTab === "appointments" && (
                  <>
                    <thead className="bg-[#F3F5F4] text-[#153A34] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 border-b border-[#E2E4E0]">Date & Time</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Doctor</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Hospital</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-stone-500">No data found</td></tr> : null}
                      {appointments.map(a => (
                        <tr key={a.id} className="border-b border-[#F3F5F4] hover:bg-stone-50">
                          <td className="p-3 font-mono text-[#3A4E45]">{a.appointment_date} {a.appointment_time}</td>
                          <td className="p-3 font-bold text-[#1F4E46]">{a.doctorName}</td>
                          <td className="p-3 text-[#3A4E45]">{a.hospital}</td>
                          <td className="p-3">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
                {activeTab === "checkins" && (
                  <>
                    <thead className="bg-[#F3F5F4] text-[#153A34] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 border-b border-[#E2E4E0]">Date</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Mood</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkins.length === 0 ? <tr><td colSpan={3} className="p-5 text-center text-stone-500">No data found</td></tr> : null}
                      {checkins.map(c => (
                        <tr key={c.id} className="border-b border-[#F3F5F4] hover:bg-stone-50">
                          <td className="p-3 font-mono text-[#3A4E45]">{c.date}</td>
                          <td className="p-3 font-bold uppercase">{c.mood}</td>
                          <td className="p-3 text-[#3A4E45]">{c.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              {activeTab === "health_checks" && (
                  <>
                    <thead className="bg-[#F3F5F4] text-[#153A34] uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 border-b border-[#E2E4E0]">Date</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Symptoms</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Urgency</th>
                        <th className="p-3 border-b border-[#E2E4E0]">Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthChecks.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-stone-500">No data found</td></tr> : null}
                      {healthChecks.map(hc => (
                        <tr key={hc.id} className="border-b border-[#F3F5F4] hover:bg-stone-50">
                          <td className="p-3 font-mono text-[#3A4E45]">{hc.createdAt?.seconds ? new Date(hc.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}</td>
                          <td className="p-3 font-bold">{hc.symptoms}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-md ${hc.urgencyColor === 'rose' ? 'bg-rose-100 text-rose-800' : hc.urgencyColor === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {hc.urgency}
                            </span>
                          </td>
                          <td className="p-3 text-[#3A4E45]">{hc.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
