import React, { useState } from "react";
import { 
  MapPin, 
  PhoneCall, 
  MessageSquare, 
  Hospital, 
  Pill, 
  UserCheck, 
  Navigation, 
  Clock, 
  Star, 
  ShieldCheck, 
  Search, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Loader2
} from "lucide-react";
import { Language, NearbyDoctor, NearbyHospital, NearbyMedicineShop } from "../types";
import { User } from "@supabase/supabase-js";
import { saveAppointment, Doctor, fetchDoctors, fetchBookedTimes, bookDoctorAppointment } from "../services/db";

interface NearbyDirectorySectionProps {
  currentLang: Language;
  user: User | null;
}

export const NearbyDirectorySection: React.FC<NearbyDirectorySectionProps> = ({
  currentLang,
  user
}) => {
  const [activeCategory, setActiveCategory] = useState<"doctors" | "hospitals" | "pharmacies">("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmedAppointment, setConfirmedAppointment] = useState<any | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [patientReason, setPatientReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  React.useEffect(() => {
    fetchDoctors().then(data => setDoctorsList(data));
  }, []);

  const generateTimeSlots = (startStr: string, endStr: string) => {
    const slots: string[] = [];
    if (!startStr || !endStr) return slots;
    
    const parseTime = (str: string) => {
      const parts = str.split(':');
      return new Date(2000, 0, 1, parseInt(parts[0]), parseInt(parts[1]), 0);
    };
    
    let current = parseTime(startStr);
    const end = parseTime(endStr);
    
    while (current < end) {
      const hh = current.getHours().toString().padStart(2, '0');
      const mm = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${hh}:${mm}:00`);
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  React.useEffect(() => {
    if (selectedDoctor && bookingDate) {
      const slots = generateTimeSlots(selectedDoctor.available_time_start, selectedDoctor.available_time_end);
      setAvailableSlots(slots);
      
      fetchBookedTimes(selectedDoctor.id, bookingDate).then(booked => {
        setBookedSlots(booked);
      });
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
    }
  }, [selectedDoctor, bookingDate]);

  
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDoctor) return;
    
    setBookingError(null);
    setIsBooking(true);
    try {
      const newAppt = await bookDoctorAppointment(
        user.id,
        selectedDoctor.id,
        bookingDate,
        bookingTime,
        patientReason,
        selectedDoctor.name,
        selectedDoctor.hospital || selectedDoctor.clinic || 'Apna Mitra Partner Clinic',
        user.user_metadata?.full_name || 'Patient'
      );
      setConfirmedAppointment({
        id: newAppt.id,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization || selectedDoctor.speciality,
        date: bookingDate,
        time: bookingTime,
        status: newAppt.status || 'Confirmed'
      });
      setSelectedDoctor(null);
      setBookingDate("");
      setBookingTime("");
      setPatientReason("");
      window.dispatchEvent(new CustomEvent('appointmentBooked'));
    } catch (err: any) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  // Flowchart-aligned Doctors Data

  // Flowchart-aligned Hospitals Data
  const hospitals: NearbyHospital[] = [
    {
      id: "hosp-1",
      name: "1. City Hospital (Main Branch)",
      phone: "011-26593677",
      emergencyPhone: "011-26593999 (24/7 ICU)",
      address: "Sector 14, Ring Road, Near Central Metro",
      distance: "1.2 km away (5 min drive)",
      icuAvailable: true,
      ambulanceAvailable: true,
      type: "Multi-Speciality & Trauma Centre",
    },
    {
      id: "hosp-2",
      name: "2. Sunshine Hospital & Research",
      phone: "011-41556677",
      emergencyPhone: "011-41556699 (24/7 ER)",
      address: "Plot 8, Green Park Extension",
      distance: "2.4 km away (8 min drive)",
      icuAvailable: true,
      ambulanceAvailable: true,
      type: "Cardiac & Geriatric Super-Speciality",
    },
    {
      id: "hosp-3",
      name: "3. Green Valley Emergency Centre",
      phone: "011-29234455",
      emergencyPhone: "011-29234400 (Ambulance Desk)",
      address: "Main Civil Lines Boulevard",
      distance: "3.1 km away (11 min drive)",
      icuAvailable: true,
      ambulanceAvailable: true,
      type: "Government Affiliated Trauma Care",
    },
  ];

  // Flowchart-aligned Medicine Shops Data
  const medicineShops: NearbyMedicineShop[] = [
    {
      id: "shop-1",
      name: "1. Health Shop Pharmacy",
      phone: "+91 98765 00112",
      whatsapp: "919876500112",
      address: "Shop #4, Market Complex Block B",
      distance: "400 meters away (3 min walk)",
      isOpen24x7: true,
      homeDelivery: true,
      discount: "15% Senior Discount on All Rx",
    },
    {
      id: "shop-2",
      name: "2. MedLife 24/7 Chemist",
      phone: "+91 79888 12345",
      whatsapp: "917988812345",
      address: "Opposite Gate 2, City Hospital",
      distance: "1.1 km away",
      isOpen24x7: true,
      homeDelivery: true,
      discount: "Free Express Home Delivery in 30 Mins",
    },
    {
      id: "shop-3",
      name: "3. Care Well Druggists & Surgical",
      phone: "+91 80999 56789",
      whatsapp: "918099956789",
      address: "12 Community Centre, Post Office Road",
      distance: "1.7 km away",
      isOpen24x7: false,
      homeDelivery: true,
      discount: "Ayurvedic + Allopathic Medicines",
    },
  ];

  const filteredDoctors = doctorsList.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = medicineShops.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="nearby-directory" className="py-16 bg-[#F4F7F4] border-t border-[#D8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F4E46]/10 text-[#1F4E46] text-xs font-bold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Flowchart Module 4 • Nearby Healthcare Directory</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#153A34] tracking-tight">
              Nearby Doctors, Hospitals &amp; Medicine Shops
            </h2>
            <p className="text-base text-[#4A5D54] mt-2 max-w-2xl">
              Verified local medical specialists, 24/7 ICU hospitals, and neighborhood pharmacies with one-tap contact details, navigation, and home delivery.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, hospital, chemist..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8E2DA] rounded-2xl text-xs font-medium focus:outline-none focus:border-[#1F4E46] shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl gap-2 border border-[#D8E2DA] mb-8 shadow-2xs overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveCategory("doctors")}
            className={`flex-1 min-w-[160px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeCategory === "doctors"
                ? "bg-[#1F4E46] text-white shadow-xs"
                : "text-[#374940] hover:bg-[#EEF3EA]"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Medicine Specialists ({doctorsList.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("hospitals")}
            className={`flex-1 min-w-[160px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeCategory === "hospitals"
                ? "bg-[#1F4E46] text-white shadow-xs"
                : "text-[#374940] hover:bg-[#EEF3EA]"
            }`}
          >
            <Hospital className="w-4 h-4" />
            <span>2. Nearby Hospitals &amp; ICU ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory("pharmacies")}
            className={`flex-1 min-w-[160px] py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeCategory === "pharmacies"
                ? "bg-[#1F4E46] text-white shadow-xs"
                : "text-[#374940] hover:bg-[#EEF3EA]"
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>3. Medicine Shops 24/7 ({medicineShops.length})</span>
          </button>
        </div>

        {/* TAB 1: DOCTORS */}
        {activeCategory === "doctors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDoctors.map((doc: any) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1F4E46]/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-[#153A34]">{doc.name}</h3>
                        <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{doc.rating || "4.8"}</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#1F4E46] font-bold mt-0.5">{doc.specialization || doc.speciality}</p>
                      <p className="text-[11px] text-[#586C62]">{doc.qualification || doc.degree} • {doc.experience}</p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#1F4E46]/10 text-[#1F4E46] flex items-center justify-center font-bold text-xl shrink-0">
                      👨‍⚕️
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8FAF8] rounded-2xl border border-[#EEF3EA] space-y-1.5 text-xs text-[#2A3D34]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Clinic / Hospital:</span>
                      <strong className="text-[#153A34]">{doc.hospital || 'Clinic'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Available Days:</span>
                      <strong className="text-[#153A34]">
                        {doc.available_days 
                          ? (Array.isArray(doc.available_days) ? doc.available_days.join(', ') : typeof doc.available_days === 'string' ? doc.available_days.replace(/[\[\]"]/g, '') : 'Mon - Sat') 
                          : 'Mon - Sat'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">OPD Timings:</span>
                      <strong className="text-emerald-700">{(doc.available_time_start && doc.available_time_end ? `${doc.available_time_start} - ${doc.available_time_end}` : '10:00 AM - 5:00 PM')}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">Consultation Fee:</span>
                      <strong className="text-[#153A34]">{doc.consultationFee || '₹500'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-[#EEF3EA]">
                  <a
                    href={`tel:${doc.phone}`}
                    className="flex-1 py-2.5 bg-[#1F4E46] hover:bg-[#153A34] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call &amp; Book</span>
                  </a>

                  <button
                    onClick={() => {
                      if (!user) {
                        alert("Please login to book an appointment.");
                        return;
                      }
                      setSelectedDoctor(doc);
                    }}
                    className="px-4 py-2.5 bg-[#EEF3EA] hover:bg-[#DCEAE2] text-[#1F4E46] rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Slot Book</span>
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doc.hospital || 'Clinic')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
                    title="Open in Google Maps"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: HOSPITALS */}
        {activeCategory === "hospitals" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1F4E46]/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-rose-100 text-rose-900 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      <span>24/7 Emergency</span>
                    </span>
                    <span className="text-xs text-stone-500 font-medium">{hosp.distance}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#153A34]">{hosp.name}</h3>
                    <p className="text-xs text-[#1F4E46] font-bold mt-0.5">{hosp.type}</p>
                    <p className="text-xs text-[#586C62] mt-1">{hosp.address}</p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 space-y-1 text-xs text-emerald-950">
                    <div className="flex items-center justify-between">
                      <span>ICU Beds Status:</span>
                      <strong className="text-emerald-700">Available (14 Beds)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Emergency Ambulance:</span>
                      <strong className="text-emerald-700">Ready on Call</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#EEF3EA]">
                  <a
                    href={`tel:${hosp.emergencyPhone}`}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Emergency Hotline: {hosp.emergencyPhone}</span>
                  </a>

                  <div className="flex gap-2">
                    <a
                      href={`tel:${hosp.phone}`}
                      className="flex-1 py-2 bg-[#F0F4F1] hover:bg-[#E2ECE5] text-[#1F4E46] rounded-xl text-xs font-bold text-center transition"
                    >
                      General Desk
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + " " + hosp.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>GPS Route</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: MEDICINE SHOPS */}
        {activeCategory === "pharmacies" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-3xl p-6 border border-[#D8E2DA] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1F4E46]/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full">
                      {shop.isOpen24x7 ? "24/7 Open Chemist" : "Open 8:00 AM - 11:00 PM"}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">{shop.distance}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#153A34]">{shop.name}</h3>
                    <p className="text-xs text-[#586C62] mt-1">{shop.address}</p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 font-medium">
                    🏷️ <strong>Special Offer:</strong> {shop.discount}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#EEF3EA]">
                  <a
                    href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent("Hello! I would like to order medicines from Apna Mitra Senior Companion.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Order / Send Prescription</span>
                  </a>

                  <a
                    href={`tel:${shop.phone}`}
                    className="w-full py-2 bg-[#F0F4F1] hover:bg-[#E2ECE5] text-[#1F4E46] rounded-xl text-xs font-bold text-center block transition"
                  >
                    Call Chemist: {shop.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Form Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#D8E2DA] space-y-4 animate-in zoom-in">
              <div className="flex justify-between items-center border-b border-[#EEF3EA] pb-3 mb-4">
                <h3 className="font-serif text-lg font-bold text-[#153A34]">Book Appointment</h3>
                <button onClick={() => setSelectedDoctor(null)} className="text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-[#F8FAF8] p-3 rounded-2xl border border-[#EEF3EA] mb-4">
                <p className="text-sm font-bold text-[#153A34]">{selectedDoctor.name}</p>
                <p className="text-xs text-stone-500">{selectedDoctor.specialization || selectedDoctor.speciality}</p>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Patient Name</label>
                  <input 
                    type="text" 
                    value={user?.user_metadata?.full_name || user?.email || "Patient"} 
                    disabled 
                    className="w-full bg-stone-50 border border-[#D8E2DA] rounded-xl px-3 py-2 text-xs text-stone-600 font-medium"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
<div className="col-span-2 text-rose-600 text-xs font-bold">{bookingError}</div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        const [yyyy, mm, dd] = val.split("-"); const dateObj = new Date(parseInt(yyyy), parseInt(mm)-1, parseInt(dd));
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                        const availDays = selectedDoctor?.available_days || [];
                        const daysArray = Array.isArray(availDays) ? availDays : availDays.split(',').map((d:string)=>d.trim());
                        if (daysArray.length > 0 && !daysArray.includes(dayName)) {
                          setBookingError(`Doctor is only available on: ${daysArray.join(', ')}`);
                          setBookingDate("");
                        } else {
                          setBookingError(null);
                          setBookingDate(val);
                        }
                      }}
                      className="w-full bg-white border border-[#D8E2DA] focus:border-[#1F4E46] focus:ring-1 focus:ring-[#1F4E46] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#2A3D34] mb-1">Time</label>
                    <select 
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-white border border-[#D8E2DA] focus:border-[#1F4E46] focus:ring-1 focus:ring-[#1F4E46] rounded-xl px-3 py-2 text-xs font-medium outline-none"
                    >
                      <option value="">Select time</option>
                      {availableSlots.map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        return (
                          <option key={slot} value={slot} disabled={isBooked}>
                            {slot} {isBooked ? '(Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
</div>

                <div>
                  <label className="block text-xs font-bold text-[#2A3D34] mb-1">Reason for Visit</label>
                  <textarea 
                    rows={2}
                    value={patientReason}
                    onChange={(e) => setPatientReason(e.target.value)}
                    placeholder="Briefly describe the symptoms or reason for visit..."
                    className="w-full bg-white border border-[#D8E2DA] focus:border-[#1F4E46] focus:ring-1 focus:ring-[#1F4E46] rounded-xl px-3 py-2 text-xs font-medium outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="w-full py-2.5 bg-[#1F4E46] hover:bg-[#153A34] disabled:opacity-70 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                    <span>{isBooking ? "Booking..." : "Confirm Booking Request"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

                {/* Booking feedback modal / toast */}
        {confirmedAppointment && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#D8E2DA] space-y-6 animate-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-center text-[#153A34] text-2xl mb-1 tracking-tight">Appointment Confirmed ✓</h4>
                <p className="text-center text-stone-500 font-medium text-sm">Your booking was successful</p>
              </div>
              
              <div className="bg-stone-50 rounded-2xl p-5 space-y-3 border border-stone-100">
                <div className="flex justify-between items-center pb-3 border-b border-stone-200">
                  <span className="text-stone-500 text-xs font-bold uppercase tracking-wider">ID</span>
                  <span className="font-mono text-sm text-[#153A34] font-bold">{confirmedAppointment.id.slice(0,8).toUpperCase()}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-y-3 gap-x-4 text-sm">
                  <div className="text-stone-500 font-medium">Doctor:</div>
                  <div className="text-[#153A34] font-bold text-right">{confirmedAppointment.doctorName}</div>
                  
                  <div className="text-stone-500 font-medium">Specialization:</div>
                  <div className="text-[#153A34] font-bold text-right truncate" title={confirmedAppointment.specialization}>{confirmedAppointment.specialization}</div>
                  
                  <div className="text-stone-500 font-medium">Date:</div>
                  <div className="text-[#153A34] font-bold text-right">{confirmedAppointment.date}</div>
                  
                  <div className="text-stone-500 font-medium">Time:</div>
                  <div className="text-[#153A34] font-bold text-right">{confirmedAppointment.time}</div>
                  
                  <div className="text-stone-500 font-medium">Status:</div>
                  <div className="text-emerald-600 font-bold text-right flex items-center justify-end gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Confirmed
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setConfirmedAppointment(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 bg-[#1F4E46] text-white rounded-xl font-bold text-sm hover:bg-[#153A34] transition shadow-sm"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => {
                    setConfirmedAppointment(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 bg-white text-[#1F4E46] border border-[#1F4E46]/20 rounded-xl font-bold text-sm hover:bg-stone-50 transition"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};