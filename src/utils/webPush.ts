export const VAPID_PUBLIC_KEY = 'BKbl38v0s7bo7hKSSyXHmmVbo0RWdGAC7AxlHVCLv4dgyn_g5rVxPNicAcTthXxMnL64pD4eFx9HzDN_6L48iqk';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error("Service Worker not supported");
  }
  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
}

export async function subscribeUserToPush() {
  const registration = await registerServiceWorker();
  
  if (Notification.permission === 'denied') {
    throw new Error("Permission Denied: Your browser blocked notifications.");
  }
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error("Permission Denied: You must allow notifications.");
  }

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  };
    
  const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
  return pushSubscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
