import React from 'react';
import { Phone, MessageSquare, MapPin, Calendar, CheckCircle2, XCircle, Clock, Info, ShieldAlert, Timer, Droplet, Building2 } from 'lucide-react';
import { DonorProfile, BloodRequest, UserRole, NGO } from '../types';
import { motion } from 'motion/react';
import { getRemainingDays, isEligible, isNearlyEligible } from '../lib/eligibility';
import { Language, translations } from '../translations';

const getWhatsAppUrl = (phone: string, message?: string) => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  
  let url = `https://wa.me/${cleaned}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  return url;
};

interface DonorCardProps {
  donor: DonorProfile;
  language: Language;
  onRecordDonation?: (donorId: string) => void;
  viewerRole?: UserRole;
  coolOffDays?: number;
  ngoName?: string;
  ngoPhone?: string;
}

export const DonorCard: React.FC<DonorCardProps> = ({ 
  donor, 
  language, 
  onRecordDonation, 
  viewerRole,
  coolOffDays = 90,
  ngoName,
  ngoPhone
}) => {
  const t = translations[language];
  const eligible = isEligible(donor.lastDonated, coolOffDays);
  const nearlyEligible = isNearlyEligible(donor.lastDonated, coolOffDays);
  
  const remainingTextEn = getRemainingDays(donor.lastDonated, coolOffDays);
  // Simple logic for translated remaining text
  const remainingText = language === 'ur' && !eligible 
    ? `${remainingTextEn.replace('Wait ', '').replace(' days', '')} ${t.days} ${t.wait}`
    : eligible ? t.eligible : remainingTextEn;

  const [showConfirm, setShowConfirm] = React.useState<'call' | 'whatsapp' | null>(null);

  const handleCall = () => {
    window.location.href = `tel:${donor.phone}`;
    setShowConfirm(null);
  };

  const handleWhatsAppDirect = () => {
    const message = eligible 
      ? (t as any).whatsappInviteMsg(donor.name, ngoName || t.appName, ngoPhone || '')
      : (t as any).whatsappReminderMsg(donor.name, ngoName || t.appName, ngoPhone || '');
    
    const url = getWhatsAppUrl(donor.whatsapp || donor.phone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-12 h-12 flex items-center justify-center -mr-4 -mt-4 rotate-12 transition-transform group-hover:rotate-0`}>
        <div className={`w-full h-full ${eligible ? 'bg-green-500' : nearlyEligible ? 'bg-blue-500' : 'bg-orange-500'} opacity-10 absolute`} />
        {eligible ? (
          <CheckCircle2 className="w-5 h-5 text-green-500 mr-4 mt-4" />
        ) : nearlyEligible ? (
          <Clock className="w-5 h-5 text-blue-500 mr-4 mt-4" />
        ) : (
          <Timer className="w-5 h-5 text-orange-500 mr-4 mt-4" />
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-red-light flex items-center justify-center text-brand-red font-bold text-lg border-2 border-white shadow-sm shrink-0">
          {donor.bloodGroup}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{donor.name}</h3>
          <div className="flex items-center text-slate-500 text-xs mt-1">
            <MapPin className="w-3 h-3 mr-1 shrink-0" />
            <span className="truncate">{donor.location.city}, {donor.location.province}</span>
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <div className={`flex items-center text-[10px] uppercase font-bold tracking-wider ${eligible ? 'text-green-600' : nearlyEligible ? 'text-blue-600' : 'text-orange-500'} ${language === 'ur' ? 'urdu' : ''}`}>
              {nearlyEligible ? (
                <Clock className="w-3 h-3 mr-1 shrink-0" />
              ) : (
                <Calendar className="w-3 h-3 mr-1 shrink-0" />
              )}
              {remainingText}
            </div>
            <div className={`text-[10px] text-slate-400 font-medium ${language === 'ur' ? 'urdu' : ''}`}>
              {t.lastDonated}: {new Date(donor.lastDonated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowConfirm('call')}
          className="flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-green-50 text-slate-700 hover:text-green-700 rounded-xl text-xs font-bold border border-slate-100 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className={language === 'ur' ? 'urdu' : ''}>{t.call}</span>
        </button>
        <button
          onClick={handleWhatsAppDirect}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-colors ${nearlyEligible ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-100'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className={language === 'ur' ? 'urdu' : ''}>
            {nearlyEligible 
              ? (language === 'ur' ? 'یاددہانی (Reminder)' : 'Remind') 
              : t.whatsapp}
          </span>
        </button>
      </div>

      {eligible && viewerRole === UserRole.NGO_ADMIN && (
        <button 
          onClick={() => onRecordDonation?.(donor.id)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-brand-red text-white rounded-xl text-xs font-black shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
        >
          <Droplet className="w-4 h-4 fill-current" />
          {t.recordDonation}
        </button>
      )}

      {showConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="w-8 h-8 text-brand-red mb-2" />
          <h4 className={`font-bold text-slate-900 text-sm ${language === 'ur' ? 'urdu' : ''}`}>{t.initiateComm}</h4>
          <p className={`text-[10px] text-slate-500 mb-4 tracking-tight ${language === 'ur' ? 'urdu' : ''}`}>
            {t.confirmCommPrompt(showConfirm === 'call' ? 'call' : 'whatsapp')}
          </p>
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => setShowConfirm(null)}
              className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              <span className={language === 'ur' ? 'urdu' : ''}>{t.cancel}</span>
            </button>
            <button 
              onClick={handleCall}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg bg-slate-900`}
            >
              <span className={language === 'ur' ? 'urdu' : ''}>{t.confirm}</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

interface NGOCardProps {
  ngo: NGO;
  language: Language;
}

export const NGOCard: React.FC<NGOCardProps> = ({ ngo, language }) => {
  const t = translations[language];
  
  const handleCall = () => {
    window.location.href = `tel:${ngo.phone}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center p-2 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
          {ngo.logo ? (
            <img src={ngo.logo} alt={ngo.name} className="w-full h-full object-contain" />
          ) : (
            <Building2 className="w-8 h-8 text-slate-300" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-900 text-lg leading-tight mb-2 group-hover:text-brand-red transition-colors truncate">
            {ngo.name}
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-start text-slate-500 text-xs">
              <MapPin className="w-3.5 h-3.5 mr-2 shrink-0 text-brand-red mt-0.5" />
              <span className="leading-relaxed">{ngo.address}</span>
            </div>
            <div className="flex items-center text-slate-500 text-xs">
              <Phone className="w-3.5 h-3.5 mr-2 shrink-0 text-brand-red" />
              <span>{ngo.phone}</span>
            </div>
            {ngo.district && (
              <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider ml-5">
                {ngo.district}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 relative z-10">
        <button
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-brand-red transition-all shadow-lg active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span className={language === 'ur' ? 'urdu' : ''}>{t.call}</span>
        </button>
        <button
          onClick={() => window.open(getWhatsAppUrl(ngo.phone), '_blank', 'noopener,noreferrer')}
          className="w-12 h-12 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all border border-green-200 shadow-sm active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

interface RequestCardProps {
  request: BloodRequest;
  language: Language;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, language }) => {
  const urgencyColors = {
    Low: 'bg-blue-100 text-blue-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-orange-100 text-orange-700',
    Emergency: 'bg-red-100 text-red-700 animate-pulse',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl border-l-4 border-l-brand-red border border-slate-200 p-4 shadow-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-red flex items-center justify-center text-white font-black">
            {request.bloodGroup}
          </div>
          <div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${urgencyColors[request.urgency]}`}>
              {request.urgency}
            </span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{language === 'ur' ? 'منجانب:' : 'Posted by:'}</p>
            <h4 className="text-sm font-bold text-slate-900">{request.ngoName}</h4>
          </div>
        </div>
        <div className="flex items-center text-slate-400 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(request.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-slate-600 text-sm">
          <MapPin className="w-4 h-4 mr-2 text-slate-400" />
          {request.location}
        </div>
        <div className="flex items-start text-slate-600 text-sm">
          <Info className="w-4 h-4 mr-2 text-slate-400 mt-0.5 shrink-0" />
          <p className="line-clamp-2 italic text-slate-500">{request.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {request.units} Units Required
        </span>
        <button className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          I Can Donate
        </button>
      </div>
    </motion.div>
  );
};
