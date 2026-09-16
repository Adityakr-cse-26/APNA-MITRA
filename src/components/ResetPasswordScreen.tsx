import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, HeartPulse } from 'lucide-react';
import { ApnaMitraLogo } from './ApnaMitraLogo';

interface ResetPasswordScreenProps {
  onResetComplete: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onResetComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check for errors from Supabase redirect (usually in hash, sometimes query)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const searchParams = new URLSearchParams(window.location.search);
    
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    if (errorDesc) {
      setError(errorDesc.replace(/\+/g, ' ') || "This password reset link is invalid or has expired. Please request a new password reset link.");
      return;
    }

    // Verify session exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If not immediately available, wait a moment to see if it's still processing
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession) {
            setError(null);
          }
        });
        
        // Timeout after 2 seconds if no session is established
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: finalSession } }) => {
            if (!finalSession) {
              setError("This password reset link is invalid or has expired. Please request a new password reset link.");
            }
            subscription.unsubscribe();
          });
        }, 2000);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      
      if (updateError) throw updateError;
      
      setSuccess(true);
      // Wait a bit, sign out so they have to login again with new password
      
    } catch (err: any) {
      setError(err.message || "Failed to update password. Your link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E2E4E0] my-8">
        <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <HeartPulse className="w-32 h-32 text-emerald-200" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white p-3 rounded-2xl mb-4 shadow-md inline-flex items-center justify-center">
              <ApnaMitraLogo size="xl" variant="full" showTagline={false} />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Apna Mitra</h1>
            <p className="text-emerald-100 font-medium">Your Health & Guardian Dashboard</p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#153A34] mb-6 text-center">
            Reset Password
          </h2>
          <p className="text-gray-600 text-sm font-medium mb-6 text-center">
            Create a new password for your account
          </p>
          
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your password has been updated successfully.</h3>
              <p className="text-gray-600 mb-6">Please login with your new password.</p>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  onResetComplete();
                }}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl transition"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-800">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Min 6 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-emerald-700 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements:</p>
                    <ul className="text-xs space-y-1.5">
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
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-800">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-900/20 disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
