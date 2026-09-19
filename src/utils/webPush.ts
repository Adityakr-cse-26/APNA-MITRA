export const VAPID_PUBLIC_KEY = 'BKbl38v0s7bo7hKSSyXHmmVbo0RWdGAC7AxlHVCLv4dgyn_g5rVxPNicAcTthXxMnL64pD4eFx9HzDN_6L48iqk';

export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error("Service Worker not supported by your browser.");
  }
  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn("Error getting current push subscription:", err);
    return null;
  }
}

export async function subscribeUserToPush(): Promise<PushSubscription> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  const registration = await registerServiceWorker();
  
  if (Notification.permission === 'denied') {
    throw new Error("Permission Denied: Your browser has blocked notifications. Please allow notifications in your browser address bar settings.");
  }
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error("Permission Denied: You must grant notification permission to receive medicine reminders.");
  }

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  };
    
  const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
  return pushSubscription;
}

export async function unsubscribeUserFromPush(): Promise<boolean> {
  try {
    const sub = await getCurrentPushSubscription();
    if (sub) {
      await sub.unsubscribe();
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Unsubscribe push error:", err);
    return false;
  }
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

