import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, HeartPulse } from 'lucide-react';
import { ApnaMitraLogo } from './ApnaMitraLogo';

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError("Please enter your email address.");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError("Please enter a valid email format.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailTrimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email.");
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
            Forgot Password?
          </h2>
          <p className="text-gray-600 text-sm font-medium mb-6 text-center">
            Enter your registered email address and we will send you a password reset link.
          </p>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Sent</h3>
              <p className="text-gray-600 mb-6">Password reset link has been sent to your email. Please check your inbox.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl transition"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-800">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-800 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
