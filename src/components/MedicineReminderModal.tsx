import React, { useState, useEffect } from "react";
import { 
  Pill, 
  Plus, 
  Check, 
  Clock, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Trash2, 
  Bell,
  BellOff,
  BellRing,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  Smartphone,
  Volume2,
  ExternalLink,
  Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { Medication, Language } from "../types";
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

interface MedicineReminderModalProps {
  currentLang: Language;
  userId?: string;
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

  // Push Notification & Reminder Settings State
  const [pushSupported, setPushSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remindersActive, setRemindersActive] = useState(true);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [testPushMessage, setTestPushMessage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const localTimezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata';

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
      const targetUid = userId || 'anonymous';
      fetch('/api/medication-reminders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: targetUid,
          medications,
          timezone: localTimezone,
        }),
      }).catch((e) => console.warn("Medication sync notice:", e));
    }
  }, [medications, userId, localTimezone]);

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
      name: name.trim(),
      dosage: dosage.trim() || "1 tablet",
      timing,
      instructions: instructions.trim() || "As directed by physician",
      scheduledTime: scheduledTime || normalizeTimeTo24Hour(undefined, timing),
    });

    setName("");
    setDosage("");
    setScheduledTime("08:00");
    setShowAddForm(false);
  };

  // Enable Browser Push Reminders
  const handleEnablePushNotifications = async () => {
    setIsEnablingPush(true);
    setPermissionError(null);
    setTestPushMessage(null);

    try {
      if (!isPushNotificationSupported()) {
        throw new Error("Push notifications are not supported by this browser or in this environment.");
      }

      const subscription = await subscribeUserToPush();
      setIsSubscribed(true);
      setPermissionState('granted');
      setRemindersActive(true);

      const targetUid = userId || 'anonymous';
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

      // Sync active medications schedule to backend server
      try {
        await fetch('/api/medication-reminders/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: targetUid,
            medications,
            timezone: localTimezone,
          }),
        });
      } catch (syncErr) {
        console.warn("Server medications sync notice:", syncErr);
      }

      // Also trigger a local welcome test notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification("💊 Medication Reminders Activated", {
            body: `You will now receive alarm notifications at your scheduled medicine times (${localTimezone}).`,
            icon: "/chatbot-logo.png",
          });
        } catch {
          // In some mobile browsers, constructing Notification directly is restricted to service worker
        }
      }

      setTestPushMessage("✅ Push notifications enabled! You will now receive reminders even if this tab is closed.");
    } catch (err: any) {
      console.error("Enable push error:", err);
      const perm = getNotificationPermission();
      setPermissionState(perm);
      if (perm === 'denied') {
        setPermissionError("Notifications blocked: Please click the lock/settings icon in your browser's address bar, set Notifications to 'Allow', and reload.");
      } else {
        setPermissionError(err?.message || "Failed to enable notifications. Please ensure you are running in a secure window.");
      }
    } finally {
      setIsEnablingPush(false);
    }
  };

  // Toggle active reminders on/off
  const handleToggleReminders = async () => {
    const newState = !remindersActive;
    setRemindersActive(newState);
    if (userId) {
      await updateRemindersEnabled(userId, newState);
    }
    setTestPushMessage(newState ? "Reminders resumed." : "Medication reminder notifications paused.");
  };

  // Test both sound chime, voice announcement, and screen alert
  const handleTestSoundAndScreen = (targetMedicine?: Medication) => {
    const med: Medication = targetMedicine || medications[0] || {
      id: "sample-test",
      name: "Amlodipine",
      dosage: "5mg",
      timing: "Morning",
      takenToday: false,
      instructions: "After breakfast with water",
      scheduledTime: "08:00",
    };

    // 1. Play audible sound chime
    playAlarmSequence();

    // 2. Speak voice announcement
    speakAlarmMessage(med.name, med.dosage, currentLang);

    // 3. Trigger ActiveAlarmModal on screen
    if (onTestAlarmNow) {
      onTestAlarmNow(med);
    }

    // 4. Also trigger browser notification if allowed
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`💊 Medicine Reminder: ${med.name}`, {
          body: `It's time to take ${med.name} (${med.dosage}). ${med.instructions}`,
          icon: "/chatbot-logo.png",
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }

    setTestPushMessage("🔊 Alarm sound & screen preview activated!");
  };

  const handleSetQuickTestTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    setScheduledTime(`${hh}:${mm}`);
    setTestPushMessage(`⚡ Scheduled time set to ${hh}:${mm} (in 1 min). Click "Save Medication" to test the automated alarm!`);
  };

  // Test push alarm notification
  const handleSendTestAlarm = async () => {
    setTestPushLoading(true);
    setTestPushMessage(null);
    setPermissionError(null);

    // Trigger audible chime and active alarm modal immediately
    handleTestSoundAndScreen();

    try {
      // 1. Try server endpoint
      const targetUid = userId || 'anonymous';
      const res = await fetch('/api/medication-reminders/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: targetUid }),
      });

      const data = await res.json();
      if (data.success) {
        setTestPushMessage("🔔 Test alarm chime played and push notification dispatched!");
      } else {
        // Fallback: If no server subscription was found (e.g. guest mode or local dev), trigger via ServiceWorker or Notification API
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TEST_MEDICATION_REMINDER',
            title: "💊 Medicine Reminder (Test Alarm)",
            body: "Medicine Reminder: It's time to take your scheduled medicine. Your reminder system is active!",
          });
        }
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification("💊 Medicine Reminder (Test Alarm)", {
            body: "Medicine Reminder: It's time to take your scheduled medicine. Your reminder system is active!",
            icon: "/chatbot-logo.png",
          });
        }
        setTestPushMessage("🔔 Test alarm sound played and notification triggered!");
      }
    } catch (err: any) {
      console.warn("Test push notice, local fallback active:", err);
      setTestPushMessage("🔔 Test alarm sound & screen triggered locally!");
    } finally {
      setTestPushLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-[#E2E4E0] my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F3F5F4]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shadow-xs">
              <Pill className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#153A34]">
                  Medication Tracker &amp; Reminders
                </h3>
              </div>
              <p className="text-xs text-[#5B6B60]">
                Scheduled medicine times &amp; browser alarm notifications
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

        {/* Browser Push Notification Permission & Status Banner */}
        <div className="mt-4 p-3.5 rounded-2xl border transition-all text-xs">
          {permissionState === 'granted' && isSubscribed ? (
            <div className="bg-emerald-50/70 border border-emerald-200/80 -m-3.5 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <span>Push Reminders Active</span>
                  <span className="text-[11px] font-normal text-emerald-700">({localTimezone})</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSoundAndScreen()}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1"
                    title="Play audible alarm chime and test on-screen alarm popup"
                  >
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    <span>Test Alarm Sound</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestAlarm}
                    disabled={testPushLoading}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-medium text-[11px] rounded-lg border border-emerald-300 transition flex items-center gap-1 shadow-2xs"
                    title="Send a sample reminder to test sound and banner"
                  >
                    {testPushLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <BellRing className="w-3 h-3 text-emerald-600" />
                    )}
                    <span>Test Push</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleReminders}
                    className={`px-2.5 py-1 font-medium text-[11px] rounded-lg border transition ${
                      remindersActive 
                        ? "bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800" 
                        : "bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300"
                    }`}
                  >
                    {remindersActive ? "Alarms ON" : "Alarms PAUSED"}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-emerald-800/80 mt-1.5 flex items-center gap-1">
                <span>🔔 You will receive notifications at scheduled times even if this website tab is closed.</span>
              </p>
            </div>
          ) : permissionState === 'denied' ? (
            <div className="bg-amber-50 border border-amber-200/90 -m-3.5 p-3.5 rounded-2xl text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-amber-950">
                      Notifications Blocked in Browser
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTestSoundAndScreen()}
                      className="px-2 py-0.5 bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-semibold text-[10px] rounded border border-amber-300 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Test In-App Sound</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Your browser has blocked push notifications for this site. To receive medication alarms:
                  </p>
                  <ol className="text-[11px] text-amber-900 list-decimal list-inside space-y-0.5 pt-0.5">
                    <li>Click the <strong>padlock or site settings icon</strong> next to the URL address bar.</li>
                    <li>Change <strong>Notifications</strong> from &quot;Block&quot; to <strong>&quot;Allow&quot;</strong>.</li>
                    <li>Reload this page. (In-app sound alarms still ring while this tab is open).</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-teal-50/70 border border-teal-200 -m-3.5 p-3.5 rounded-2xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-950">
                    <Bell className="w-3.5 h-3.5 text-teal-700" />
                    <span>Enable Browser Push Notifications</span>
                  </div>
                  <p className="text-[11px] text-teal-800">
                    Receive clear reminders at dose time, even when the tab is closed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSoundAndScreen()}
                    className="px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 font-semibold text-xs rounded-xl border border-teal-300 shadow-2xs transition flex items-center gap-1"
                    title="Test audible chime and voice alarm"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Sound</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnablePushNotifications}
                    disabled={isEnablingPush}
                    className="px-3.5 py-1.5 bg-[#1F4E46] hover:bg-[#153A34] text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    {isEnablingPush ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Enabling...</span>
                      </>
                    ) : (
                      <>
                        <BellRing className="w-3.5 h-3.5 text-amber-200" />
                        <span>Enable Notifications</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Iframe Preview Notice */}
          {isInIframe && (
            <div className="mt-3 p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Smartphone className="w-4 h-4 text-sky-700 flex-shrink-0" />
                <span>
                  <strong>Preview Mode:</strong> Sound alarms ring while using this window. For background push alerts when tab is closed:
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] rounded-lg shadow-2xs whitespace-nowrap flex items-center gap-1"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Feedback & Error Messages */}
          {testPushMessage && (
            <div className="mt-3 p-2 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>{testPushMessage}</span>
            </div>
          )}

          {permissionError && (
            <div className="mt-3 p-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span>{permissionError}</span>
            </div>
          )}
        </div>

        {/* Next Scheduled Dose Highlight Card */}
        {nextReminder && (
          <div className="mt-3.5 p-3.5 bg-gradient-to-r from-[#DCEAE4]/60 to-[#F3F5F4] rounded-2xl border border-[#B4C6BB]/70 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-[#1F4E46] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#1F4E46]" />
                {nextReminder.isTomorrow ? "Next Dose (Tomorrow)" : "Next Scheduled Reminder"}
              </span>
              <div className="text-sm font-bold text-[#153A34] flex items-center gap-2">
                <span>{nextReminder.medication.name}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white text-[#1F4E46] rounded-md border border-[#B4C6BB]/60">
                  {nextReminder.medication.dosage}
                </span>
              </div>
              <p className="text-[11px] text-[#5B6B60]">
                Scheduled for <strong>{nextReminder.timeDisplay}</strong> ({nextReminder.statusText}) • {nextReminder.medication.instructions}
              </p>
            </div>

            {!nextReminder.medication.takenToday && (
              <button
                type="button"
                onClick={() => handleToggle(nextReminder.medication.id, false)}
                className="flex-shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                title="Mark this upcoming dose as taken"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Taken</span>
              </button>
            )}
          </div>
        )}

        {/* Adherence Summary Banner */}
        <div className="my-3.5 p-3.5 bg-[#FAFAFA] rounded-2xl border border-[#E2E4E0] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#5B6B60] uppercase tracking-wider block">
              Today&apos;s Adherence
            </span>
            <div className="text-base sm:text-lg font-bold text-[#153A34] font-serif">
              {takenCount} of {totalCount} doses taken ({progressPercent}%)
            </div>
          </div>

          <div className="w-11 h-11 rounded-full border-4 border-emerald-600 bg-white flex items-center justify-center text-xs font-bold text-emerald-800 shadow-2xs">
            {progressPercent}%
          </div>
        </div>

        {/* Medication List */}
        <div className="space-y-2.5 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
          {medications.map((med) => {
            const displayTime = formatTimeForDisplay(med.scheduledTime, med.timing);
            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  med.takenToday
                    ? "bg-[#FAFAFA] border-emerald-200 opacity-85"
                    : "bg-white border-[#E2E4E0] hover:border-[#1F4E46]/40 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(med.id, med.takenToday)}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition mt-0.5 flex-shrink-0 ${
                      med.takenToday
                        ? "bg-emerald-600 border-emerald-700 text-white"
                        : "bg-white border-[#B4C6BB] text-transparent hover:border-[#1F4E46]"
                    }`}
                    title={med.takenToday ? "Mark as not taken" : "Mark as taken"}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold truncate ${med.takenToday ? "line-through text-[#5B6B60]" : "text-[#153A34]"}`}>
                        {med.name}
                      </h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#F3F5F4] text-[#1F4E46] rounded-md">
                        {med.dosage}
                      </span>
                      {med.takenToday && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Taken Today
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6B60] mt-1">
                      <span className="flex items-center gap-1 font-semibold text-[#1F4E46] bg-emerald-50/70 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-emerald-700" />
                        <span>{displayTime}</span>
                        <span className="text-[#5B6B60] font-normal">({med.timing})</span>
                      </span>
                      <span>•</span>
                      <span className="truncate">{med.instructions}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleTestSoundAndScreen(med)}
                    className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition"
                    title={`Test alarm sound & popup for ${med.name}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteMedication(med.id)}
                    className="p-1.5 text-[#A0B0A5] hover:text-rose-600 transition"
                    title="Delete medicine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {medications.length === 0 && (
            <div className="p-6 text-center text-xs text-[#5B6B60] bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E2E4E0]">
              No medications added yet. Click &quot;Add New Medicine&quot; below to setup reminder schedules.
            </div>
          )}
        </div>

        {/* Add New Form */}
        {showAddForm ? (
          <form onSubmit={handleAddMed} className="mt-4 p-4 bg-[#FAFAFA] rounded-2xl border border-[#E2E4E0] space-y-3 animate-in fade-in duration-150">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-[#153A34] uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Add Prescribed Medication</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-semibold text-[#5B6B60] hover:text-[#153A34]"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amlodipine, Metformin, Shelcal 500"
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E4E0] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#1F4E46]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                    <Clock className="w-3 h-3 text-[#1F4E46]" />
                    <span>Scheduled Time</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSetQuickTestTime}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5 transition cursor-pointer"
                    title="Set time to 1 minute from now to test automated alarm"
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

            <div>
              <label className="block text-[10px] font-bold text-[#5B6B60] uppercase mb-1">
                Doctor&apos;s Instructions
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. After food with warm water"
                className="w-full px-3.5 py-2 bg-white border border-[#E2E4E0] rounded-xl text-xs focus:outline-none focus:border-[#1F4E46]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1F4E46] text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-[#153A34] transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Medication &amp; Setup Reminders</span>
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full mt-3.5 py-2.5 bg-[#F3F5F4] hover:bg-[#DCEAE4] text-[#1F4E46] font-semibold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 border border-[#B4C6BB] transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        )}

        {/* Safety Disclaimer Footer */}
        <div className="mt-4 pt-3 border-t border-[#F3F5F4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-[#5B6B60]">
          <div className="flex items-center gap-1 text-[#5B6B60]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
            <span>Reminder system only. Never replaces doctor&apos;s prescription.</span>
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
