import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, MapPin, Building2, User, Phone, Share2, Download } from 'lucide-react';
import { Language, translations } from '../translations';
import { dataService } from '../services/dataService';
import { DonorProfile } from '../types';
import { generateCertificate, shareOnWhatsApp, shareOnFacebook } from '../lib/certificate';

interface DonationRecordModalProps {
  donor: DonorProfile;
  onClose: () => void;
  language: Language;
}

export const DonationRecordModal: React.FC<DonationRecordModalProps> = ({ donor, onClose, language }) => {
  const t = translations[language];
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    hospitalName: '',
    city: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadCertificate = async () => {
    setIsGenerating(true);
    const user = dataService.getCurrentUser();
    const ngo = dataService.getNGOs().find(n => n.id === user?.ngoId);
    if (ngo) {
      try {
        await generateCertificate(
          donor.name,
          new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          ngo.name,
          donor.bloodGroup,
          { 
            logo: ngo.logo, 
            stamp: ngo.stamp,
            systemLogo: dataService.getSystemLogo()
          }
        );
      } catch (e) {
        console.error('Manual cert generation failed:', e);
        alert('Certificate failed to generate. Please ensure your NGO profile has a valid logo and stamp.');
      }
    } else {
      alert('NGO data not found. Please log in again.');
    }
    setIsGenerating(false);
  };

  const [suggestions, setSuggestions] = useState(dataService.getSuggestions());
  
  const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (activeSuggestionField === 'hospitalName') {
      const filtered = suggestions.hospitals.filter(h => 
        h.toLowerCase().includes(formData.hospitalName.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else if (activeSuggestionField === 'city') {
      const filtered = suggestions.cities.filter(c => 
        c.toLowerCase().includes(formData.city.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [formData, activeSuggestionField, suggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = dataService.getCurrentUser();
    if (!user || !user.ngoId) return;

    const ngo = dataService.getNGOs().find(n => n.id === user.ngoId);

    dataService.recordDonation({
      donorId: donor.id,
      ngoId: user.ngoId,
      ...formData
    });

    // Automatic Certificate Generation
    try {
      if (ngo) {
        await generateCertificate(
          donor.name,
          new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
          ngo.name,
          donor.bloodGroup,
          {
            logo: ngo.logo,
            stamp: ngo.stamp,
            systemLogo: dataService.getSystemLogo()
          }
        );
      }
    } catch (certError) {
      console.error('Certificate generation failed:', certError);
      alert('Certificate generation failed. However, the donation record has been saved.');
    }

    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 3000); // 3 seconds to let user see success state while PDF downloads
  };

  const handleSuggestionClick = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setActiveSuggestionField(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-black text-slate-900 leading-tight ${language === 'ur' ? 'urdu' : ''}`}>
                    {t.recordDonation}
                  </h2>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                    {t.enterRecipientDetails}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-red font-black text-xl">
                  {donor.bloodGroup}
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{donor.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.eligibleToDonate}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute left-4 top-4.5 text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text"
                      placeholder={`${t.recipientName} ${t.optional}`}
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all ${language === 'ur' ? 'urdu text-right' : ''}`}
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-4.5 text-slate-300">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input 
                      type="tel"
                      placeholder={`${t.recipientPhone} ${t.optional}`}
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all ${language === 'ur' ? 'urdu text-right' : ''}`}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-4.5 text-slate-300">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    placeholder={`${t.hospitalName} ${t.optional}`}
                    value={formData.hospitalName}
                    onFocus={() => setActiveSuggestionField('hospitalName')}
                    onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all ${language === 'ur' ? 'urdu text-right' : ''}`}
                  />
                  <AnimatePresence>
                    {activeSuggestionField === 'hospitalName' && filteredSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 max-h-48 overflow-y-auto overflow-x-hidden"
                      >
                        {filteredSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSuggestionClick('hospitalName', s)}
                            className="w-full text-left px-6 py-2.5 hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-4.5 text-slate-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    placeholder={`${t.city} ${t.optional}`}
                    value={formData.city}
                    onFocus={() => setActiveSuggestionField('city')}
                    onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:bg-white focus:border-brand-red outline-none transition-all ${language === 'ur' ? 'urdu text-right' : ''}`}
                  />
                  <AnimatePresence>
                    {activeSuggestionField === 'city' && filteredSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 max-h-48 overflow-y-auto overflow-x-hidden"
                      >
                        {filteredSuggestions.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSuggestionClick('city', s)}
                            className="w-full text-left px-6 py-2.5 hover:bg-slate-50 text-sm font-bold text-slate-600 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-black shadow-xl shadow-slate-900/10 hover:bg-black transition-all active:scale-[0.98] mt-8"
                >
                  <span className={language === 'ur' ? 'urdu text-lg' : ''}>{t.saveRecord}</span>
                  <ChevronRight className={`w-5 h-5 ${language === 'ur' ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className={`text-2xl font-black text-slate-900 mb-2 ${language === 'ur' ? 'urdu' : ''}`}>
                {t.recordSuccess}
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">
                Donor database has been updated
              </p>

              <div className="w-full space-y-3">
                <button 
                  onClick={handleDownloadCertificate}
                  disabled={isGenerating}
                  className={`w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black transition-all active:scale-95 mb-4 ${isGenerating ? 'opacity-70 cursor-wait' : 'hover:bg-black'}`}
                >
                  <Download className={`w-5 h-5 ${isGenerating ? 'animate-bounce' : ''}`} />
                  {isGenerating ? 'Generating Certificate...' : 'Download Certificate PDF'}
                </button>

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Share Appreciation</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => shareOnWhatsApp(donor.name)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => shareOnFacebook(donor.name)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] text-white py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    Facebook
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
