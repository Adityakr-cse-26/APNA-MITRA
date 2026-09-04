import React, { useState } from 'react';
import { Headphones } from 'lucide-react';

export const ChatAvatar: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  const [imgError, setImgError] = useState(false);
  const src = "/assets/chatbot-logo.jpeg";

  if (imgError) {
    return (
      <div className={`flex items-center justify-center bg-[#153A34] rounded-full ${className}`}>
        <Headphones className="w-5 h-5 text-emerald-300" />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt="Mitra AI" 
      className={`object-cover rounded-full shadow-sm ${className}`}
      onError={() => setImgError(true)}
    />
  );
};
