import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { ApnaMitraLogo } from './ApnaMitraLogo';
import * as tus from 'tus-js-client';
import { Users, UserPlus, Stethoscope, Calendar, Settings, LogOut, Check, X, Edit, Trash2, Activity, Plus, BookOpen } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'patients' | 'appointments' | 'books'>('overview');  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, pendingAppointments: 0 });

  useEffect(() => {
    fetchStats();
  }, [activeTab]); // Refetch on tab change

  useEffect(() => {
    const handleGoHome = () => {
      setActiveTab('overview');
      // Scroll main content area to top if possible
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('navigateHome', handleGoHome);
    return () => window.removeEventListener('navigateHome', handleGoHome);
  }, []);

  const fetchStats = async () => {
    const [{ count: pCount }, { count: dCount }, { count: aCount }, { count: pendingCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('doctors').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    setStats({
      patients: pCount || 0,
      doctors: dCount || 0,
      appointments: aCount || 0,
      pendingAppointments: pendingCount || 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <ApnaMitraLogo size="xs" variant="horizontal" showTagline={false} />
            <span className="ml-2 text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md uppercase tracking-wider">Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Activity className="w-5 h-5" /> Dashboard Overview
          </button>
          <button onClick={() => setActiveTab('doctors')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'doctors' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Stethoscope className="w-5 h-5" /> Doctor Management
          </button>
          <button onClick={() => setActiveTab('patients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'patients' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Users className="w-5 h-5" /> Patient Management
          </button>
          <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'appointments' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Calendar className="w-5 h-5" /> Appointments
          </button>
          <button onClick={() => setActiveTab('books')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'books' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            <BookOpen className="w-5 h-5" /> Books Library
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition">
            <LogOut className="w-4 h-4" /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-5">
      <Activity className="w-48 h-48 text-indigo-900" />
    </div>
    <div className="relative z-10">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to Admin Portal</h2>
      <p className="text-gray-500 max-w-2xl text-lg">Manage your healthcare platform securely. Overview statistics, doctor availability, patient records, and appointment schedules.</p>
    </div>
  </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Patients" value={stats.patients} icon={<Users className="w-6 h-6 text-blue-600" />} bg="bg-blue-50" />
              <StatCard title="Total Doctors" value={stats.doctors} icon={<Stethoscope className="w-6 h-6 text-green-600" />} bg="bg-green-50" />
              <StatCard title="Total Appointments" value={stats.appointments} icon={<Calendar className="w-6 h-6 text-purple-600" />} bg="bg-purple-50" />
              <StatCard title="Pending Appts" value={stats.pendingAppointments} icon={<Calendar className="w-6 h-6 text-amber-600" />} bg="bg-amber-50" />
            </div>
          </div>
        )}
        
        {activeTab === 'doctors' && <DoctorsManager />}
        {activeTab === 'patients' && <PatientsManager />}
        {activeTab === 'appointments' && <AppointmentsManager />}
        {activeTab === 'books' && <BooksManager />}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-xl ${bg}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// DOCTORS MANAGER
const DoctorsManager = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', specialization: '', available_days: '', available_time_start: '', available_time_end: '', email: '', phone: '', status: 'active' });

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    if (data) setDoctors(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      // Ensure available_days is properly formatted if it's meant to be a string or array
      // In the database it seems it might be stored as an array or string
      available_days: formData.available_days.split(',').map(d => d.trim()),
    };
    
    if (editingDoctor) {
      await supabase.from('doctors').update(dataToSave).eq('id', editingDoctor.id);
    } else {
      await supabase.from('doctors').insert([dataToSave]);
    }
    setIsModalOpen(false);
    fetchDoctors();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate/delete this doctor?')) {
      await supabase.from('doctors').delete().eq('id', id);
      fetchDoctors();
    }
  };

  const openAdd = () => {
    setEditingDoctor(null);
    setFormData({ name: '', specialization: '', available_days: '', available_time_start: '', available_time_end: '', email: '', phone: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (d: any) => {
    setEditingDoctor(d);
    
    // Handle parsing the available_days whether it's stored as array or string
    let parsedDays = '';
    if (Array.isArray(d.available_days)) {
      parsedDays = d.available_days.join(', ');
    } else if (typeof d.available_days === 'string') {
      parsedDays = d.available_days.replace(/[\[\]"]/g, '');
    }
    
    setFormData({ 
      name: d.name || '', 
      specialization: d.specialization || '', 
      available_days: parsedDays, 
      available_time_start: d.available_time_start || '', 
      available_time_end: d.available_time_end || '', 
      email: d.email || '', 
      phone: d.phone || '', 
      status: d.status || 'active' 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Available Day</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">End Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No doctors found. Add one to get started.</td></tr>
              ) : doctors.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{d.name}</td>
                  <td className="px-6 py-4 text-gray-600">{d.specialization}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {Array.isArray(d.available_days) ? d.available_days.join(', ') : typeof d.available_days === 'string' ? d.available_days.replace(/[\[\]"]/g, '') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.available_time_start || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{d.available_time_end || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {d.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 my-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Days (comma separated)</label>
                <input required type="text" placeholder="e.g. Monday, Wednesday" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.available_days} onChange={e => setFormData({...formData, available_days: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input required type="text" placeholder="e.g. 10:00 AM" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.available_time_start} onChange={e => setFormData({...formData, available_time_start: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input required type="text" placeholder="e.g. 02:00 PM" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.available_time_end} onChange={e => setFormData({...formData, available_time_end: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// PATIENTS MANAGER
const PatientsManager = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (data) setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Age / Gender</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No patients found.</td></tr>
              ) : patients.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{(p.name || p.full_name) || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.age ? `${p.age} yrs` : 'N/A'} / {p.gender || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.blood_group || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// APPOINTMENTS MANAGER
const AppointmentsManager = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { 
    fetchAppointments(); 
    
    // Subscribe to realtime updates for appointments
    const channel = supabase.channel('admin-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: false });
    if (data) setAppointments(data);
    setLoading(false);
  };

  const handleConfirm = async (appointment: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    const { error } = await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', appointment.id);
    if (error) {
      setErrorMsg(`Failed to confirm appointment: ${error.message}`);
      return;
    }
    
    setSuccessMsg('Appointment confirmed successfully.');
    
    // Notify patient
    if (appointment.patient_id) {
      await supabase.from('notifications').insert([{
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name || 'Patient',
        title: "✅ Appointment Confirmed",
        message: `Your appointment with Dr. ${appointment.doctor_name || 'Doctor'} on ${appointment.appointment_date} at ${appointment.appointment_time} has been confirmed.`,
        type: "APPOINTMENT",
        is_read: false
      }]);
    }
    fetchAppointments();
  };
  
  const handleReject = async (appointment: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    const reason = window.prompt("Optional rejection reason:", "");
    if (reason === null) return; // User cancelled
    
    const updateData: any = { status: 'rejected' };
    if (reason.trim()) {
      updateData.rejection_reason = reason.trim();
    }
    
    const { error } = await supabase.from('appointments').update(updateData).eq('id', appointment.id);
    if (error) {
      setErrorMsg(`Failed to reject appointment: ${error.message}`);
      return;
    }
    
    setSuccessMsg('Appointment rejected successfully.');
    
    // Notify patient
    if (appointment.patient_id) {
      await supabase.from('notifications').insert([{
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name || 'Patient',
        title: "❌ Appointment Rejected",
        message: `Your appointment with Dr. ${appointment.doctor_name || 'Doctor'} on ${appointment.appointment_date} at ${appointment.appointment_time} has been rejected.${reason.trim() ? ' Reason: ' + reason.trim() : ''}`,
        type: "APPOINTMENT",
        is_read: false
      }]);
    }
    fetchAppointments();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    if (error) {
       setErrorMsg(`Failed to update status: ${error.message}`);
       return;
    }
    fetchAppointments();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
      
      {errorMsg && <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{errorMsg}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">{successMsg}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Doctor Info</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No appointments found.</td></tr>
              ) : appointments.map(a => {
                const isPending = !a.status || a.status === 'pending';
                return (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{a.patient_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{a.patient_phone || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{a.doctor_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{a.notes || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : 'N/A'} <br/>
                    <span className="text-sm text-gray-500">{a.appointment_time || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full 
                      ${a.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                        a.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        a.status === 'rejected' || a.status === 'cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {isPending ? 'pending' : a.status}
                    </span>
                    {a.rejection_reason && (
                      <div className="text-xs text-rose-600 mt-1 max-w-[150px] truncate" title={a.rejection_reason}>
                        Reason: {a.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-y-2">
                    {isPending ? (
                      <div className="flex flex-col gap-2 items-end">
                        <button 
                          onClick={() => handleConfirm(a)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                        >
                          ✓ Confirm
                        </button>
                        <button 
                          onClick={() => handleReject(a)}
                          className="px-3 py-1.5 text-xs font-semibold bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <select 
                        value={a.status || 'pending'} 
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


// BOOKS MANAGER
const BooksManager = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    language: 'English',
    description: '',
    cover_url: '',
    pdf_url: ''
  });

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate if it is a PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    setUploadingPdf(true);
    setUploadProgress(0);
    
    // Sanitize filename
    const fileExt = file.name.split('.').pop() || 'pdf';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const sanitizedBase = baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${sanitizedBase}_${Date.now()}.${fileExt}`;
    
    const sizeInMB = file.size / (1024 * 1024);
    
    const targetBucket = formData.language === 'English' ? 'English Books' : formData.language === 'Bengali' ? 'Bengali Books' : 'book';

    try {
      if (sizeInMB <= 6) {
        const { error: uploadError } = await supabase.storage
          .from(targetBucket)
          .upload(fileName, file, { upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
        setFormData({ ...formData, pdf_url: data.publicUrl });
        alert('PDF uploaded successfully!');
        setUploadingPdf(false);
        setUploadProgress(0);
      } else {
        // TUS Resumable upload for > 6MB
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
           throw new Error('Not authenticated for large file upload.');
        }
        
        let baseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co').replace(/^[\"']|[\"']$/g, '').trim().replace(/\/$/, '');
        if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
        const uploadUrl = `${baseUrl}/storage/v1/upload/resumable`;

        const upload = new tus.Upload(file, {
          endpoint: uploadUrl,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
            'x-upsert': 'false',
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: targetBucket,
            objectName: fileName,
            contentType: file.type || 'application/pdf',
          },
          chunkSize: 6 * 1024 * 1024, // 6MB chunks
          onError: (error) => {
             console.error('TUS Upload error:', error);
             let errMsg = error.message || 'Unknown error';
             if (errMsg === 'Failed to fetch') {
               errMsg = 'Network error (Failed to fetch). This can happen if an Ad Blocker is active or your internet connection dropped. Please disable ad blockers and try again.';
             } else if (errMsg.includes('new row violates row-level security policy') || errMsg.includes('AccessDenied')) {
               errMsg = `Supabase Storage RLS Error: You need to add an INSERT policy for the "${targetBucket}" bucket in your Supabase Dashboard to allow uploads.`;
             }
             alert('Error uploading PDF: ' + errMsg);
             setUploadingPdf(false);
             setUploadProgress(0);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
             const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(0);
             setUploadProgress(parseInt(percentage));
          },
          onSuccess: () => {
             const { data } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
             setFormData({ ...formData, pdf_url: data.publicUrl });
             alert('PDF uploaded successfully!');
             setUploadingPdf(false);
             setUploadProgress(0);
          }
        });
        
        upload.findPreviousUploads().then((previousUploads) => {
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }
          upload.start();
        }).catch((err) => {
          console.error("Failed to find previous uploads:", err);
          // Fallback to start fresh
          upload.start();
        });
      }
    } catch (err: any) {
      console.error('Error uploading PDF:', err);
      let errMsg = err.message || 'Unknown error';
      if (errMsg === 'Failed to fetch') {
        errMsg = 'Network error (Failed to fetch). This can happen if an Ad Blocker is active or your internet connection dropped. Please disable ad blockers and try again.';
      } else if (errMsg.includes('new row violates row-level security policy')) {
        errMsg = `Supabase Storage RLS Error: You need to add an INSERT policy for the "${targetBucket}" bucket in your Supabase Dashboard to allow uploads.`;
      }
      alert('Error uploading PDF: ' + errMsg);
      setUploadingPdf(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (!error && data) setBooks(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      await supabase.from('books').update(formData).eq('id', editingBook.id);
    } else {
      await supabase.from('books').insert([formData]);
    }
    setIsModalOpen(false);
    fetchBooks();
  };

  const openNew = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', language: 'English', description: '', cover_url: '', pdf_url: '' });
    setIsModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditingBook(b);
    setFormData({
      title: b.title || '',
      author: b.author || '',
      language: b.language || 'English',
      description: b.description || '',
      cover_url: b.cover_url || '',
      pdf_url: b.pdf_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      await supabase.from('books').delete().eq('id', id);
      fetchBooks();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Books Library Management</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm hover:shadow-md">
          <Plus className="w-5 h-5" /> Add Book
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Cover</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Cover URL</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : books.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No books found.</td></tr>
              ) : books.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={b.title} className="w-12 h-16 object-cover rounded-md border border-gray-200" />
                    ) : (
                      <div className="w-12 h-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center p-1">No Cover</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{b.title}</td>
                  <td className="px-6 py-4 text-gray-600">{b.author}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full 
                      ${b.language === 'English' ? 'bg-blue-100 text-blue-800' : 
                         b.language === 'Bengali' ? 'bg-emerald-100 text-emerald-800' : 
                         'bg-orange-100 text-orange-800'}`}>
                      {b.language}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[150px]" title={b.cover_url || ''}>
                    {b.cover_url || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-indigo-600 transition" title="Edit Book"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-rose-600 transition" title="Delete Book"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{editingBook ? 'Edit Book' : 'Add Book'}</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover URL</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PDF URL</label>
                <div className="flex gap-2 items-start flex-col sm:flex-row">
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} placeholder="https://..." />
                  
                  <div className="relative overflow-hidden w-full sm:w-auto shrink-0">
                    <button type="button" disabled={uploadingPdf} className={`w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-300 transition ${uploadingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploadingPdf ? `Uploading (${uploadProgress}%)` : 'Upload PDF'}
                    </button>
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadingPdf}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Provide a URL or upload a legally obtained PDF file directly to the database.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
