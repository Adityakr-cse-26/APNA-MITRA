import { supabase, hasSupabaseConfig } from "../supabase";
import React, { useState, useRef, useEffect } from 'react';

import { ShieldCheck, Mail, Lock, AlertCircle, HeartPulse, User, CheckCircle2, Phone, Calendar, MapPin, Eye, EyeOff, Check } from 'lucide-react';
import { ApnaMitraLogo } from './ApnaMitraLogo';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';

import { Language } from "../types";
interface AuthScreenProps {
  currentLang: Language;
  onSuccess: () => void;
  onGuestLogin?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, currentLang, onGuestLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMode, setAuthMode] = useState<'patient' | 'admin'>('patient');
  const [isReset, setIsReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [needsGuardian, setNeedsGuardian] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>('Testing connection...');

  const fieldRefs = {
    fullName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    dob: useRef<HTMLInputElement>(null),
    gender: useRef<HTMLSelectElement>(null),
    address: useRef<HTMLTextAreaElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null),
    guardianName: useRef<HTMLInputElement>(null),
    guardianPhone: useRef<HTMLInputElement>(null),
    termsAccepted: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    const savedError = sessionStorage.getItem('authError');
    if (savedError) {
      setError(savedError);
      sessionStorage.removeItem('authError');
    }
  }, []);

  useEffect(() => {
    const testConnection = async () => {
      if (!hasSupabaseConfig) {
        setConnectionStatus('Supabase credentials missing. Please check AI Studio Settings.');
        return;
      }
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setConnectionStatus('Supabase connected successfully');
        setTimeout(() => setConnectionStatus(null), 5000);
      } catch (err) {
        console.error("Supabase connection error:", err);
        setConnectionStatus('Failed to connect to Supabase');
      }
    };
    testConnection();
  }, []);

  const validateField = (field: string, value: any): string => {
    if (isReset) return "";
    if (isLogin) return "";

    switch (field) {
      case 'fullName':
        if (!value || typeof value !== 'string' || !value.trim()) return "Full Name is required.";
        if (value.trim().length < 2 || !/^[a-zA-Z\s]+$/.test(value)) return "Please enter a valid full name using letters and spaces only.";
        break;
      case 'email':
        if (!value) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address.";
        break;
      case 'phone':
        if (!value) return "Phone number is required.";
        if (!/^[6-9]\d{9}$/.test(value)) return "Please enter a valid 10-digit mobile number.";
        break;
      case 'dob':
        if (!value) return "Date of birth is required.";
        const dateObj = new Date(value);
        if (isNaN(dateObj.getTime())) return "Please enter a valid date of birth.";
        if (dateObj > new Date()) return "Date of birth cannot be a future date.";
        break;
      case 'gender':
        if (!value) return "Please select your gender.";
        break;
      case 'address':
        if (!value || typeof value !== 'string' || !value.trim()) return "Address is required.";
        break;
      case 'password':
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must contain at least 8 characters.";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter.";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter.";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number.";
        if (!/[^A-Za-z0-9]/.test(value)) return "Password must contain at least one special character.";
        break;
      case 'confirmPassword':
        if (!value) return "Please confirm your password.";
        if (value !== password) return "Passwords do not match.";
        break;
      case 'guardianName':
        if (authMode === 'patient' && needsGuardian) {
          if (!value || typeof value !== 'string' || !value.trim()) return "Guardian/Caretaker name is required.";
        }
        break;
      case 'guardianPhone':
        if (authMode === 'patient' && needsGuardian) {
           if (!value || !/^[6-9]\d{9}$/.test(value)) return "Please enter a valid 10-digit guardian/caretaker mobile number.";
        }
        break;
      case 'termsAccepted':
        if (!value) return "Please agree to the Terms & Conditions and Privacy Policy before continuing.";
        break;
    }
    return "";
  };

  const handleBlur = (field: string, value: any) => {
    if (isReset) return;
    if (isLogin) return;
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = [
      { id: 'fullName', val: fullName },
      { id: 'email', val: email },
      { id: 'phone', val: phone },
      { id: 'dob', val: dob },
      { id: 'gender', val: gender },
      { id: 'address', val: address },
      { id: 'password', val: password },
      { id: 'confirmPassword', val: confirmPassword },
      ...(authMode === 'patient' && needsGuardian ? [
        { id: 'guardianName', val: guardianName },
        { id: 'guardianPhone', val: guardianPhone }
      ] : []),
      { id: 'termsAccepted', val: termsAccepted }
    ];

    let firstErrorField: string | null = null;

    fieldsToValidate.forEach(f => {
      const err = validateField(f.id, f.val);
      if (err) {
        newErrors[f.id] = err;
        if (!firstErrorField) firstErrorField = f.id;
      }
    });

    setErrors(newErrors);
    
    const allTouched: Record<string, boolean> = {};
    fieldsToValidate.forEach(f => allTouched[f.id] = true);
    setTouched(allTouched);

    if (firstErrorField) {
       const ref = fieldRefs[firstErrorField as keyof typeof fieldRefs];
       if (ref && ref.current) {
          (ref.current as any).focus();
          (ref.current as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
       return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isReset) {
      if (isLogin) {
        // Terms acceptance is no longer required on login
      } else {
        const isValid = validateAll();
        if (!isValid) {
          setLoading(false);
          return;
        }
      }
    }

    if (!hasSupabaseConfig) {
      setError("Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your AI Studio Settings > Environment Variables");
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        sessionStorage.setItem('intended_portal', authMode);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        
        if (data.user) {
           onSuccess();
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              guardian_name: needsGuardian ? guardianName : null,
              guardian_phone: needsGuardian ? guardianPhone : null,
              role: authMode,
              dob,
              gender,
              address
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data.user) {
          if (data.user.identities && data.user.identities.length === 0) {
             throw new Error("An account with this email already exists. Please log in or use another email.");
          }

          const allowedRoles = ["patient", "guardian", "doctor", "caretaker", "admin"];
          if (!allowedRoles.includes(authMode)) {
            throw new Error("Invalid user role");
          }

          const profilePayload: any = {
            id: data.user.id,
            full_name: fullName,
            email: email,
            phone: phone,
            role: authMode
          };
          
          if (authMode === 'patient' && needsGuardian) {
            profilePayload.guardian_name = guardianName;
            profilePayload.guardian_phone = guardianPhone;
          }

          const { error: profileError } = await supabase.from("profiles").upsert(profilePayload);
          if (profileError) {
             console.error("Profile creation error:", profileError);
             if (profileError.code === '42501' || profileError.message.includes('row-level security')) {
                throw new Error("Database Security Error: Profile blocked by RLS. Please run the 'fix_registration_rls.sql' script in your Supabase SQL Editor to enable user registration.");
             }
          }

          if (needsGuardian && (guardianName || guardianPhone)) {
            const { error: caretakerError } = await supabase.from('caretakers').upsert({ patient_id: data.user.id, name: guardianName, phone: guardianPhone });
            if (caretakerError) {
              console.error("Caretaker creation error:", caretakerError);
              if (caretakerError.code === '42501' || caretakerError.message.includes('row-level security')) {
                 throw new Error("Database Security Error: Caretaker blocked by RLS. Please run the 'fix_registration_rls.sql' script in your Supabase SQL Editor.");
              }
            }
          }
          
          setSuccessMessage("Registration successful! Please verify your email before logging in.");
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          setErrors({});
          setTouched({});
        }
      }
    } catch (err: any) {
      console.error(err);
      
      let errorMsg = err.message || 'An error occurred during authentication.';
      if (err.message === 'Failed to fetch') errorMsg = 'Network error (Failed to fetch). This is commonly caused by an Ad Blocker (like uBlock Origin or Brave Shields) blocking authentication requests. Please disable ad blockers for this site and try again.';
      if (err.message === "Email rate limit exceeded" || err.message.includes("rate limit")) {
        errorMsg = "Rate limit exceeded. To fix this for testing: Go to your Supabase Dashboard -> Authentication -> Providers -> Email, and turn OFF 'Confirm email'. Also check Settings -> Auth -> Rate Limits.";
      } else if (err.message === "Email not confirmed") {
        errorMsg = "Email not confirmed. Please check your inbox for the confirmation link. For testing, you can turn OFF 'Confirm email' in Supabase Dashboard -> Authentication -> Providers -> Email.";
      } else if (err.message === "Invalid login credentials") {
        errorMsg = "Invalid login credentials. If you just registered, you may need to confirm your email first. To disable this for testing: Go to Supabase Dashboard -> Authentication -> Providers -> Email -> turn OFF 'Confirm email'.";
      } else if (err.message.includes("Database error")) {
         errorMsg = "Database Error: Your Supabase database is either paused, full, or has a failing trigger (e.g. missing 'profiles' table). Click 'Skip Login' below to use a Demo Account for now, or run the provided SQL schema in your Supabase SQL Editor.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to reset password.");
      return;
    }
    setError(null);
    setLoading(true);
    setResetSent(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (
    id: string,
    label: string,
    type: string,
    value: any,
    setValue: (val: any) => void,
    icon: React.ReactNode,
    placeholder: string = '',
    isMandatory: boolean = true
  ) => {
    const hasError = touched[id] && errors[id];
    const isValid = touched[id] && !errors[id] && value;

    return (
      <div className="mb-5">
        <label className="block text-sm font-semibold text-[#153A34] mb-2">
          {label} {isMandatory && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          {type === 'textarea' ? (
             <textarea
               ref={fieldRefs[id as keyof typeof fieldRefs] as any}
               value={value}
               onChange={(e) => { setValue(e.target.value); if (touched[id]) { setErrors(prev => ({ ...prev, [id]: validateField(id, e.target.value) }))} }}
               onBlur={(e) => handleBlur(id, e.target.value)}
               className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border rounded-xl focus:ring-2 bg-gray-50 transition ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50' : isValid ? 'border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
               placeholder={placeholder}
               rows={3}
             />
          ) : type === 'select' ? (
             <select
               ref={fieldRefs[id as keyof typeof fieldRefs] as any}
               value={value}
               onChange={(e) => { setValue(e.target.value); if (touched[id]) { setErrors(prev => ({ ...prev, [id]: validateField(id, e.target.value) }))} }}
               onBlur={(e) => handleBlur(id, e.target.value)}
               className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border rounded-xl focus:ring-2 bg-gray-50 transition ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50' : isValid ? 'border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
             >
                <option value="" disabled>Select {label.replace(' *', '')}</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
             </select>
          ) : (
            <input
              ref={fieldRefs[id as keyof typeof fieldRefs] as any}
              type={type === 'password' ? (id === 'password' ? (showPassword ? 'text' : 'password') : (showConfirmPassword ? 'text' : 'password')) : type}
              value={value}
              onChange={(e) => { setValue(e.target.value); if (touched[id]) { setErrors(prev => ({ ...prev, [id]: validateField(id, e.target.value) }))} }}
              onBlur={(e) => handleBlur(id, e.target.value)}
              className={`block w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border rounded-xl focus:ring-2 bg-gray-50 transition ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50' : isValid ? 'border-emerald-500 focus:ring-emerald-500 focus:border-emerald-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
              placeholder={placeholder}
            />
          )}

          {isValid && type !== 'password' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          )}
          
          {type === 'password' && (
            <button
              type="button"
              onClick={() => id === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {id === 'password' ? (showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />) : (showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />)}
            </button>
          )}
        </div>
        
        {id === 'password' && !isLogin && !isReset && (
          <div className="text-xs mt-2 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="font-semibold mb-1">Password requirements:</p>
            <ul className="space-y-1">
              <li className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-600' : 'text-gray-500'}`}>
                {password.length >= 8 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '○'} At least 8 characters
              </li>
              <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                {/[A-Z]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : '○'} One uppercase letter
              </li>
              <li className={`flex items-center gap-1.5 ${/[a-z]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                {/[a-z]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : '○'} One lowercase letter
              </li>
              <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                {/[0-9]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : '○'} One number
              </li>
              <li className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-600' : 'text-gray-500'}`}>
                {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : '○'} One special character
              </li>
            </ul>
          </div>
        )}

        {hasError && id !== 'password' && (
          <p className="mt-1 text-sm text-red-600 font-medium">{errors[id]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col justify-center items-center p-4">
      {connectionStatus && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg font-semibold text-sm transition-opacity duration-300 ${
          connectionStatus.includes('successfully') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 
          connectionStatus.includes('Failed') ? 'bg-rose-100 text-rose-800 border border-rose-300' :
          'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          {connectionStatus}
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-[#D8E2DA] my-8">
        <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <HeartPulse className="w-32 h-32 text-emerald-200" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <ApnaMitraLogo className="w-16 h-16 text-white mb-4" />
            <h1 className="text-3xl font-extrabold text-white mb-2">{currentLang === 'hi' ? 'अपना मित्र' : currentLang === 'bn' ? 'আপন মিত্র' : 'Apna Mitra'}</h1>
            <p className="text-emerald-100 font-medium">{currentLang === 'hi' ? 'आपका स्वास्थ्य और गार्जियन डैशबोर्ड' : currentLang === 'bn' ? 'আপনার স্বাস্থ্য এবং অভিভাবক ড্যাশবোর্ড' : 'Your Health & Guardian Dashboard'}</p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#153A34] mb-6 text-center">
            {isReset ? 'Reset Your Password' : isLogin ? (authMode === 'admin' ? 'Admin Sign In' : 'Sign In to Your Account') : (authMode === 'admin' ? 'Create Admin Account' : 'Create a New Account')}
          </h2>
          
          {!isLogin && !isReset && (
             <p className="text-sm text-red-600 font-medium mb-6 text-center">* Required field</p>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {resetSent && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3 text-sm">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{currentLang === 'hi' ? 'पासवर्ड रीसेट ईमेल भेजा गया! कृपया अपना इनबॉक्स जांचें।' : currentLang === 'bn' ? 'পাসওয়ার্ড রিসেট ইমেল পাঠানো হয়েছে! আপনার ইনবক্স চেক করুন.' : 'Password reset email sent! Please check your inbox.'}</span>
            </div>
          )}

          {error && onGuestLogin && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
              <p className="text-sm mb-3">
                <strong>Testing Options</strong><br />
                Click below to bypass authentication and test the app using a Demo account.
              </p>
              <button
                type="button"
                onClick={onGuestLogin}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition shadow-sm"
              >
                Skip Login & Use Demo Account
              </button>
            </div>
          )}
          
          <form onSubmit={isReset ? handleResetPassword : handleSubmit} className="space-y-1" noValidate>
            
            {/* FULL NAME */}
            {!isLogin && !isReset && renderField('fullName', 'Full Name', 'text', fullName, setFullName, <User className="h-5 w-5 text-gray-400" />, 'Ram Prakash Sharma')}
            
            {/* EMAIL */}
            {isLogin || isReset ? (
               <div className="mb-5">
                 <label className="block text-sm font-semibold text-[#153A34] mb-2">{currentLang === 'hi' ? 'ईमेल पता' : currentLang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-gray-400" />
                   </div>
                   <input
                     type="email"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 transition"
                     placeholder="patient@example.com"
                   />
                 </div>
               </div>
            ) : renderField('email', 'Email Address', 'email', email, setEmail, <Mail className="h-5 w-5 text-gray-400" />, 'patient@example.com')}

            {/* PHONE */}
            {!isLogin && !isReset && renderField('phone', 'Phone Number', 'tel', phone, setPhone, <Phone className="h-5 w-5 text-gray-400" />, '+91 9876543210')}

            {/* DOB & GENDER */}
            {!isLogin && !isReset && (
              <div className="grid grid-cols-2 gap-4">
                {renderField('dob', 'Date of Birth', 'date', dob, setDob, null, '')}
                {renderField('gender', 'Gender', 'select', gender, setGender, null, '')}
              </div>
            )}

            {/* ADDRESS */}
            {!isLogin && !isReset && renderField('address', 'Address', 'textarea', address, setAddress, <MapPin className="h-5 w-5 text-gray-400" />, 'Enter your full address')}

            {/* GUARDIAN TOGGLE AND FIELDS */}
            {!isLogin && !isReset && authMode === 'patient' && (
              <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold text-[#153A34] mb-3">
                  Do you need a Guardian/Caretaker? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="guardianToggle" checked={needsGuardian === true} onChange={() => setNeedsGuardian(true)} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span className="text-sm font-medium">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="guardianToggle" checked={needsGuardian === false} onChange={() => {
                      setNeedsGuardian(false);
                      setGuardianName('');
                      setGuardianPhone('');
                      setErrors(prev => { const n = {...prev}; delete n.guardianName; delete n.guardianPhone; return n; });
                      setTouched(prev => { const n = {...prev}; delete n.guardianName; delete n.guardianPhone; return n; });
                    }} className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                    <span className="text-sm font-medium">No</span>
                  </label>
                </div>

                {needsGuardian && (
                  <div className="space-y-1 mt-4">
                    {renderField('guardianName', 'Guardian/Caretaker Name', 'text', guardianName, setGuardianName, <User className="h-5 w-5 text-gray-400" />, 'Guardian Name')}
                    {renderField('guardianPhone', 'Guardian/Caretaker Phone', 'tel', guardianPhone, setGuardianPhone, <Phone className="h-5 w-5 text-gray-400" />, '9876543210')}
                  </div>
                )}
              </div>
            )}

            {/* PASSWORD */}
            {isLogin || isReset ? (
              !isReset && (
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-[#153A34]">{currentLang === 'hi' ? 'पासवर्ड' : currentLang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReset(true);
                          setError(null);
                          setResetSent(false);
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )
            ) : renderField('password', 'Password', 'password', password, setPassword, <Lock className="h-5 w-5 text-gray-400" />, '••••••••')}

            {/* CONFIRM PASSWORD */}
            {!isLogin && !isReset && renderField('confirmPassword', 'Confirm Password', 'password', confirmPassword, setConfirmPassword, <Lock className="h-5 w-5 text-gray-400" />, '••••••••')}

            {/* TERMS & CONDITIONS */}
            {!isLogin && !isReset && (
              <div className="mb-6 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      ref={fieldRefs.termsAccepted}
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (touched.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: validateField('termsAccepted', e.target.checked) }));
                      }}
                      onBlur={() => handleBlur('termsAccepted', termsAccepted)}
                      className="w-5 h-5 opacity-0 absolute"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${termsAccepted ? 'bg-emerald-600 border-emerald-600' : touched.termsAccepted && errors.termsAccepted ? 'border-red-500 bg-red-50' : 'border-gray-400 bg-white group-hover:border-emerald-500'}`}>
                      {termsAccepted && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 leading-tight">
                    I agree to the <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-emerald-600 hover:underline">Terms & Conditions</button> and <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-emerald-600 hover:underline">Privacy Policy</button>. <span className="text-red-500">*</span>
                  </span>
                </label>
                {touched.termsAccepted && errors.termsAccepted && (
                  <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.termsAccepted}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
              <ShieldCheck className="w-5 h-5" />
              {loading ? 'Please wait...' : isReset ? 'Send Reset Link' : isLogin ? 'Secure Sign In' : 'Register / Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <button onClick={() => { setAuthMode('patient'); setIsLogin(true); setError(null); }} className={`font-bold transition p-2 rounded-lg ${authMode === 'patient' && isLogin ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-50 text-gray-600 hover:bg-emerald-50'}`}>
                Patient Login
              </button>
              <button onClick={() => { setAuthMode('patient'); setIsLogin(false); setError(null); }} className={`font-bold transition p-2 rounded-lg ${authMode === 'patient' && !isLogin ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-50 text-gray-600 hover:bg-emerald-50'}`}>
                Patient Registration
              </button>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button onClick={() => { setAuthMode('admin'); setIsLogin(true); setError(null); }} className={`text-xs font-bold transition ${authMode === 'admin' ? 'text-emerald-700 underline' : 'text-gray-400 hover:text-gray-600'}`}>
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 mb-12 text-center text-sm text-gray-500 max-w-sm">
        <p>{currentLang === 'hi' ? 'आगे बढ़कर, आप हमारी सख्त चिकित्सा गोपनीयता नीति और गार्जियन सेवा की शर्तों से सहमत होते हैं।' : currentLang === 'bn' ? 'এগিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের কঠোর চিকিৎসা গোপনীয়তা নীতি এবং অভিভাবক পরিষেবার শর্তাবলীতে সম্মত হন।' : 'By proceeding, you agree to our strict Medical Privacy Policy and Guardian Terms of Service.'}</p>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};
