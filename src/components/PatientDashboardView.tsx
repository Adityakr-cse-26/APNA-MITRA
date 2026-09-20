import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { Building2, User as UserIcon, Calendar, Activity, Search, AlertOctagon, LogOut, Loader2, Sparkles, AlertCircle, Check, Bell, MapPin, AlertTriangle, ShieldCheck, MessageSquare, Phone, Camera, Upload, Eye, Trash2, X, Download, Image as ImageIcon } from 'lucide-react';

import { Language, ElderlyProfile } from "../types";
import { getCurrentLocation } from "../utils/geolocation";
import { triggerEmergencySOS } from "../services/emergencyService";
interface PatientDashboardProps {
  currentLang: Language;
  user: User;
  onLogout: () => void;
  onOpenSymptomChecker: () => void;
  onOpenMedicineReminder: () => void;
  onOpenProfile?: () => void;
  profileProp?: ElderlyProfile;
}

export const PatientDashboardView: React.FC<PatientDashboardProps> = ({ user, onLogout, onOpenSymptomChecker, onOpenMedicineReminder, currentLang, onOpenProfile, profileProp }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [previousAppointments, setPreviousAppointments] = useState<any[]>([]);
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [primaryCaretaker, setPrimaryCaretaker] = useState<any>(null);

  const [hasPushSub, setHasPushSub] = useState(false);
  useEffect(() => {
    if (user?.id) {
      supabase.from('push_subscriptions').select('id').eq('patient_uid', user.id).then(({ data }) => {
        setHasPushSub(data && data.length > 0);
      });
    }
  }, [user]);


  const [notifications, setNotifications] = useState<any[]>([]);

  // Patient Passport Photo States
  const [patientPhoto, setPatientPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`apna_mitra_patient_photo_${user.id}`) || null;
    } catch {
      return null;
    }
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync photo with window event if updated anywhere
  useEffect(() => {
    const handlePhotoUpdated = (e: any) => {
      if (e.detail !== undefined) {
        setPatientPhoto(e.detail);
      }
    };
    window.addEventListener('patientPhotoUpdated', handlePhotoUpdated);
    return () => window.removeEventListener('patientPhotoUpdated', handlePhotoUpdated);
  }, []);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setPhotoFeedback({ type: 'error', text: 'Please select a valid image file (JPG, PNG, or WebP).' });
      return;
    }
    
    if (file.size > 12 * 1024 * 1024) {
      setPhotoFeedback({ type: 'error', text: 'Image size too large. Please select a photo under 12MB.' });
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoFeedback(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Standard passport size ratio is 35mm : 45mm = 7:9 = 0.777
        // High resolution passport canvas: 350px width by 450px height
        const targetWidth = 350;
        const targetHeight = 450;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setIsUploadingPhoto(false);
          setPhotoFeedback({ type: 'error', text: 'Could not process photo on this device.' });
          return;
        }

        // Center-crop to standard 35:45 passport photo ratio
        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;

        let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;

        if (imgAspect > targetAspect) {
          // Wider than target: crop left and right
          srcW = img.height * targetAspect;
          srcX = (img.width - srcW) / 2;
        } else {
          // Taller than target: crop top and bottom
          srcH = img.width / targetAspect;
          srcY = (img.height - srcH) / 2;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);

        // Convert to high quality JPEG data URL
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.90);

        // 1. Update local state
        setPatientPhoto(photoDataUrl);

        // 2. Update localStorage
        try {
          localStorage.setItem(`apna_mitra_patient_photo_${user.id}`, photoDataUrl);
          if (profileProp?.id) localStorage.setItem(`apna_mitra_patient_photo_${profileProp.id}`, photoDataUrl);
          if (profileProp?.patientId) localStorage.setItem(`apna_mitra_patient_photo_${profileProp.patientId}`, photoDataUrl);
          localStorage.setItem('apna_mitra_patient_photo_current', photoDataUrl);
        } catch {}

        // Dispatch global event so all components update seamlessly
        window.dispatchEvent(new CustomEvent('patientPhotoUpdated', { detail: photoDataUrl }));

        setIsUploadingPhoto(false);
        setPhotoFeedback({ type: 'success', text: currentLang === 'hi' ? 'पासपोर्ट साइज फोटो सफलतापूर्वक सहेजी गई! (35×45mm)' : currentLang === 'bn' ? 'পাসপোর্ট সাইজ ছবি সফলভাবে সংরক্ষিত হয়েছে! (35×45mm)' : 'Passport size photo saved successfully! (35×45mm)' });
        setTimeout(() => setPhotoFeedback(null), 4000);
      };
      img.onerror = () => {
        setIsUploadingPhoto(false);
        setPhotoFeedback({ type: 'error', text: 'Failed to process image. Please try another photo.' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      setPhotoFeedback({ type: 'error', text: 'Failed to read file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setPatientPhoto(null);
    try {
      localStorage.removeItem(`apna_mitra_patient_photo_${user.id}`);
      if (profileProp?.id) localStorage.removeItem(`apna_mitra_patient_photo_${profileProp.id}`);
      if (profileProp?.patientId) localStorage.removeItem(`apna_mitra_patient_photo_${profileProp.patientId}`);
      localStorage.removeItem('apna_mitra_patient_photo_current');
    } catch {}

    window.dispatchEvent(new CustomEvent('patientPhotoUpdated', { detail: null }));
    setPhotoFeedback({ type: 'success', text: currentLang === 'hi' ? 'पासपोर्ट फोटो हटा दी गई' : currentLang === 'bn' ? 'পাসপোর্ট ছবি মুছে ফেলা হয়েছে' : 'Passport photo removed.' });
    setTimeout(() => setPhotoFeedback(null), 3000);
  };

  // SOS States
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [sosStatus, setSosStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [sosMessage, setSosMessage] = useState<string>('');
  


  useEffect(() => {
    fetchDashboardData();
    
    const handleAppointmentBooked = () => {
      fetchDashboardData();
    };
    window.addEventListener('appointmentBooked', handleAppointmentBooked);

    // Supabase Realtime Subscription for Notifications
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `patient_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && payload.new.type === 'SOS') {
            setNotifications((prev) => [payload.new, ...prev]);
            // Play notification sound if browser permits
            import("../utils/audio").then((m) => {
              if (m.playSiren) m.playSiren();
            }).catch(err => console.error("Could not play sound", err));
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('appointmentBooked', handleAppointmentBooked);
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Synchronize profile changes instantly if passed via props
  useEffect(() => {
    if (profileProp) {
      const gPhone = profileProp.emergency_contact_phone || profileProp.guardian_phone;
      const gName = profileProp.emergency_contact_name || profileProp.guardian_name;
      const gRel = profileProp.emergency_contact_relationship || profileProp.guardian_relation;
      if (gPhone) {
        setPrimaryCaretaker((prev: any) => ({
          ...prev,
          name: gName || prev?.name || 'Primary Contact',
          phone: gPhone,
          relation: gRel || prev?.relation || 'Guardian',
          is_primary: true
        }));
      }
    }
  }, [profileProp]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (profileError) throw profileError;
      setProfile(profileData || { full_name: user.user_metadata?.full_name || 'Patient' });

      const remotePhoto = profileData?.photo_url || profileData?.avatar_url || profileProp?.photo_url || profileProp?.avatar_url;
      if (remotePhoto) {
        setPatientPhoto(remotePhoto);
        try {
          localStorage.setItem(`apna_mitra_patient_photo_${user.id}`, remotePhoto);
        } catch {}
      }

      // Fetch Caretakers - look for is_primary first
      const { data: caretakersData } = await supabase
        .from('caretakers')
        .select('*')
        .eq('patient_id', user.id)
        .order('is_primary', { ascending: false });
      
      const chosen = caretakersData?.find((c: any) => c.is_primary) || caretakersData?.[0];
      const effectiveName = profileData?.emergency_contact_name || profileData?.guardian_name || chosen?.name || profileProp?.emergency_contact_name || '';
      const effectivePhone = profileData?.emergency_contact_phone || profileData?.guardian_phone || chosen?.phone || profileProp?.emergency_contact_phone || '';
      const effectiveRel = profileData?.emergency_contact_relationship || profileData?.guardian_relation || chosen?.relation || 'Primary Contact';

      if (effectivePhone) {
        setPrimaryCaretaker({
          id: chosen?.id,
          name: effectiveName || 'Primary Contact',
          phone: effectivePhone,
          relation: effectiveRel,
          is_primary: true
        });
      } else if (chosen) {
        setPrimaryCaretaker(chosen);
      }
      
      // Fetch Notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('patient_id', user.id)
        .eq('type', 'SOS')
        .order('created_at', { ascending: false });
      
      if (!notifError && notifData) {
        setNotifications(notifData);
      }

      // 2. Fetch Appointments
      const { data: appointmentsData, error: apptError } = await supabase.from('appointments').select('*').eq('patient_id', user.id).order('appointment_date', { ascending: true });
      if (apptError && apptError.code !== '42P01') {
         console.warn("Appointments fetch error:", apptError);
      }
      
      if (appointmentsData) {
        const today = new Date().toISOString().split('T')[0];
        setUpcomingAppointments(appointmentsData.filter(a => a.appointment_date >= today && a.status !== 'Cancelled' && a.status !== 'Completed'));
        setPreviousAppointments(appointmentsData.filter(a => a.appointment_date < today || a.status === 'Completed' || a.status === 'Cancelled'));
      }

      // 3. Fetch Health Checks
      const { data: checksData, error: checksError } = await supabase.from('health_checks').select('*').eq('patient_id', user.id).order('created_at', { ascending: false });
      if (checksError && checksError.code !== '42P01') {
        console.warn("Health checks fetch error:", checksError);
      }
      if (checksData) setHealthChecks(checksData);

    } catch (err: any) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = () => {
    console.log("SOS button clicked");
    const activePhone = primaryCaretaker?.phone || profile?.emergency_contact_phone || profile?.guardian_phone || profileProp?.emergency_contact_phone || profileProp?.guardian_phone;
    if (!activePhone) {
      alert("Please add an emergency contact before using SOS.");
      return;
    }
    setShowSosConfirm(true);
    setSosStatus('idle');
    setSosMessage('');
  };

  const confirmSOS = async () => {
    setSosStatus('loading');
    
    // Play audio siren
    import("../utils/audio").then((m) => {
        if (m.playSiren) m.playSiren();
    }).catch(() => {});

    // Try to get location
    let loc = null;
    try {
      loc = await getCurrentLocation();
    } catch(e) {
      console.warn("Could not get location", e);
    }

    try {
      const result = await triggerEmergencySOS({
        userId: user.id,
        patientName: profile?.full_name || profileProp?.name,
        profileProp,
        location: loc
      });

      if (result.targetPhone) {
        setPrimaryCaretaker({
          id: primaryCaretaker?.id,
          name: result.targetName,
          phone: result.targetPhone,
          relation: result.targetRel,
          is_primary: true
        });
      }

      setSosStatus('success');
      setSosMessage(loc ? `📍 Location & SOS Alert successfully broadcasted to ${result.targetName} (${result.targetPhone})!` : `🚨 SOS Alert sent to ${result.targetName} (${result.targetPhone})!`);
    } catch (err: any) {
      console.error("SOS catch notice:", err);
      const fallbackPhone = primaryCaretaker?.phone || profile?.emergency_contact_phone || profileProp?.emergency_contact_phone || "108";
      const fallbackName = primaryCaretaker?.name || profile?.emergency_contact_name || "Emergency Contact";
      setSosStatus('error');
      setSosMessage(`Emergency Alert Dispatch: Please call your emergency contact ${fallbackName} (${fallbackPhone}) directly.`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-emerald-800 font-medium">{currentLang === 'hi' ? 'आपका स्वास्थ्य डैशबोर्ड लोड हो रहा है...' : currentLang === 'bn' ? 'আপনার স্বাস্থ্য ড্যাশবোর্ড লোড হচ্ছে...' : 'Loading your health dashboard...'}</p>
      </div>
    );
  }

  return (
    <div id="home" className="w-full max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Welcome & Top Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#153A34] mb-2">
            Welcome back, {profile?.full_name || 'Patient'}
          </h1>
          <p className="text-emerald-700 font-medium text-lg">{currentLang === 'hi' ? 'यहाँ आज के लिए आपका स्वास्थ्य अवलोकन है।' : currentLang === 'bn' ? 'আজকের জন্য আপনার স্বাস্থ্যের ওভারভিউ এখানে।' : 'Here is your health overview for today.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleSOS}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-rose-200 transition-all transform hover:scale-105 active:scale-95"
          >
            <AlertOctagon className="w-5 h-5" />
            <span>{currentLang === 'hi' ? '🚨 SOS आपातकालीन' : currentLang === 'bn' ? '🚨 SOS জরুরী' : '🚨 SOS EMERGENCY'}</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-3 rounded-xl font-bold shadow-sm transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>{currentLang === 'hi' ? 'लॉग आउट' : currentLang === 'bn' ? 'লগ আউট' : 'Log Out'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-emerald-900/5 border border-emerald-100 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 p-4 opacity-5 transition-opacity duration-300 group-hover:opacity-10 transform translate-x-4 -translate-y-4">
              <UserIcon className="w-32 h-32 text-emerald-800" />
            </div>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-[#1F4E46]"></div>
            
            <div className="relative z-10">
              {/* Patient Passport Size Photo (35×45mm) Section */}
              <div className="bg-stone-50/90 rounded-2xl p-4 border border-stone-200/80 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                      {currentLang === 'hi' ? 'रोगी पासपोर्ट फोटो' : currentLang === 'bn' ? 'রোগীর পাসপোর্ট ছবি' : 'Patient Passport Photo'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    35 × 45 mm
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  {/* Passport Photo Frame (35:45 ratio) */}
                  <div className="relative group/frame shrink-0">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) handlePhotoFile(e.dataTransfer.files[0]);
                      }}
                      className={`w-20 h-26 sm:w-24 sm:h-30 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative bg-gradient-to-b from-stone-100 to-stone-200 shadow-md ${
                        patientPhoto 
                          ? 'border-emerald-500 hover:border-emerald-600 hover:shadow-emerald-900/20' 
                          : 'border-dashed border-emerald-400 hover:border-emerald-600 hover:bg-emerald-50/50'
                      }`}
                      title={patientPhoto ? (currentLang === 'hi' ? 'पासपोर्ट फोटो बदलने के लिए क्लिक करें' : currentLang === 'bn' ? 'পাসপোর্ট ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to change passport photo') : (currentLang === 'hi' ? 'पासपोर्ट फोटो अपलोड करें (35×45mm)' : currentLang === 'bn' ? 'পাসপোর্ট ছবি আপলোড করুন (৩৫×৪৫মিমি)' : 'Click or drag to upload patient passport size photo (35×45mm)')}
                    >
                      {patientPhoto ? (
                        <>
                          <img 
                            src={patientPhoto} 
                            alt="Patient Passport Size" 
                            className="w-full h-full object-cover"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/frame:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1 backdrop-blur-[1px]">
                            <Camera className="w-5 h-5" />
                            <span>{currentLang === 'hi' ? 'बदलें' : currentLang === 'bn' ? 'পরিবর্তন' : 'Change'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-2 text-center flex flex-col items-center justify-center">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 shadow-xs group-hover/frame:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-900 leading-tight block">
                            {currentLang === 'hi' ? 'फोटो अपलोड' : currentLang === 'bn' ? 'ছবি আপলোড' : 'Upload'}
                          </span>
                          <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">35×45mm</span>
                        </div>
                      )}

                      {/* Passport Alignment Corner Guides */}
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t-2 border-l-2 border-emerald-500/70 pointer-events-none" />
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t-2 border-r-2 border-emerald-500/70 pointer-events-none" />
                      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b-2 border-l-2 border-emerald-500/70 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b-2 border-r-2 border-emerald-500/70 pointer-events-none" />
                    </div>

                    {/* Hidden Native File Input */}
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Photo Info & Action Buttons */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-extrabold text-[#153A34] leading-snug truncate">
                      {profile?.full_name || profileProp?.name || 'Patient'}
                    </h2>
                    <p className="text-xs text-stone-500 mb-2 truncate font-mono">
                      {profile?.patientId || profileProp?.patientId || user.email}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1F4E46] hover:bg-[#153A34] text-white shadow-xs transition active:scale-95 disabled:opacity-60"
                      >
                        {isUploadingPhoto ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {patientPhoto 
                            ? (currentLang === 'hi' ? 'फोटो बदलें' : currentLang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo') 
                            : (currentLang === 'hi' ? 'पासपोर्ट फोटो अपलोड करें' : currentLang === 'bn' ? 'পাসপোর্ট ছবি আপলোড' : 'Upload Passport Photo')}
                        </span>
                      </button>

                      {patientPhoto && (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowPhotoPreviewModal(true)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-[#1F4E46] border border-stone-200 shadow-xs transition"
                            title="View official passport photo ID card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{currentLang === 'hi' ? 'देखें' : currentLang === 'bn' ? 'দেখুন' : 'View'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition"
                            title="Remove passport photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2">
                      {currentLang === 'hi' ? '35×45mm अनुपात • जेपीजी, पीएनजी समर्थित' : currentLang === 'bn' ? '৩৫×৪৫মিমি অনুপাত • জেপিজি, পিএনজি সমর্থিত' : 'Official 35×45mm ratio • JPG, PNG supported'}
                    </p>
                  </div>
                </div>

                {/* Upload Feedback Message */}
                {photoFeedback && (
                  <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
                    photoFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
                  }`}>
                    {photoFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span>{photoFeedback.text}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#153A34]">{currentLang === 'hi' ? 'रोगी विवरण' : currentLang === 'bn' ? 'রোগীর বিবরণ' : 'Patient Details'}</h3>
                <button onClick={onOpenProfile} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 hover:underline flex items-center gap-1">
                  <span>{currentLang === 'hi' ? 'संपादित करें' : currentLang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                  <span>→</span>
                </button>
              </div>

              <div className="space-y-3 mb-6 bg-stone-50/50 rounded-2xl p-4 border border-stone-100">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{currentLang === 'hi' ? 'भूमिका' : currentLang === 'bn' ? 'ভূমিকা' : 'Role'}</span>
                  <span className="font-semibold text-[#153A34] capitalize">{profile?.role || 'Patient'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">{currentLang === 'hi' ? 'ईमेल' : currentLang === 'bn' ? 'ইমেইল' : 'Email'}</span>
                  <span className="font-semibold text-[#153A34] truncate max-w-[150px]">{user.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">{currentLang === 'hi' ? 'फ़ोन' : currentLang === 'bn' ? 'फोन' : 'Phone'}</span>
                    <span className="font-semibold text-[#153A34]">{profile.phone}</span>
                  </div>
                )}
                {profile?.blood_group && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">{currentLang === 'hi' ? 'रक्त समूह' : currentLang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</span>
                    <span className="font-semibold text-rose-600">{profile.blood_group}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-emerald-900 to-[#0F2925] rounded-2xl p-6 shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[64px] opacity-20 transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-40 transition-opacity duration-700"></div>
            
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Quick Tools
            </h3>
            
            <div className="space-y-3 relative z-10">
              
              <button 
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/15 border border-white/5 hover:border-emerald-400/30 px-5 py-4 rounded-2xl transition-all duration-300 text-left group/btn hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
                onClick={onOpenMedicineReminder}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover/btn:bg-emerald-400 group-hover/btn:text-[#0F2925] transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pill"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-50 mb-0.5">{currentLang === 'hi' ? 'दवा ट्रैकर' : currentLang === 'bn' ? 'ঔষধ ট্র্যাকার' : 'Medication Tracker'}</span>
                    <span className="block text-xs text-emerald-200/60 font-medium">{currentLang === 'hi' ? 'अपनी दवाएं देखें' : currentLang === 'bn' ? 'আপনার ঔষধ দেখুন' : 'View your daily medicines'}</span>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-400/50 group-hover/btn:text-emerald-300 transition-colors lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </button>

<button 
                onClick={onOpenSymptomChecker}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/15 border border-white/5 hover:border-emerald-400/30 px-5 py-4 rounded-2xl transition-all duration-300 text-left group/btn hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover/btn:bg-emerald-400 group-hover/btn:text-[#0F2925] transition-colors duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-50 mb-0.5">{currentLang === 'hi' ? 'AI स्वास्थ्य जांचकर्ता' : currentLang === 'bn' ? 'এআই স্বাস্থ্য পরীক্ষক' : 'AI Health Checker'}</span>
                    <span className="block text-xs text-emerald-200/60 font-medium">{currentLang === 'hi' ? 'अपने लक्षणों का विश्लेषण करें' : currentLang === 'bn' ? 'আপনার লক্ষণ বিশ্লেষণ করুন' : 'Analyze your symptoms'}</span>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-emerald-400/50 group-hover/btn:text-emerald-300 transition-colors" />
              </button>

              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openApnaMitraChat'))}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/15 border border-white/5 hover:border-emerald-400/30 px-5 py-4 rounded-2xl transition-all duration-300 text-left group/btn hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 group-hover/btn:bg-teal-400 group-hover/btn:text-[#0F2925] transition-colors duration-300">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-50 mb-0.5">{currentLang === 'hi' ? 'अपना मित्र AI स्वास्थ्य साथी' : currentLang === 'bn' ? 'আপনা মিত্র এআই স্বাস্থ্য সহকারী' : 'Apna Mitra AI Assistant'}</span>
                    <span className="block text-xs text-emerald-200/60 font-medium">{currentLang === 'hi' ? 'स्वास्थ्य और कल्याण संबंधी प्रश्न पूछें' : currentLang === 'bn' ? 'স্বাস্থ্য ও সুস্থতা নিয়ে প্রশ্ন জিজ্ঞাসা করুন' : 'Ask health & wellness queries'}</span>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-amber-300/80 group-hover/btn:text-amber-200 transition-colors" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/15 border border-white/5 hover:border-emerald-400/30 px-5 py-4 rounded-2xl transition-all duration-300 text-left group/btn hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
                onClick={() => {
                  const el = document.getElementById("nearby-directory");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover/btn:bg-emerald-400 group-hover/btn:text-[#0F2925] transition-colors duration-300">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-50 mb-0.5">{currentLang === 'hi' ? 'डॉक्टर खोजें' : currentLang === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find a Doctor'}</span>
                    <span className="block text-xs text-emerald-200/60 font-medium">{currentLang === 'hi' ? 'अपॉइंटमेंट बुक करें' : currentLang === 'bn' ? 'একটি অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book an Appointment'}</span>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-emerald-400/50 group-hover/btn:text-emerald-300 transition-colors" />
              </button>

              <button 
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/15 border border-white/5 hover:border-emerald-400/30 px-5 py-4 rounded-2xl transition-all duration-300 text-left group/btn hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20"
                onClick={() => {
                  const el = document.getElementById("schemes");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover/btn:bg-emerald-400 group-hover/btn:text-[#0F2925] transition-colors duration-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-emerald-50 mb-0.5">{currentLang === 'hi' ? 'सरकारी योजनाएं' : currentLang === 'bn' ? 'সরকারি স্কিম' : 'Govt Schemes'}</span>
                    <span className="block text-xs text-emerald-200/60 font-medium">{currentLang === 'hi' ? 'वरिष्ठ नागरिक कल्याण' : currentLang === 'bn' ? 'প্রবীণ নাগরিক কল্যাণ' : 'Senior Welfare Benefits'}</span>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-emerald-400/50 group-hover/btn:text-emerald-300 transition-colors" />
              </button>
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100/50 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#153A34] tracking-tight">{currentLang === 'hi' ? 'आगामी अपॉइंटमेंट' : currentLang === 'bn' ? 'আসন্ন অ্যাপয়েন্টমেন্ট' : 'Upcoming Appointments'}</h2>
                <p className="text-sm text-emerald-600/70 font-medium mt-0.5">{currentLang === 'hi' ? 'आपके निर्धारित परामर्श' : currentLang === 'bn' ? 'আপনার নির্ধারিত পরামর্শ' : 'Your scheduled consultations'}</p>
              </div>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-stone-200/60 border-dashed">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-stone-100 text-stone-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-stone-500 font-medium">{currentLang === 'hi' ? 'कोई आगामी अपॉइंटमेंट नहीं' : currentLang === 'bn' ? 'আসন্ন কোনো অ্যাপয়েন্টমেন্ট নেই' : 'No upcoming appointments'}</p>
                <button 
                  onClick={() => {
                    const el = document.getElementById('nearby-directory');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >{currentLang === 'hi' ? 'अपॉइंटमेंट बुक करें' : currentLang === 'bn' ? 'একটি অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book an Appointment'}</button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appt: any) => (
                  <div key={appt.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-300 gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                        {new Date(appt.appointment_date).getDate()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#153A34] text-lg leading-none">{appt.doctor_name || (currentLang === 'hi' ? 'डॉक्टर अपॉइंटमेंट' : currentLang === 'bn' ? 'ডাক্তার অ্যাপয়েন্টমেন্ট' : 'Doctor Appointment')}</h4>
                          {
    (() => {
      const st = (appt.status || 'pending').toLowerCase();
      if (st === 'pending') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⏳ Waiting for Admin Confirmation</span>;
      if (st === 'confirmed') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✅ Appointment Confirmed</span>;
      if (st === 'rejected') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">❌ Appointment Rejected</span>;
      if (st === 'cancelled') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Cancelled</span>;
      if (st === 'completed') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Completed</span>;
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{st}</span>;
    })()
  }
                        </div>
                        <p className="text-sm text-emerald-600/80 font-medium leading-snug">{appt.hospital || (currentLang === 'hi' ? 'क्लिनिक' : currentLang === 'bn' ? 'ক্লিনিক' : 'Clinic')}</p>
                        {appt.reason && <p className="text-sm text-stone-500 mt-1.5 flex items-center gap-1.5 leading-snug"><Activity className="w-3.5 h-3.5 text-stone-400" /> {appt.reason}</p>}
                        <p className="text-xs text-stone-400 mt-1">{currentLang === 'hi' ? 'आईडी:' : currentLang === 'bn' ? 'আইডি:' : 'ID:'} {appt.id?.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-100 sm:bg-transparent sm:border-none sm:p-0">
                      <p className="font-bold text-[#153A34]">{new Date(appt.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                            <p className="text-emerald-600 text-sm font-medium mt-0.5">{appt.appointment_time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
               <h3 className="font-bold text-[#153A34] mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-600" />{currentLang === 'hi' ? 'पिछले अपॉइंटमेंट' : currentLang === 'bn' ? 'আগের অ্যাপয়েন্টমেন্ট' : 'Previous Appointments'}</h3>
               {previousAppointments.length === 0 ? (
                 <p className="text-stone-500 text-sm">{currentLang === 'hi' ? 'कोई पिछला अपॉइंटमेंट नहीं मिला।' : currentLang === 'bn' ? 'আগের কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।' : 'No previous appointments found.'}</p>
               ) : (
                 <div className="space-y-3">
                   {previousAppointments.map((appt: any) => (
                     <div key={appt.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                       <p className="font-bold text-[#153A34] text-sm">{appt.doctor_name || (currentLang === 'hi' ? 'डॉक्टर अपॉइंटमेंट' : currentLang === 'bn' ? 'ডাক্তার অ্যাপয়েন্টমেন্ট' : 'Doctor Appointment')}</p>
                       <p className="text-xs text-stone-500">{new Date(appt.appointment_date).toLocaleDateString()} • {appt.status || (currentLang === 'hi' ? 'पूरा हुआ' : currentLang === 'bn' ? 'সম্পন্ন' : 'Completed')}</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
             
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
               <h3 className="font-bold text-[#153A34] mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600" />{currentLang === 'hi' ? 'स्वास्थ्य इतिहास और जांच' : currentLang === 'bn' ? 'স্বাস্থ্য ইতিহাস এবং চেক' : 'Health History & Checks'}</h3>
               {healthChecks.length === 0 ? (
                 <p className="text-stone-500 text-sm">{currentLang === 'hi' ? 'अभी तक कोई स्वास्थ्य जांच दर्ज नहीं की गई है।' : currentLang === 'bn' ? 'এখনও কোন স্বাস্থ্য পরীক্ষা রেকর্ড করা হয়নি।' : 'No health checks recorded yet.'}</p>
               ) : (
                 <div className="space-y-3">
                   {healthChecks.map((check: any) => (
                     <div key={check.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                       <p className="font-bold text-[#153A34] text-sm line-clamp-2">{check.symptoms || check.summary || (currentLang === 'hi' ? 'सामान्य मूल्यांकन' : currentLang === 'bn' ? 'সাধারণ মূল্যায়ন' : 'General Assessment')}</p>
                       <div className="mt-2 flex justify-between items-center">
                         <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                           check.triage_level?.toLowerCase().includes('emergency') ? 'bg-rose-100 text-rose-700' :
                           check.triage_level?.toLowerCase().includes('doctor') ? 'bg-amber-100 text-amber-700' :
                           'bg-emerald-100 text-emerald-700'
                         }`}>
                           {check.triage_level || (currentLang === 'hi' ? 'सामान्य' : currentLang === 'bn' ? 'সাধারণ' : 'General')}
                         </span>
                         <span className="text-xs text-emerald-600 font-medium">
                           {new Date(check.created_at || Date.now()).toLocaleDateString()}
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
      
      
      

      {/* Caretaker / Guardian Emergency Notifications */}
      <div className="mt-12 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-8 h-8 text-rose-600" />
          <h2 className="text-2xl font-bold text-[#153A34]">
            {currentLang === 'hi' ? 'अभिभावक आपातकालीन सूचनाएं' : currentLang === 'bn' ? 'অভিভাবকের জরুরি বিজ্ঞপ্তি' : 'Caretaker / Guardian Emergency Notifications'}
          </h2>
        </div>
        
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 text-center">
            <p className="text-emerald-700 font-medium">
              {currentLang === 'hi' ? 'कोई आपातकालीन सूचना नहीं है।' : currentLang === 'bn' ? 'কোনো জরুরি বিজ্ঞপ্তি নেই।' : 'No emergency notifications at this time.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id} 
                className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all ${notif.is_read ? 'border-gray-200 shadow-gray-200/50 opacity-75' : 'border-rose-500 shadow-rose-200'}`}
              >
                {!notif.is_read && (
                  <span className="absolute -top-3 -right-3 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-500 text-white text-[10px] items-center justify-center font-bold">!</span>
                  </span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-6 h-6 ${notif.is_read ? 'text-gray-400' : 'text-rose-500'}`} />
                    <h3 className={`font-extrabold text-lg ${notif.is_read ? 'text-gray-600' : 'text-rose-700'}`}>
                      {notif.title || '🚨 Emergency SOS Alert'}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-800 font-medium text-lg leading-snug">
                    {notif.message}
                  </p>
                  
                  <div className="bg-rose-50 p-4 rounded-2xl space-y-2 mt-4 border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-900">
                      <UserIcon className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="font-bold">Patient:</span>
                      <span className="font-medium">{notif.patient_name || 'Unknown Patient'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-900">
                      <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="font-bold">Location:</span>
                      <span className="font-medium">{notif.location || 'Unknown Location'}</span>
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <div className="mt-5 flex justify-end">
                    <button 
                      onClick={async () => {
                        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
                        if (!error) {
                          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                        }
                      }}
                      className="text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      Mark as Read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SOS Custom Modal */}
      {showSosConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-2xl font-bold text-rose-600 mb-2 flex items-center gap-2">
              <AlertOctagon className="w-8 h-8" />
              Emergency SOS
            </h3>
            
            {sosStatus === 'idle' && (
              <>
                <p className="text-gray-700 font-medium mb-4 text-lg">
                  Are you sure you want to send an emergency alert to your primary emergency contact?
                </p>
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                  <span className="mt-0.5">📍</span>
                  <p>Your current GPS location will be captured and shared securely with your guardian to assist you.</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Contact:</p>
                  
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${hasPushSub ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs font-medium text-gray-600">
                    {hasPushSub ? '🟢 Emergency notifications enabled' : '🔴 Emergency notifications disabled'}
                  </span>
                </div>

<p className="font-bold text-gray-900 text-lg">{primaryCaretaker?.name}</p>
                  <p className="font-bold text-rose-600 text-lg">{primaryCaretaker?.phone}</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowSosConfirm(false)}
                    className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmSOS}
                    className="px-5 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-transform transform hover:scale-105 active:scale-95"
                  >
                    Send SOS
                  </button>
                </div>
              </>
            )}

            {sosStatus === 'loading' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-700">Creating SOS Alert...</p>
              </div>
            )}

            {sosStatus === 'success' && (
              <div className="py-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Check className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">SOS Alert Dispatched</h4>
                <p className="text-emerald-800 font-medium text-base whitespace-pre-line mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  {sosMessage}
                </p>
                
                <div className="space-y-3">
                  <a
                    href={`tel:${primaryCaretaker?.phone || '108'}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-200 w-full text-lg transition-transform"
                  >
                    <Phone className="w-5 h-5 animate-bounce" />
                    <span>Call {primaryCaretaker?.name || 'Contact'} ({primaryCaretaker?.phone || '108'})</span>
                  </a>

                  <button 
                    onClick={() => {
                      setShowSosConfirm(false);
                      setSosStatus('idle');
                    }}
                    className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 w-full transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {sosStatus === 'error' && (
              <div className="py-6 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">Emergency Contact</h4>
                <p className="text-rose-700 font-medium mb-6 bg-rose-50 border border-rose-200 p-3 rounded-xl text-sm">{sosMessage}</p>
                
                <div className="space-y-3">
                  <a
                    href={`tel:${primaryCaretaker?.phone || '108'}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-200 w-full text-lg transition-transform"
                  >
                    <Phone className="w-5 h-5 animate-pulse" />
                    <span>Call {primaryCaretaker?.name || 'Emergency Contact'} ({primaryCaretaker?.phone || '108'})</span>
                  </a>

                  <a
                    href="tel:108"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 w-full"
                  >
                    <span>🚑 Call Govt. Ambulance (108)</span>
                  </a>

                  <button 
                    onClick={() => {
                      setShowSosConfirm(false);
                      setSosStatus('idle');
                    }}
                    className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 w-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Passport Photo Preview Modal */}
      {showPhotoPreviewModal && patientPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#1F4E46] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">
                    {currentLang === 'hi' ? 'रोगी पहचान पत्र • 35×45mm पासपोर्ट फोटो' : currentLang === 'bn' ? 'রোগী পরিচয়পত্র • ৩৫×৪৫মিমি পাসপোর্ট ছবি' : 'Patient Photo ID • 35×45mm Passport'}
                  </h3>
                  <p className="text-[10px] text-emerald-200/80">Apna Mitra Senior Health Companion</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoPreviewModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo and ID card body */}
            <div className="p-6 bg-gradient-to-b from-stone-50 to-white">
              <div className="flex flex-col items-center">
                {/* Official Passport Frame */}
                <div className="w-36 h-46 sm:w-40 sm:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-stone-300/80 relative mb-4 bg-stone-100">
                  <img
                    src={patientPhoto}
                    alt="Patient Passport"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>35×45mm</span>
                  </div>
                </div>

                <h4 className="text-xl font-black text-[#153A34] mb-0.5 text-center">
                  {profile?.full_name || profileProp?.name || 'Patient'}
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mb-4">
                  {profile?.patientId || profileProp?.patientId || 'AM-UID-REGISTERED'}
                </span>

                {/* Details grid */}
                <div className="w-full bg-stone-50 rounded-2xl p-4 border border-stone-200/70 text-xs space-y-2 mb-5">
                  <div className="flex justify-between py-1 border-b border-stone-200/50">
                    <span className="text-stone-500">{currentLang === 'hi' ? 'आयु / जन्म तिथि' : currentLang === 'bn' ? 'বয়স / জন্ম তারিখ' : 'Age / Date of Birth'}</span>
                    <span className="font-semibold text-stone-800">
                      {profile?.age || profileProp?.age || '72'} yrs • {profileProp?.dob || profile?.dob || '15/05/1954'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200/50">
                    <span className="text-stone-500">{currentLang === 'hi' ? 'रक्त समूह' : currentLang === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</span>
                    <span className="font-bold text-rose-600">{profile?.blood_group || profileProp?.bloodGroup || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200/50">
                    <span className="text-stone-500">{currentLang === 'hi' ? 'आपातकालीन संपर्क' : currentLang === 'bn' ? 'জরুরী যোগাযোগ' : 'Emergency Contact'}</span>
                    <span className="font-semibold text-stone-800 font-mono">
                      {primaryCaretaker?.phone || profile?.emergency_contact_phone || '—'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full">
                  <a
                    href={patientPhoto}
                    download={`Patient_Passport_Photo_${profile?.full_name || 'ID'}.jpg`}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>{currentLang === 'hi' ? 'फोटो डाउनलोड' : currentLang === 'bn' ? 'ছবি ডাউনলোড' : 'Download Photo'}</span>
                  </a>
                  <button
                    onClick={() => {
                      setShowPhotoPreviewModal(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-[#1F4E46] hover:bg-[#153A34] text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{currentLang === 'hi' ? 'फोटो बदलें' : currentLang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
