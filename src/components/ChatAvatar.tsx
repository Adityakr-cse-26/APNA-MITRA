import React, { useState } from 'react';
import robotLogo from '../assets/chatbot-logo.png';

interface ChatAvatarProps {
  className?: string;
  alt?: string;
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  className = "w-10 h-10",
  alt = "Apna Mitra Health AI Robot"
}) => {
  const [imgError, setImgError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(robotLogo || "/assets/chatbot-logo.png");

  const handleError = () => {
    // If bundled asset fails, try public direct path
    if (currentSrc !== "/assets/chatbot-logo.png" && currentSrc !== "/chatbot-logo.png") {
      setCurrentSrc("/assets/chatbot-logo.png");
    } else if (currentSrc === "/assets/chatbot-logo.png") {
      setCurrentSrc("/chatbot-logo.png");
    } else {
      setImgError(true);
    }
  };

  if (imgError) {
    return (
      <div className={`flex items-center justify-center bg-emerald-600 text-white font-bold rounded-full text-xs shadow-sm flex-shrink-0 ${className}`}>
        AM
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0 ring-1 ring-emerald-500/20 shadow-sm ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain p-0.5 rounded-full transition-transform hover:scale-105"
        onError={handleError}
      />
    </div>
  );
};

