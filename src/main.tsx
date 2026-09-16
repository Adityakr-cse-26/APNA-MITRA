import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// CRITICAL: Intercept Supabase Recovery URLs before React or Supabase initialize
// This catches emails where the redirect_to is stripped or falls back to the root '/'
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  const search = window.location.search;
  if (hash.includes('type=recovery') || search.includes('type=recovery')) {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    if (currentPath !== '/reset-password' && !currentPath.endsWith('/reset-password')) {
      window.location.replace('/reset-password' + search + hash);
    }
  }
}

import App from './App.tsx';
import './index.css';

// Monkey-patch Node.prototype to prevent React crashes with Google Translate
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    if (child.parentNode !== this) {
      if (console) console.warn('Google Translate React conflict avoided in removeChild');
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) console.warn('Google Translate React conflict avoided in insertBefore');
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
