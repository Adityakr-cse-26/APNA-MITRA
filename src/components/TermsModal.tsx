import React from 'react';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-emerald-50">
          <h2 className="text-xl font-bold text-[#153A34]">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 text-gray-700 space-y-4 text-sm leading-relaxed">
          <p className="font-semibold text-gray-900">Last Updated: September 4, 2026</p>
          
          <p>
            Welcome to APNA MITRA. Our platform is designed to support people aged 50 years and above through games, books, doctor appointments, daily health awareness, AI chatbot, health tracking, and emergency guardian alerts.
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Our services are provided for support, awareness, and informational purposes only.</li>
            <li>The AI chatbot and health checker do not provide medical diagnosis or treatment and are not a replacement for doctors or healthcare professionals.</li>
            <li>Users should consult a qualified doctor for medical advice and treatment.</li>
            <li>The emergency alert feature is only a supportive notification tool and should not replace emergency medical services.</li>
            <li>Users must provide accurate information and keep their account credentials secure.</li>
            <li>Users must not misuse the website or access another person's account without permission.</li>
            <li>Health and personal information will be handled according to our Privacy Policy.</li>
            <li>We may update these Terms & Conditions when necessary.</li>
          </ul>
          
          <p className="pt-2 font-medium text-gray-900">
            By using our website, you confirm that you have read and agree to these Terms & Conditions.
          </p>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
