import React, { useState } from 'react';
import { X, Heart, MapPin, Phone, MessageSquare, Save } from 'lucide-react';
import { DonorProfile } from '../types';
import { Language, translations } from '../translations';
import { LocationSelector } from './LocationSelector';
import { isEligible, getRemainingDays } from '../lib/eligibility';

interface DonorRegistrationFormProps {
  onClose: () => void;
  onSave: (donor: Omit<DonorProfile, 'id'>) => void;
  language: Language;
  coolOffDays?: number;
}

export const DonorRegistrationForm: React.FC<DonorRegistrationFormProps> = ({ onClose, onSave, language, coolOffDays = 90 }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: 'A+',
    province: '',
    district: '',
    city: '',
    address: '',
    phone: '',
    whatsapp: '',
    lastDonated: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    if (!formData.province || !formData.district || !formData.city) {
      alert(language === 'ur' ? 'براہ کرم تمام مقام کے فیلڈز پُر کریں' : 'Please fill all location fields');
      return;
    }

    e.preventDefault();
    onSave({
      userId: 'manual-' + Math.random().toString(36).substr(2, 5),
      name: formData.name,
      bloodGroup: formData.bloodGroup as any,
      location: {
        lat: 29.544, // Default to Sibi/Balochistan area for demo
        lng: 67.877,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        district: formData.district
      },
      lastDonated: formData.lastDonated,
      isAvailable: true,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      donationCount: 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-brand-red p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 fill-current" />
            <div>
              <h3 className="font-bold text-xl leading-none">Register New Donor</h3>
              <p className="urdu text-sm opacity-80">نیا ڈونر رجسٹر کریں</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 outline-none"
                placeholder="Ahmed Ali"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Blood Group</label>
              <select 
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 outline-none font-bold"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Last Donated</label>
              <input 
                type="date"
                value={formData.lastDonated}
                onChange={e => setFormData({...formData, lastDonated: e.target.value})}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 outline-none ${
                   !isEligible(formData.lastDonated, coolOffDays) ? 'border-orange-200' : 'border-green-200'
                }`}
              />
              <div className="mt-1 flex items-center gap-1">
                {isEligible(formData.lastDonated, coolOffDays) ? (
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">{t.eligible}</span>
                ) : (
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tight">
                    {language === 'ur' 
                      ? `${getRemainingDays(formData.lastDonated, coolOffDays).replace('Wait ', '').replace(' days', '')} ${t.days} ${t.wait}` 
                      : getRemainingDays(formData.lastDonated, coolOffDays)}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 outline-none"
                placeholder="03001234567"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp</label>
              <input 
                type="tel"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 outline-none"
                placeholder="92300..."
              />
            </div>

            <div className="col-span-2 pt-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Location Details</label>
              <LocationSelector 
                language={language}
                forceRow={true}
                onLocationChange={(loc) => setFormData({
                  ...formData,
                  province: loc.province,
                  district: loc.district,
                  city: loc.city
                })}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Address / Ward</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-red/20 outline-none resize-none h-20"
                placeholder="Civil Hospital Area, Sibi..."
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold hover:bg-brand-red-dark transition-all shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Donor Info
          </button>
        </form>
      </div>
    </div>
  );
};
