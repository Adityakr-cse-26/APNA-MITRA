import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Pill, 
  Clock, 
  Check, 
  Plus, 
  Trash2, 
  Bell, 
  BellRing, 
  BellOff, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Info,
  Smartphone,
  Volume2,
  ExternalLink,
  Zap,
  ListOrdered,
  Send,
  MessageSquare,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { Medication, Language, ElderlyProfile } from "../types";
import { 
  getNextUpcomingMedication, 
  formatTimeForDisplay, 
  normalizeTimeTo24Hour 
} from "../utils/medicationScheduler";
import { 
  playAlarmSequence, 
  speakAlarmMessage 
} from "../utils/alarmAudio";
import { 
  isPushNotificationSupported, 
  getNotificationPermission, 
  subscribeUserToPush, 
  getCurrentPushSubscription,
  unsubscribeUserFromPush
} from "../utils/webPush";
import { 
  savePushSubscription, 
  updateRemindersEnabled, 
  getPatientReminderSettings 
} from "../services/db";
import { maskPhoneNumber } from "../utils/phoneUtils";
import { searchMedicines, MedicineSuggestion } from "../data/commonMedicines";

interface MedicineReminderModalProps {
  currentLang: Language;
  userId?: string;
  profile?: ElderlyProfile;
  medications: Medication[];
  onToggleMedication: (id: string) => void;
  onAddMedication: (med: Omit<Medication, "id" | "takenToday">) => void;
  onDeleteMedication: (id: string) => void;
  onClose: () => void;
  onTestAlarmNow?: (med?: Medication) => void;
}

