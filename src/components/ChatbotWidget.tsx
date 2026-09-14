import React, { useEffect, useState } from 'react';
import { Headphones } from 'lucide-react';
import botLogo from '../assets/images/regenerated_image_1788194782353.jpg';

export const ChatbotWidget: React.FC = () => {
  const [imgError, setImgError] = useState(false);
  const logoSrc = botLogo;

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    link.rel = 'stylesheet';
    link.id = 'n8n-chat-style';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.type = 'module';
    script.id = 'n8n-chat-script';
    script.innerHTML = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';
      
      // Override fetch to swallow CORS/Failed to fetch errors from the offline n8n webhook
      const originalFetch = window.fetch;
      try {
        Object.defineProperty(window, 'fetch', {
          configurable: true,
          writable: true,
          value: async function(...args) {
            if (typeof args[0] === 'string' && args[0].includes('n8n.cloud')) {
              try {
                const res = await originalFetch.apply(this, args);
                if (!res.ok) {
                  return new Response(JSON.stringify({ text: "I am currently offline. Please try again later.", sessionId: "123" }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
                return res;
              } catch (err) {
                console.warn("n8n webhook fetch failed, mocking response to avoid unhandled rejection.");
                return new Response(JSON.stringify({ text: "I am currently offline. Please try again later.", sessionId: "123" }), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            }
            return originalFetch.apply(this, args);
          }
        });
      } catch (e) {
        console.warn("Could not override fetch:", e);
      }

      window.n8nChatInstance = createChat({
        webhookUrl: "https://dipa06.app.n8n.cloud/webhook/15425286-5dcc-4d03-ab4e-1c8f48df0cc5/chat",
        showWelcomeScreen: true,
        initialMessages: ["Hello! I am ApnaMitra, your personal AI Health Assistant. How can I help you today?"],
        i18n: {
          en: {
            title: 'Welcome to ApnaMitra',
            subtitle: 'Hello! I am your AI Health Assistant. How can I help you today?',
            getStarted: 'Start Chatting',
            inputPlaceholder: 'Type your health query...'
          }
        }
      });
    `;
    document.body.appendChild(script);

    // Observer to inject the logo into the n8n chat header
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const chatHeader = document.querySelector('.chat-header') as HTMLElement;
        if (chatHeader && !chatHeader.querySelector('.chatbot-header-logo')) {
          chatHeader.style.flexDirection = 'row';
          chatHeader.style.justifyContent = 'flex-start';
          chatHeader.style.alignItems = 'center';
          chatHeader.style.gap = '0';
          
          // Wrap text elements
          const title = chatHeader.querySelector('h1');
          const subtitle = chatHeader.querySelector('p');
          
          if (title && subtitle && !chatHeader.querySelector('.chat-header-text-wrapper')) {
            const textWrapper = document.createElement('div');
            textWrapper.className = 'chat-header-text-wrapper';
            textWrapper.style.display = 'flex';
            textWrapper.style.flexDirection = 'column';
            textWrapper.style.gap = '0.2rem';
            
            chatHeader.appendChild(textWrapper);
            textWrapper.appendChild(title);
            textWrapper.appendChild(subtitle);
          }

          // Create logo container
          const logoContainer = document.createElement('div');
          logoContainer.className = 'chatbot-header-logo';
          logoContainer.style.marginRight = '12px';
          logoContainer.style.display = 'flex';
          logoContainer.style.alignItems = 'center';
          logoContainer.style.justifyContent = 'center';
          
          const img = document.createElement('img');
          img.src = logoSrc;
          img.alt = 'Chatbot Logo';
          img.style.width = '48px';
          img.style.height = '48px';
          img.style.objectFit = 'contain';
          img.style.borderRadius = '50%';
          
          img.onerror = () => {
            img.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #6ee7b7;"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path></svg>';
            fallback.style.width = '48px';
            fallback.style.height = '48px';
            fallback.style.display = 'flex';
            fallback.style.alignItems = 'center';
            fallback.style.justifyContent = 'center';
            fallback.style.backgroundColor = '#153A34';
            fallback.style.borderRadius = '50%';
            logoContainer.appendChild(fallback);
          };

          logoContainer.appendChild(img);
          chatHeader.insertBefore(logoContainer, chatHeader.firstChild);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      const styleEl = document.getElementById('n8n-chat-style');
      if (styleEl) styleEl.remove();
      
      const scriptEl = document.getElementById('n8n-chat-script');
      if (scriptEl) scriptEl.remove();

      const chatApp = document.querySelector('.chat-window');
      if (chatApp) chatApp.remove();
      
      const chatToggle = document.querySelector('.chat-window-toggle');
      if (chatToggle) chatToggle.remove();
    };
  }, []);

  const handleOpenChat = (e: React.MouseEvent) => {
    e.preventDefault();
    const toggleBtn = document.querySelector('.chat-window-toggle') as HTMLButtonElement;
    if (toggleBtn) {
      toggleBtn.click();
    }
  };

  return (
    <>
      <style>{`
        /* Hide the default n8n chat button initially with smooth transition */
        .chat-window-toggle {
            opacity: 0 !important;
            visibility: hidden !important;            
            transform: scale(0.9);
            transition: all 0.3s ease !important;
            position: absolute !important;
            pointer-events: none;
        }

        /* Define chat window transition duration to ensure it doesn't disappear instantly */
        .chat-window-wrapper {
            --chat--transition-duration: 0.3s;
        }

        /* When the chat window is open, show the 'X' toggle button inside the top right */
        .chat-window-wrapper:has(.chat-window) .chat-window-toggle {
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto;
            transform: scale(1);
            position: absolute !important;
            top: 12px;
            right: 12px;
            z-index: 99999;
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            box-shadow: none;
            display: flex !important;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
        }
        
        .chat-window-wrapper:has(.chat-window) .chat-window-toggle:hover {
            transform: scale(1.1);
            background: #ef4444 !important;
            color: white !important;
        }
      `}</style>
      
      <div id="ai" className="relative flex items-center justify-center">
        <button
          onClick={handleOpenChat}
          className="p-1.5 bg-[#153A34] hover:bg-[#22312B] text-white rounded-full shadow-2xl flex items-center gap-2 border-2 border-white text-xs font-bold transition transform hover:scale-105 active:scale-95"
          title="AI Health Assistant"
        >
          {imgError ? (
            <div className="w-10 h-10 flex items-center justify-center bg-[#153A34] rounded-full">
              <Headphones className="w-5 h-5 text-emerald-300" />
            </div>
          ) : (
            <img 
              src={logoSrc} 
              alt="Mitra AI" 
              className="w-10 h-10 object-contain rounded-full shadow-sm" 
              onError={() => setImgError(true)}
            />
          )}
        </button>
      </div>
    </>
  );
};
