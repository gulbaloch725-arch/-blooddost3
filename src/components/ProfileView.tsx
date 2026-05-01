import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Clock, 
  Award,
  Heart,
  Droplet,
  ExternalLink,
  Calendar,
  Building2,
  ChevronRight,
  Share2
} from 'lucide-react';
import { AppUser, DonorProfile, DonationRecord, UserRole } from '../types';
import { BadgeDashboard } from './BadgeDashboard';
import { dataService } from '../services/dataService';

interface ProfileViewProps {
  user: AppUser;
  language: 'en' | 'ur';
  t: any;
  onLogout: () => void;
  onNavigate: (view: any) => void;
  onShowNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  language, 
  t, 
  onLogout, 
  onNavigate,
  onShowNotification
}) => {
  const donorProfile = dataService.getDonorByUserId(user.id);
  const donations = dataService.getDonationsByDonor(user.id);
  const ngos = dataService.getNGOs();

  const getNGOName = (ngoId: string) => {
    return ngos.find(n => n.id === ngoId)?.name || 'Blood Dost NGO';
  };

  const stats = [
    { label: t.donationCount || 'Donations', value: donorProfile?.donationCount || 0, icon: Heart, color: 'text-brand-red' },
    { label: language === 'ur' ? 'آخری عطیہ' : 'Last Donation', value: donorProfile?.lastDonated ? new Date(donorProfile.lastDonated).toLocaleDateString() : (language === 'ur' ? 'کبھی نہیں' : 'Never'), icon: Calendar, color: 'text-blue-600' },
    { label: language === 'ur' ? 'دستیابی' : 'Availability', value: donorProfile?.isAvailable ? (language === 'ur' ? 'دستیاب' : 'Available') : (language === 'ur' ? 'غیر دستیاب' : 'Busy'), icon: Clock, color: donorProfile?.isAvailable ? 'text-green-600' : 'text-slate-400' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User className="w-32 h-32" />
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="w-28 h-28 rounded-[32px] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden mb-6 flex items-center justify-center p-1 group">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[28px]" />
            ) : (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="avatar" 
                className="w-full h-full object-cover rounded-[28px]" 
              />
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="bg-brand-red/10 text-brand-red text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {user.role}
              </span>
              {donorProfile && (
                <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {donorProfile.bloodGroup}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 w-full gap-4 mt-8 pt-8 border-t border-slate-50">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`w-10 h-10 ${stat.color.replace('text-', 'bg-')}/5 rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">{stat.label}</p>
                <p className="text-sm font-black text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Account Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-lg space-y-4"
      >
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          {language === 'ur' ? 'اکاؤنٹ کی تفصیلات' : 'Account Details'}
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
              <p className="text-sm font-bold text-slate-700">{user.email}</p>
            </div>
          </div>

          {donorProfile && (
            <>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                  <p className="text-sm font-bold text-slate-700">{donorProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-sm font-bold text-slate-700">{donorProfile.location.city}, {donorProfile.location.province}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{donorProfile.location.address}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Badges & Achievements (Donors Only) */}
      {user.role === UserRole.DONOR && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Award className="w-24 h-24" />
          </div>
          <BadgeDashboard 
            donationCount={donations.length} 
            language={language} 
            t={t} 
          />
          
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
            <button 
              onClick={() => {
                const count = donations.length;
                let badgeName = count >= 10 ? t.legendaryDonor : count >= 5 ? t.bloodHero : count >= 1 ? t.lifeSaver : '';
                import('../lib/certificate').then(({ shareProfile }) => 
                  shareProfile(user.name, count, badgeName)
                );
              }}
              className="w-full flex items-center justify-center gap-3 bg-brand-red text-white py-4 rounded-2xl font-black shadow-xl hover:bg-brand-red/90 transition-all group scale-100 hover:scale-[1.02] active:scale-95"
            >
              <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {language === 'ur' ? 'پروفائل شیئر کریں' : 'Share Profile'}
            </button>

            {donations.length > 0 && (
              <>
                <button 
                  onClick={() => {
                    const donorData = dataService.getDonorByUserId(user.id);
                    const donations = dataService.getDonationsByDonor(user.id);
                    if (donorData && donations.length > 0) {
                      const lastDonation = donations[donations.length - 1];
                      const ngo = dataService.getNGOs().find(n => n.id === lastDonation.ngoId);
                      import('../lib/certificate').then(({ generateCertificate }) => {
                        generateCertificate(
                          user.name, 
                          new Date(lastDonation.date).toLocaleDateString(), 
                          ngo?.name || 'Blood Dost',
                          donorData.bloodGroup,
                          { 
                            certificateId: lastDonation.id,
                            logo: ngo?.logo,
                            stamp: ngo?.stamp,
                            systemLogo: dataService.getSystemLogo()
                          }
                        );
                      });
                      onShowNotification('Certificate generated!', 'success');
                    } else {
                      onShowNotification('Donate blood to earn certificates!', 'info');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all group scale-100 hover:scale-[1.02] active:scale-95"
                >
                  <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {t.generateCertificate}
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const count = donations.length;
                      let badgeName = count >= 10 ? t.legendaryDonor : count >= 5 ? t.bloodHero : count >= 1 ? t.lifeSaver : '';
                      import('../lib/certificate').then(({ shareOnWhatsApp }) => shareOnWhatsApp(user.name, count, badgeName));
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-white transition-all text-xs"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => {
                      import('../lib/certificate').then(({ shareOnFacebook }) => shareOnFacebook(user.name));
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all text-xs"
                  >
                    Facebook
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Donation History */}
      {user.role === UserRole.DONOR && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-lg"
        >
          <div className="p-6 pb-2 border-b border-slate-50">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-red" />
              {language === 'ur' ? 'عطیات کی تاریخ' : 'Donation History'}
            </h4>
          </div>

          <div className="divide-y divide-slate-50">
            {donations.length > 0 ? (
              donations.map((record, i) => (
                <div key={record.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-100 group-hover:border-brand-red transition-colors">
                       <p className="text-[10px] font-black leading-tight uppercase">{new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                       <p className="text-sm font-black text-slate-900 leading-tight">{new Date(record.date).getDate()}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 shadow-sm bg-white border border-slate-100 px-2 py-0.5 rounded-full w-fit mb-1">
                        <Building2 className="w-2.5 h-2.5 text-brand-red" />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                          {getNGOName(record.ngoId)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">Donated at {record.hospitalName || 'Blood Center'}</p>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                           <MapPin className="w-3 h-3" /> {record.city || 'Karachi'}
                         </span>
                         <span className="text-[10px] text-brand-red font-black flex items-center gap-1">
                           <Award className="w-3 h-3" /> Badge Earned
                         </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-100">
                  <Droplet className="w-8 h-8 text-slate-200" />
                </div>
                <h5 className="text-slate-900 font-bold mb-1">{language === 'ur' ? 'کوئی ریکارڈ نہیں ملا' : 'No Donations Yet'}</h5>
                <p className="text-slate-400 text-xs">Your life-saving journey starts with your first donation.</p>
              </div>
            )}
          </div>

          {donations.length > 0 && (
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <button 
                onClick={() => onShowNotification('Full report will be sent to your email', 'info')}
                className="text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline"
              >
                {language === 'ur' ? 'مکمل رپورٹ ڈاؤن لوڈ کریں' : 'Download Full Activity Report'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Logout Action */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-3 bg-red-50 text-brand-red py-5 rounded-[24px] font-black text-lg hover:bg-brand-red hover:text-white transition-all border border-brand-red/10 shadow-sm active:scale-[0.98]"
      >
        <LogOut className="w-6 h-6" />
        {t.logout}
      </motion.button>
    </div>
  );
};
