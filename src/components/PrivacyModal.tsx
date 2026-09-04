import React from 'react';
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-emerald-50">
          <h2 className="text-xl font-bold text-[#153A34]">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 text-gray-700 space-y-4 text-sm leading-relaxed">
          <p className="font-semibold text-gray-900">Privacy Policy Information</p>
          
          <p>
            Your privacy is important to us. APNA MITRA collects and securely manages your personal and health information to provide you with the best possible support, emergency alerts, and tailored services.
          </p>
          
          <p>
            We adhere to strict data protection principles and will not share your personal information with unauthorized third parties. All emergency contacts and health data are handled with the highest level of confidentiality.
          </p>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
