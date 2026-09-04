import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Lock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { ApnaMitraLogo } from './ApnaMitraLogo';

export const ResetPasswordScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally check if we actually have a session/recovery token
    // Supabase will parse the URL fragment automatically on load
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // If there's no session, it might still be initializing or the link is invalid
        // But we'll let the user attempt it, or show a warning. 
        // Supabase handles the recovery token and logs the user in.
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#F4F7F4] flex flex-col justify-center items-center p-4">
      <div className="mb-8">
        <ApnaMitraLogo />
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#1F4E46]/10 w-full max-w-md border border-[#D8E2DA]">
        <h2 className="text-2xl font-bold text-[#153A34] mb-6 text-center">
          Set New Password
        </h2>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-[#153A34] mb-2">Password changed successfully.</p>
            <p className="text-sm text-[#5B6B60] mb-8">You can now use your new password to log in.</p>
            <button
              onClick={goToLogin}
              className="w-full py-3 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#35483F]">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4E46]/20 focus:border-[#1F4E46] transition text-[#153A34]"
                  placeholder="Enter secure password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#35483F]">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F4F7F4] border border-[#D8E2DA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F4E46]/20 focus:border-[#1F4E46] transition text-[#153A34]"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl font-bold transition flex items-center justify-center gap-2 mt-6 shadow-md shadow-[#1F4E46]/20 disabled:opacity-70"
            >
              <ShieldCheck className="w-5 h-5" />
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
