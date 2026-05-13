import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, MapPin, Calendar, Heart, Hospital, Activity, ChevronRight, Droplet, UserCheck } from 'lucide-react';
import { translations, Language } from '../translations';
import { ThalassemiaPatient, AppUser, UserRole } from '../types';
import { dataService } from '../services/dataService';

interface ThalassemiaFormProps {
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
  user: AppUser;
}

export default function ThalassemiaForm({ onClose, onSuccess, language, user }: ThalassemiaFormProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    age: '',
    gender: 'Male' as const,
    bloodGroup: 'A+',
    lastTransfusion: new Date().toISOString().split('T')[0],
    cycleDays: '15',
    address: '',
    contactNumber: '',
    hospital: '',
    doctor: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateNextDate = () => {
    if (!formData.lastTransfusion || !formData.cycleDays) return t.nextBloodDay;
    const date = new Date(formData.lastTransfusion);
    date.setDate(date.getDate() + parseInt(formData.cycleDays));
    return date.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (user.role !== UserRole.NGO_ADMIN || !user.ngoId) {
        throw new Error("Only NGOs can register patients");
      }

      await dataService.addPatient({
        name: formData.name,
        fatherName: formData.fatherName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        lastTransfusion: formData.lastTransfusion,
        cycleDays: parseInt(formData.cycleDays),
        address: formData.address,
        contactNumber: formData.contactNumber,
        hospital: formData.hospital,
        doctor: formData.doctor,
        ngoId: user.ngoId
      });

      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error adding patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-brand-red" />
            </div>
            <div>
              <h2 className={`text-xl font-black text-slate-900 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.addPatient}
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.thalassemia}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Name */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.patientName}
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <User className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Father's Name */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.fatherName}
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <UserCheck className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.age}
              </label>
              <input
                required
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.gender}
              </label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g as any })}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs font-black transition-all ${
                      formData.gender === g 
                        ? 'bg-brand-red text-white' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t[g.toLowerCase() as keyof typeof t] as string}
                  </button>
                ))}
              </div>
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.bloodGroup}
              </label>
              <div className="relative group">
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none appearance-none cursor-pointer pl-11"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <Droplet className="absolute left-4 top-4 w-4 h-4 text-brand-red" />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.recipientPhone}
              </label>
              <div className="relative group">
                <input
                  required
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <Phone className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Last Transfusion Date */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.lastDonated}
              </label>
              <div className="relative group">
                <input
                  required
                  type="date"
                  value={formData.lastTransfusion}
                  onChange={(e) => setFormData({ ...formData, lastTransfusion: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <Calendar className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Cycle Days */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                  {t.bloodCirculationDays}
                </label>
                <span className="text-xs font-bold text-brand-red">{formData.cycleDays} {t.days}</span>
              </div>
              <input
                required
                type="range"
                min="5"
                max="60"
                value={formData.cycleDays}
                onChange={(e) => setFormData({ ...formData, cycleDays: e.target.value })}
                className="w-full accent-brand-red"
              />
            </div>

            {/* Next Blood Day (Auto) */}
            <div className="space-y-2 md:col-span-2">
              <div className="bg-brand-red/5 border-2 border-brand-red/10 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-brand-red animate-pulse" />
                  <span className={`text-sm font-black text-brand-red ${language === 'ur' ? 'urdu' : ''}`}>
                    {t.nextBloodDay}
                  </span>
                </div>
                <span className={`text-sm font-bold text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                  {calculateNextDate()}
                </span>
              </div>
            </div>

            {/* Hospital */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.hospital}
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <Hospital className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Doctor */}
            <div className="space-y-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.doctorName}
              </label>
              <div className="relative group">
                <input
                  required
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <UserCheck className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className={`text-sm font-black text-slate-700 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.recipientAddress}
              </label>
              <div className="relative group">
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-brand-red transition-all outline-none pl-11"
                />
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              disabled={isSubmitting}
              className={`w-full bg-brand-red text-white rounded-2xl px-6 py-4 font-black transition-all shadow-xl shadow-brand-red/20 active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className={language === 'ur' ? 'urdu' : ''}>{t.confirm}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