export const MedicineReminderModal: React.FC<MedicineReminderModalProps> = ({
  currentLang,
  userId,
  profile,
  medications,
  onToggleMedication,
  onAddMedication,
  onDeleteMedication,
  onClose,
  onTestAlarmNow,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState<Medication["timing"]>("Morning");
  const [scheduledTime, setScheduledTime] = useState("08:00");
  const [instructions, setInstructions] = useState("After Food");
  const [frequency, setFrequency] = useState<"daily" | "once" | "weekly" | "twice_daily">("daily");
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [smsEnabledForMed, setSmsEnabledForMed] = useState(true);

  // Medicine Autocomplete Dropdown State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const matchingMedicines = useMemo(() => {
    if (!name || name.trim().length === 0) return [];
    return searchMedicines(name);
  }, [name]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectMedicine = (med: MedicineSuggestion) => {
    setName(med.name);
    if (!dosage.trim() || dosage === "1 tablet") {
      setDosage(med.defaultDosage);
    }
    if (med.instructions && (instructions === "After Food" || !instructions.trim())) {
      setInstructions(med.instructions);
    }
    if (med.timing) {
      setTiming(med.timing);
      setScheduledTime(normalizeTimeTo24Hour(undefined, med.timing));
    }
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || matchingMedicines.length === 0) {
      if (e.key === "ArrowDown" && name.trim().length > 0) {
        setShowSuggestions(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matchingMedicines.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingMedicines.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < matchingMedicines.length) {
        e.preventDefault();
        handleSelectMedicine(matchingMedicines[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Push Notification & Reminder Settings State
  const [pushSupported, setPushSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remindersActive, setRemindersActive] = useState(true);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [testPushMessage, setTestPushMessage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // SMS Master Controls & Audit Logs State
  const [smsMasterActive, setSmsMasterActive] = useState(profile?.smsRemindersEnabled !== false);
  const [testSmsLoading, setTestSmsLoading] = useState(false);
  const [testSmsMessage, setTestSmsMessage] = useState<string | null>(null);
  const [showSmsLogsModal, setShowSmsLogsModal] = useState(false);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [smsLogsLoading, setSmsLogsLoading] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const localTimezone = "Asia/Kolkata";
  const patientId = profile?.patientId || (userId && userId.startsWith("AM-UID-") ? userId : "AM-UID-2026-3210");
  const registeredPhone = profile?.phone || "+91 98765 43210";

  // Check current push notification permission & subscription status on mount
  useEffect(() => {
    const supported = isPushNotificationSupported();
    setPushSupported(supported);
    if (!supported) {
      setPermissionState('unsupported');
      return;
    }

    const currentPerm = getNotificationPermission();
    setPermissionState(currentPerm);

    const checkStatus = async () => {
      try {
        const sub = await getCurrentPushSubscription();
        setIsSubscribed(!!sub);

        if (userId) {
          const settings = await getPatientReminderSettings(userId);
          setRemindersActive(settings.remindersEnabled);
        }
      } catch (err) {
        console.warn("Error reading push status:", err);
      }
    };
    checkStatus();
  }, [userId]);

  // Sync medications with server scheduler whenever medications change
  useEffect(() => {
    if (medications && medications.length > 0) {
      const targetUid = patientId;
      fetch('/api/medication-reminders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: targetUid,
          patient_name: profile?.name,
          patient_phone: profile?.phone,
          caretaker_phone: profile?.caretakers?.[0]?.phone,
          sms_enabled: smsMasterActive,
          medications,
          timezone: localTimezone,
        }),
      }).catch((e) => console.warn("Medication sync notice:", e));
    }
  }, [medications, patientId, profile, smsMasterActive, localTimezone]);

  // Update default scheduled time when timing category changes
  const handleTimingChange = (newTiming: Medication["timing"]) => {
    setTiming(newTiming);
    if (newTiming === "Morning") setScheduledTime("08:00");
    else if (newTiming === "Afternoon") setScheduledTime("13:00");
    else if (newTiming === "Evening") setScheduledTime("18:00");
    else if (newTiming === "Night") setScheduledTime("21:00");
  };

  const takenCount = medications.filter((m) => m.takenToday).length;
  const totalCount = medications.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  // Next upcoming medication reminder
  const nextReminder = getNextUpcomingMedication(medications);

  const handleToggle = (id: string, currentState: boolean) => {
    onToggleMedication(id);
    if (!currentState) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddMedication({
      patientId,
      name: name.trim(),
      dosage: dosage.trim() || "1 tablet",
      timing,
      instructions: instructions.trim() || "As directed by physician",
      scheduledTime: scheduledTime || normalizeTimeTo24Hour(undefined, timing),
      frequency,
      date: frequency === "once" ? scheduledDate : undefined,
      smsEnabled: smsEnabledForMed,
      reminderStatus: "Scheduled",
    });

    setName("");
    setDosage("");
    setScheduledTime("08:00");
    setFrequency("daily");
    setSmsEnabledForMed(true);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setShowAddForm(false);
  };

  // Toggle Master SMS Reminders
  const handleToggleMasterSms = async () => {
    const nextState = !smsMasterActive;
    setSmsMasterActive(nextState);
    try {
      await fetch("/api/medication-reminders/toggle-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          enabled: nextState,
        }),
      });
    } catch (e) {
      console.warn("Error toggling SMS master:", e);
    }
  };

  // Send Direct Test SMS to Registered Indian Mobile
  const handleSendTestSms = async () => {
    setTestSmsLoading(true);
    setTestSmsMessage(null);
    try {
      const sampleMed = medications[0] || { name: "Metformin", dosage: "500mg", timing: "Morning", scheduledTime: "08:00 AM" };
      const res = await fetch("/api/medication-reminders/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          phone: registeredPhone,
          medicine_name: sampleMed.name,
          dosage: sampleMed.dosage,
          timing: sampleMed.timing,
          scheduled_time: sampleMed.scheduledTime || "08:00 AM",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestSmsMessage(`SMS successfully dispatched to ${maskPhoneNumber(registeredPhone)}! (${data.status.toUpperCase()})`);
      } else {
        setTestSmsMessage(`Delivery notice: ${data.error || "Simulated dispatch recorded"}`);
      }
    } catch (e: any) {
      setTestSmsMessage(`Error: ${e?.message || "Failed to trigger test SMS"}`);
    } finally {
      setTestSmsLoading(false);
      setTimeout(() => setTestSmsMessage(null), 7000);
    }
  };

  // Fetch SMS Logs for this Patient
  const handleOpenSmsLogs = async () => {
    setShowSmsLogsModal(true);
    setSmsLogsLoading(true);
    try {
      const res = await fetch(`/api/medication-reminders/sms-logs?patient_id=${patientId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setSmsLogs(data.logs);
      }
    } catch (err) {
      console.warn("Failed to fetch logs:", err);
    } finally {
      setSmsLogsLoading(false);
    }
  };

  // Enable Browser Push Reminders
  const handleEnablePushNotifications = async () => {
    setIsEnablingPush(true);
    setPermissionError(null);
    setTestPushMessage(null);

    try {
      if (!isPushNotificationSupported()) {
        setPermissionState('unsupported');
        setPermissionError("Push notifications are not supported by this browser. In-app audio alarms and SMS alerts remain active.");
        return;
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
        setPermissionState('denied');
        setPermissionError("Notifications are blocked in your browser address bar settings. In-app voice alarms & SMS alerts remain active. Click the lock or settings icon next to the URL to allow notifications.");
        return;
      }

      const subscription = await subscribeUserToPush();
      setIsSubscribed(true);
      setPermissionState('granted');
      setRemindersActive(true);

      const targetUid = patientId;
      if (userId) {
        await savePushSubscription(userId, subscription);
        await updateRemindersEnabled(userId, true);
      }

      // Sync push subscription to backend server
      try {
        await fetch('/api/push-subscriptions/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: targetUid,
            subscription: subscription.toJSON ? subscription.toJSON() : subscription,
            timezone: localTimezone,
          }),
        });
      } catch (saveErr) {
        console.warn("Server subscription sync notice:", saveErr);
      }

      setTestPushMessage("Push notifications successfully activated!");
    } catch (err: any) {
      console.warn("Push enable notice:", err?.message || err);
      const isDenied = (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') ||
        (err?.message && err.message.toLowerCase().includes("denied"));
      if (isDenied) {
        setPermissionState('denied');
        setPermissionError("Notifications blocked in browser settings. In-app audio alarms & SMS alerts remain active!");
      } else {
        setPermissionError(err?.message || "Failed to enable notifications. In-app voice alarms remain active.");
      }
    } finally {
      setIsEnablingPush(false);
    }
  };

  // Toggle push reminders active state
  const handleToggleReminders = async () => {
    const nextState = !remindersActive;
    setRemindersActive(nextState);
    if (userId) {
      await updateRemindersEnabled(userId, nextState);
    }
  };

  // Send a test alarm to push + registered phone
  const handleSendTestAlarm = async () => {
    setTestPushLoading(true);
    setTestPushMessage(null);
    try {
      const res = await fetch("/api/medication-reminders/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patientId,
          phone: registeredPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestPushMessage(data.message || "Test alarm sent successfully!");
      } else {
        setTestPushMessage(data.error || "Failed to send test alarm");
      }
    } catch (e: any) {
      setTestPushMessage(e?.message || "Network error sending test alarm");
    } finally {
      setTestPushLoading(false);
      setTimeout(() => setTestPushMessage(null), 6000);
    }
  };

  // Quick test audible alarm chime
  const handleTestSoundAndScreen = (sampleMed?: Medication) => {
    playAlarmSequence();
    speakAlarmMessage(sampleMed?.name || "Metformin", currentLang);
    if (onTestAlarmNow) {
      onTestAlarmNow(sampleMed || medications[0]);
    }
  };

  const handleSetQuickTestTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    setScheduledTime(`${h}:${m}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-[#E2E4E0] my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medicine-tracker-heading"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3F5F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] flex items-center justify-center text-[#1F4E46]">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="medicine-tracker-heading" className="text-lg sm:text-xl font-bold text-[#153A34] font-serif">
                  Medication Tracker &amp; SMS Alarms
                </h3>
                <span className="text-[10px] font-mono bg-stone-100 text-stone-700 font-bold px-2 py-0.5 rounded-md border border-stone-200">
                  ID: {patientId}
                </span>
              </div>
              <p className="text-xs text-[#5B6B60]">
                Automated Indian SMS reminders &amp; real-time alarm triggers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F3F5F4] hover:bg-[#DCEAE4] flex items-center justify-center text-[#153A34] font-bold transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Indian Mobile SMS Reminder System Banner */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Automatic SMS Reminders (India +91)</span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                Dedicated Route
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={testSmsLoading}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-lg border border-emerald-300 transition flex items-center gap-1 shadow-2xs"
                title="Send a sample reminder SMS to the patient's registered Indian mobile"
              >
                {testSmsLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <Send className="w-3 h-3 text-emerald-700" />
                )}
                <span>Test SMS Now</span>
              </button>

              <button
                type="button"
                onClick={handleOpenSmsLogs}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 font-semibold text-[11px] rounded-lg border border-stone-300 transition flex items-center gap-1 shadow-2xs"
                title="View SMS delivery logs and timestamps"
              >
                <ListOrdered className="w-3 h-3 text-stone-600" />
                <span>Audit Logs</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMasterSms}
                className={`px-3 py-1 font-bold text-[11px] rounded-lg border transition ${
                  smsMasterActive 
                    ? "bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800" 
                    : "bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300"
                }`}
              >
                {smsMasterActive ? "SMS: ACTIVE" : "SMS: PAUSED"}
              </button>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-emerald-900">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Destination: <strong>{maskPhoneNumber(registeredPhone)}</strong> (strictly isolated to Patient {patientId})</span>
            </div>
            <span className="text-emerald-700 text-[10px]">Timezone: Asia/Kolkata (IST)</span>
          </div>

          {testSmsMessage && (
            <div className="mt-2 p-2 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-900 font-medium text-[11px] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{testSmsMessage}</span>
            </div>
          )}
        </div>

        {/* Browser Push & Audible Audio Controls */}
        <div className="mt-2.5 p-3 rounded-2xl border border-stone-200 bg-stone-50/70 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-stone-700" />
            <span className="font-semibold text-stone-800">Voice &amp; Audio Alarm</span>
            <span className="text-[11px] text-stone-500">• Loud chime &amp; spoken dosage reminder</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestSoundAndScreen()}
              className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium text-[11px] rounded-lg transition flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3 text-stone-700" />
              <span>Test Audio Alarm</span>
            </button>

            {permissionState !== 'granted' && (
              permissionState === 'denied' ? (
                <span 
                  className="px-2.5 py-1 bg-amber-100/90 text-amber-900 border border-amber-200 text-[11px] rounded-lg font-medium flex items-center gap-1 cursor-default" 
                  title="Browser notifications are blocked. Audio alarms and SMS reminders remain fully active."
                >
                  <BellOff className="w-3 h-3 text-amber-700" />
                  <span>In-App &amp; Audio Alarms Active</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleEnablePushNotifications}
                  disabled={isEnablingPush}
                  className="px-2.5 py-1 bg-[#1F4E46] hover:bg-[#153A34] text-white font-medium text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Bell className="w-3 h-3 text-emerald-200" />
                  <span>{isEnablingPush ? "Enabling..." : "Enable Browser Push"}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Upcoming Next Reminder Card */}
        {nextReminder && (
          <div className="mt-3 p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Next Scheduled Reminder
                </span>
                <div className="text-sm font-bold text-emerald-950">
                  {nextReminder.medication.name} ({nextReminder.medication.dosage}) • {nextReminder.timeDisplay}
                </div>
                <div className="text-[11px] text-emerald-800/90 flex items-center gap-2 mt-0.5">
                  <span>{nextReminder.medication.instructions}</span>
                  <span>•</span>
                  <span className="font-semibold">{nextReminder.medication.frequency || "Daily"}</span>
                  {nextReminder.medication.smsEnabled !== false && (
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded font-medium">
                      SMS Enabled
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!nextReminder.medication.takenToday && (
              <button
                type="button"
                onClick={() => handleToggle(nextReminder.medication.id, false)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Taken</span>
              </button>
            )}
          </div>
        )}

        {/* Adherence Summary Banner */}
        <div className="my-3 p-3 bg-[#FAFAFA] rounded-2xl border border-[#E2E4E0] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#5B6B60] uppercase tracking-wider block">
              Today&apos;s Adherence
            </span>
            <div className="text-base sm:text-lg font-bold text-[#153A34] font-serif">
              {takenCount} of {totalCount} doses taken ({progressPercent}%)
            </div>
          </div>

          <div className="w-10 h-10 rounded-full border-4 border-emerald-600 bg-white flex items-center justify-center text-xs font-bold text-emerald-800 shadow-2xs">
            {progressPercent}%
          </div>
        </div>

        {/* Medication List */}
        <div className="space-y-2 max-h-52 sm:max-h-64 overflow-y-auto pr-1">
          {medications.length === 0 ? (
            <div className="p-6 text-center text-stone-500 border border-dashed border-stone-200 rounded-2xl">
              <Pill className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-stone-600">No medications added yet</p>
              <p className="text-[11px] text-stone-400">Click &quot;Add New Medicine&quot; below to setup automatic SMS and alarm schedules.</p>
            </div>
          ) : (
            medications.map((med) => {
              const displayTime = formatTimeForDisplay(med.scheduledTime, med.timing);
              return (
                <div
                  key={med.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    med.takenToday
                      ? "bg-[#FAFAFA] border-emerald-200 opacity-85"
                      : "bg-white border-[#E2E4E0] hover:border-[#1F4E46]/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(med.id, med.takenToday)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition mt-0.5 flex-shrink-0 ${
                        med.takenToday
                          ? "bg-emerald-600 border-emerald-700 text-white"
                          : "bg-white border-[#B4C6BB] text-transparent hover:border-[#1F4E46]"
                      }`}
                      title={med.takenToday ? "Mark as not taken" : "Mark as taken"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${med.takenToday ? "line-through text-[#5B6B60]" : "text-[#153A34]"}`}>
                          {med.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#F3F5F4] text-[#1F4E46] rounded">
                          {med.dosage}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded capitalize">
                          {med.frequency || "daily"}
                        </span>
                        {med.smsEnabled !== false && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            📱 SMS
                          </span>
                        )}
                        {med.takenToday && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Taken Today
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#5B6B60] mt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-[#1F4E46] bg-emerald-50/70 px-1.5 py-0.5 rounded">
                          <Clock className="w-2.5 h-2.5 text-emerald-700" />
                          <span>{displayTime}</span>
                          <span className="text-[#5B6B60] font-normal">({med.timing})</span>
                        </span>
                        {med.date && <span className="text-[10px] text-stone-400">({med.date})</span>}
                        <span>•</span>
                        <span className="truncate max-w-[160px] sm:max-w-xs">{med.instructions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTestSoundAndScreen(med)}
                      className="p-1.5 text-[#5B6B60] hover:text-[#1F4E46] hover:bg-[#EBF3EF] rounded-lg transition"
                      title="Test Audio Alarm for this medicine"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMedication(med.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete medicine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Medication Form */}
        {showAddForm ? (
          <form onSubmit={handleAddMed} className="mt-3 p-3.5 bg-[#FAFAFA] rounded-2xl border border-[#E2E4E0] space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#153A34]">Add Medication &amp; SMS Schedule</h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-[11px] text-stone-500 hover:text-stone-700 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-[#5B6B60] uppercase">
                  Medicine Name *
                </label>
                {name.trim().length >= 1 && (
                  <span className="text-[10px] text-[#1F4E46] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    First letter '{name.trim()[0].toUpperCase()}' suggestions
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(e.target.value.trim().length >= 1);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (name.trim().length >= 1) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type first letter (e.g. A, M, P, T, S) or full name..."
                className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46] transition"
                autoComplete="off"
              />

              {/* Autocomplete Dropdown */}
              {showSuggestions && name.trim().length >= 1 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#D5DDD8] rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 bg-[#F6FAF7] border-b border-stone-200/60 flex items-center justify-between text-[11px] text-[#1F4E46]">
                    <span className="font-bold flex items-center gap-1">
                      <Pill className="w-3 h-3 text-[#1F4E46]" />
                      Medicines matching '{name.trim()[0].toUpperCase()}':
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {matchingMedicines.length} found
                    </span>
                  </div>

                  {matchingMedicines.length > 0 ? (
                    matchingMedicines.map((med, idx) => {
                      const isSelected = idx === selectedIndex;
                      const queryStr = name.trim();
                      const lowerName = med.name.toLowerCase();
                      const lowerQuery = queryStr.toLowerCase();
                      const matchIdx = lowerName.indexOf(lowerQuery);

                      return (
                        <button
                          key={`${med.name}-${idx}`}
                          type="button"
                          onClick={() => handleSelectMedicine(med)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                            isSelected ? "bg-[#EBF3EF] text-[#153A34]" : "hover:bg-stone-50 text-stone-800"
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-stone-900">
                              {matchIdx >= 0 ? (
                                <>
                                  {med.name.slice(0, matchIdx)}
                                  <span className="text-[#1F4E46] font-extrabold underline decoration-2 decoration-emerald-500">
                                    {med.name.slice(matchIdx, matchIdx + queryStr.length)}
                                  </span>
                                  {med.name.slice(matchIdx + queryStr.length)}
                                </>
                              ) : (
                                med.name
                              )}
                            </span>
                            <span className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                              <span className="font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                                {med.category}
                              </span>
                              {med.instructions && (
                                <span>• {med.instructions}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                              {med.defaultDosage}
                            </span>
                            <span className="text-[10px] text-[#1F4E46] font-bold">
                              Select ↵
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-stone-500">
                      <p>No standard medicine found starting with "{name.trim()[0]?.toUpperCase()}".</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">You can keep typing any custom prescription name.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500mg, 1 tab"
                  className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                  Routine Timing
                </label>
                <select
                  value={timing}
                  onChange={(e) => handleTimingChange(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                >
                  <option value="Morning">Morning (Breakfast)</option>
                  <option value="Afternoon">Afternoon (Lunch)</option>
                  <option value="Evening">Evening (Tea/Snack)</option>
                  <option value="Night">Night (Bedtime)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-[#5B6B60] uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#1F4E46]" />
                    <span>Scheduled Time</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSetQuickTestTime}
                    className="text-[9px] text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-1 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5"
                    title="Set time to 1 minute from now to test automated reminder"
                  >
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    <span>Now + 1m</span>
                  </button>
                </div>
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46] font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                >
                  <option value="daily">Daily (Every Day)</option>
                  <option value="once">Once (Specific Date)</option>
                  <option value="weekly">Weekly (Once per week)</option>
                  <option value="twice_daily">Twice Daily</option>
                </select>
              </div>

              {frequency === "once" ? (
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                    Dose Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                    Doctor&apos;s Instructions
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. After food with warm water"
                    className="w-full px-3 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#153A34]">
                <input
                  type="checkbox"
                  checked={smsEnabledForMed}
                  onChange={(e) => setSmsEnabledForMed(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Send Automatic SMS Reminder for this medicine</span>
              </label>

              <span className="text-[11px] text-stone-500">
                Destination: {maskPhoneNumber(registeredPhone)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1F4E46] text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-[#153A34] transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Medication &amp; Activate Automatic Reminders</span>
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full mt-3 py-2.5 bg-[#F3F5F4] hover:bg-[#DCEAE4] text-[#1F4E46] font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 border border-[#B4C6BB] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        )}

        {/* SMS Delivery Audit Logs Modal */}
        {showSmsLogsModal && (
          <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ListOrdered className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">SMS Delivery Audit Trail</h4>
                    <p className="text-[11px] text-stone-500">Patient {patientId} • {maskPhoneNumber(registeredPhone)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSmsLogsModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                {smsLogsLoading ? (
                  <div className="p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Loading audit records...</span>
                  </div>
                ) : smsLogs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-2xl">
                    <MessageSquare className="w-6 h-6 text-stone-300 mx-auto mb-1" />
                    <p className="font-semibold text-stone-700">No SMS reminders sent yet</p>
                    <p className="text-[11px] text-stone-400">Click &quot;Test SMS Now&quot; to test your registered Indian number.</p>
                  </div>
                ) : (
                  smsLogs.map((log: any) => (
                    <div key={log.id} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{log.medicine_name} ({log.dosage})</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          log.status === 'sent' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.status === 'sent' ? '✓ Delivered (Gateway)' : 'Simulated Audit'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 font-mono line-clamp-2 bg-white p-1.5 rounded border border-stone-200">
                        {log.message}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                        <span>To: {maskPhoneNumber(log.to)}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSmsLogsModal(false)}
                  className="px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Disclaimer Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#F3F5F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 text-[11px] text-[#5B6B60]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span>Reminders sent strictly to registered patient phone. Never replaces doctor&apos;s prescription.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#1F4E46] hover:underline self-end sm:self-auto"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
