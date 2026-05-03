import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, Save } from 'lucide-react';
import { NGO } from '../types';
import { Language, translations } from '../translations';
import { LocationSelector } from './LocationSelector';

interface NGORegistrationFormProps {
  onClose: () => void;
  onSave: (ngo: Omit<NGO, 'id'>) => void;
  language: Language;
}

export const NGORegistrationForm: React.FC<NGORegistrationFormProps> = ({ onClose, onSave, language }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    province: '',
    district: '',
    city: '',
    address: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.province || !formData.district || !formData.city) {
      alert(language === 'ur' ? 'براہ کرم تمام مقام کے فیلڈز پُر کریں' : 'Please fill all location fields');
      return;
    }
    onSave({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      address: `${formData.address}, ${formData.city}, ${formData.district}, ${formData.province}`,
      phone: formData.phone,
      district: formData.district,
      city: formData.city
    } as any);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-xl leading-none">Register New NGO</h3>
              <p className="urdu text-sm opacity-80">نئی این جی او رجسٹر کریں</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase">NGO Name</label>
              <span className="urdu text-[10px] text-slate-400">این جی او کا نام</span>
            </div>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none font-bold"
              placeholder="Al-Khidmat, Edhi, etc."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase">Official Email</label>
              <span className="urdu text-[10px] text-slate-400">ای میل ایڈریس</span>
            </div>
            <input 
              required
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none font-bold"
              placeholder="ngo@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase">Create Password</label>
              <span className="urdu text-[10px] text-slate-400">پاس ورڈ بنائیں</span>
            </div>
            <input 
              required
              type="password"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none font-bold"
              placeholder="••••••••"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase">Phone Number</label>
              <span className="urdu text-[10px] text-slate-400">فون نمبر</span>
            </div>
            <input 
              required
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none font-bold"
              placeholder="081-..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 px-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Office Location</label>
              <span className="urdu text-[10px] text-slate-400">دفتر کا مقام</span>
            </div>
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase">Office Address</label>
              <span className="urdu text-[10px] text-slate-400">دفتر کا پتہ</span>
            </div>
            <textarea 
              required
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900/20 outline-none resize-none h-24 font-bold"
              placeholder="Full office address..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Register NGO
          </button>
        </form>
      </div>
    </div>
  );
};
