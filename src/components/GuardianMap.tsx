import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, Clock, MapPin, Loader2, Navigation, Phone, HeartPulse, ShieldAlert } from 'lucide-react';

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AlertData {
  id: string;
  patient_id: string;
  location_lat: number | null;
  location_lng: number | null;
  location_accuracy: number | null;
  location_timestamp: string | null;
  status: string;
  patientProfile?: { full_name?: string; blood_group?: string; health_info?: string; };
}

export const GuardianMap: React.FC<{ alertId: string }> = ({ alertId }) => {
  const [alertData, setAlert] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
           // Provide a temporary prompt for login if we needed, but normally Guardian is logged in.
           // Because we can't do complex login flow here, we just show login error.
           setAuthError(true);
           setLoading(false);
           return;
        }

        const { data, error } = await supabase
          .from('emergency_alerts')
          .select('id, patient_id, location_lat, location_lng, location_accuracy, location_timestamp, status')
          .eq('id', alertId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Alert not found");
        
        // Attempt to fetch patient profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, blood_group, health_info')
          .eq('id', data.patient_id)
          .maybeSingle();

        setAlert({ ...data, patientProfile: profileData || undefined });
      } catch (err: any) {
        console.error("Fetch alert error:", err);
        setError(err.message || "Failed to load location.");
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [alertId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You must be logged in as an authorized guardian to view this patient's location.</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium">Return to Login</button>
      </div>
    );
  }

  if (error || !alertData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Location</h2>
        <p className="text-gray-600 mb-6">{error || "The alert record may not exist or you don't have permission to view it."}</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium">Return to Dashboard</button>
      </div>
    );
  }

  if (!alertData.location_lat || !alertData.location_lng) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <MapPin className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Location Unavailable</h2>
        <p className="text-gray-600 mb-6">The patient triggered an SOS, but their GPS location could not be captured.</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-rose-700 text-white p-4 shadow-md z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold">Emergency Patient Location</h1>
        </div>
        <button onClick={() => window.location.href = '/'} className="text-sm underline hover:text-rose-200">
          Close
        </button>
      </header>
      
      <div className="bg-white p-4 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 border-b">
        <div className="flex items-center gap-2 text-gray-700">
          <Clock className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Reported: {new Date(alertData.location_timestamp || Date.now()).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Navigation className="w-5 h-5 text-emerald-600" />
          <span className="font-medium">Accuracy: ~{alertData.location_accuracy ? Math.round(alertData.location_accuracy) : 'Unknown'} meters</span>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        
        {/* Floating Action / Info Card */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md bg-white rounded-2xl shadow-2xl z-[1000] border border-gray-100 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-rose-50 px-5 py-4 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center text-rose-700">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{alertData.patientProfile?.full_name || 'Patient'}</h3>
                <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Active SOS Emergency</p>
              </div>
            </div>
          </div>
          
          {/* Medical Details */}
          <div className="px-5 py-4 bg-white grid grid-cols-2 gap-4 border-b border-gray-100">
             <div>
                <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><HeartPulse className="w-3 h-3"/> Blood Group</p>
                <p className="font-bold text-gray-800">{alertData.patientProfile?.blood_group || 'Unknown'}</p>
             </div>
             <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Health Info</p>
                <p className="font-bold text-gray-800 text-sm truncate">{alertData.patientProfile?.health_info || 'Not provided'}</p>
             </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-gray-50 flex gap-3">
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${alertData.location_lat},${alertData.location_lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </a>
            <a 
              href="tel:" 
              onClick={() => alert("Normally this would dial the patient's phone number from their profile.")}
              className="flex-none w-14 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center transition"
              title="Call Patient"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>

        <MapContainer 
          center={[alertData.location_lat, alertData.location_lng]} 
          zoom={16} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[alertData.location_lat, alertData.location_lng]}>
            <Popup>
              <strong>Patient SOS Location</strong><br/>
              Reported at {new Date(alertData.location_timestamp || Date.now()).toLocaleTimeString()}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
