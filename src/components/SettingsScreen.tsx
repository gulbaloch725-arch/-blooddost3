import React, { useState, useEffect } from 'react';
import { 
  Shield, Building2, CreditCard, Bell, History, ArrowLeft, 
  Save, Trash2, Check, X, Clock, MapPin, Palette, Settings as SettingsIcon,
  PlusCircle, Calendar, Droplet, Activity, ShieldCheck, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppUser, UserRole, NGO, UserSubscription, SubscriptionTier } from '../types';
import { dataService } from '../services/dataService';
import { Language, translations } from '../translations';

interface SettingsScreenProps {
  user: AppUser;
  language: Language;
  onNavigate: (view: string) => void;
  onLanguageChange: (lang: Language) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  user, 
  language, 
  onNavigate, 
  onLanguageChange,
  showNotification
}) => {
  const t = translations[language];
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [subs, setSubs] = useState<UserSubscription[]>([]);
  const [ngoProfile, setNgoProfile] = useState<NGO | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    refreshData();
  }, [user.ngoId]);

  const refreshData = () => {
    const allNgos = dataService.getNGOs();
    if (user.role === UserRole.SUPER_ADMIN) {
      setNgos(allNgos);
      setSubs(dataService.getSubscriptions());
    } else if (user.ngoId) {
      const foundNgo = allNgos.find(n => n.id === user.ngoId);
      if (foundNgo) {
        setNgoProfile(foundNgo);
      } else {
        // Fallback for new NGOs or missing data
        setNgoProfile({
          id: user.ngoId,
          name: user.name.replace(' Admin', ''),
          phone: '',
          address: '',
        });
      }
    }
  };

  const handleUpdateNgo = (id: string, updates: Partial<NGO>) => {
    dataService.updateNGO(id, updates);
    refreshData();
  };

  const handleDeleteNgo = (id: string, name: string) => {
    dataService.deleteNGO(id);
    refreshData();
    setDeleteConfirmation(null);
    showNotification(`NGO "${name}" deleted successfully`, 'success');
  };

  const handleManualOverride = (userId: string, tier: SubscriptionTier, days: number) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    dataService.updateSubscription(userId, { 
      tier, 
      status: 'Active', 
      expiryDate: expiry.toISOString() 
    });
    refreshData();
  };

  const renderSuperAdmin = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* NGO Management */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
        <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
          <Building2 className="w-6 h-6" />
          <h3 className="font-bold text-lg">{t.ngoManagement}</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {ngos.map(ngo => (
              <div key={ngo.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-400">
                    {ngo.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{ngo.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{ngo.district || 'Unassigned District'}</p>
                  </div>
                </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      {(() => {
                        // Find admin for this NGO to get sub status
                        const ngoAdmin = dataService.getUsers().find(u => u.ngoId === ngo.id && u.role === UserRole.NGO_ADMIN);
                        const sub = ngoAdmin ? subs.find(s => s.userId === ngoAdmin.id) : null;
                        const days = sub ? dataService.getSubscriptionDaysRemaining(sub.expiryDate) : 0;
                        const status = !sub ? 'No plan' : sub.status;
                        
                        return (
                          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                            days > 30 ? 'bg-green-100 text-green-700' :
                             days > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {status} {days > 0 ? `(${days}d)` : ''}
                          </div>
                        );
                      })()}
                    </div>
                    <button 
                      onClick={() => setDeleteConfirmation({ id: ngo.id, name: ngo.name })}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Override & Plans */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
          <div className="bg-brand-red p-6 text-white flex items-center gap-3">
            <CreditCard className="w-6 h-6" />
            <h3 className="font-bold text-lg">{t.planPricing}</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {subs.map(sub => {
                const days = dataService.getSubscriptionDaysRemaining(sub.expiryDate);
                return (
                  <div key={sub.userId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800">NGO User: {sub.userId}</h4>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-red">{sub.tier} Plan</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${days > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {days > 0 ? `${days} ${t.daysRemaining}` : t.expired}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleManualOverride(sub.userId, sub.tier, 30)}
                        className="flex-1 bg-white border border-slate-200 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <Calendar className="w-3 h-3" />
                        +30 Days
                      </button>
                      <button 
                        onClick={() => handleManualOverride(sub.userId, SubscriptionTier.GOLDEN, 365)}
                        className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-black flex items-center justify-center gap-2"
                      >
                        <Shield className="w-3 h-3" />
                        Go Turbo (1 yr)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-slate-400" />
              <h4 className="font-bold text-slate-800">Broadcast Message</h4>
            </div>
            <textarea 
              placeholder="Send alert to all NGOs..."
              id="broadcastInput"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm resize-none h-32 focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red outline-none transition-all"
            />
            <button 
              onClick={() => {
                const val = (document.getElementById('broadcastInput') as HTMLTextAreaElement).value;
                if (val) {
                  showNotification(language === 'ur' ? 'تمام این جی اوز کو الرٹ بھیج دیا گیا ہے' : 'Alert sent to all NGOs successfully!', 'success');
                  (document.getElementById('broadcastInput') as HTMLTextAreaElement).value = '';
                }
              }}
              className="w-full mt-3 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
            >
              Send Alert
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-slate-400" />
              <h4 className="font-bold text-slate-800">{t.logs}</h4>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-[10px] text-slate-500 flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span>NGO Support added donor #d321</span>
                  <span className="font-mono">2 mins ago</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-none mb-1">System Identity</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Global App Logo</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-inner flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200">
                  {dataService.getSystemLogo() ? (
                    <img 
                      src={dataService.getSystemLogo()!} 
                      className="w-full h-full object-contain" 
                      alt="System Logo" 
                    />
                  ) : (
                    <Droplet className="w-10 h-10 text-slate-200" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="font-black text-slate-800 text-sm">Update Desktop & Mobile Logo</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This logo will replace the default blood droplet icon across the entire system for all users.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      id="global-logo-upload"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            showNotification('File is too large (max 2MB)', 'error');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            await dataService.setSystemLogo(reader.result as string);
                            showNotification('System logo updated successfully!', 'success');
                            window.location.reload();
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label 
                      htmlFor="global-logo-upload"
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-black transition-all shadow-lg text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      Select Image
                    </label>
                    {dataService.getSystemLogo() && (
                      <button 
                        onClick={async () => {
                          if (confirm('Erase system logo and revert to default?')) {
                            await dataService.setSystemLogo(null);
                            window.location.reload();
                          }
                        }}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all text-sm"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const isHospital = user.role === UserRole.HOSPITAL;
  const entityTitle = isHospital ? 'Hospital Details' : 'NGO Details';
  const workplaceTitle = isHospital ? 'Hospital Workspace Settings' : 'NGO Workspace Settings';

  const renderNgoAdmin = () => {
    if (!ngoProfile) return null;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Controls - Top Left */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border-4 border-brand-red p-8 shadow-2xl relative overflow-hidden">
               {/* Branding Section First */}
              <div className="absolute top-0 right-0 p-4">
                <Palette className="w-12 h-12 text-brand-red/10" />
              </div>
              <h4 className={`text-xl font-black flex items-center gap-3 mb-6 ${language === 'ur' ? 'urdu' : ''}`}>
                <Activity className="w-6 h-6 text-brand-red" />
                {t.brandingAndIdentity}
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                {/* Logo Upload */}
                <div className="space-y-3 p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-red/30 transition-all">
                  <label className={`block text-xs font-black text-slate-700 uppercase tracking-widest ${language === 'ur' ? 'urdu' : ''}`}>
                    {t.updateLogo}
                  </label>
                  <p className="text-[10px] text-slate-400 mb-4">Logo for reports</p>
                  <div className="relative group flex justify-center">
                    <div className="w-32 h-32 bg-slate-50 shadow-inner rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:bg-white">
                      {ngoProfile.logo ? (
                        <img src={ngoProfile.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-4">
                          <PlusCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Logo</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleUpdateNgo(ngoProfile.id, { logo: reader.result as string });
                            showNotification('Logo updated!', 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Stamp Upload */}
                <div className="space-y-3 p-4 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400/30 transition-all">
                  <label className={`block text-xs font-black text-blue-900 uppercase tracking-widest ${language === 'ur' ? 'urdu' : ''}`}>
                    {t.updateStamp}
                  </label>
                  <p className="text-[10px] text-blue-400 mb-4">Digital Stamp</p>
                  <div className="relative group flex justify-center">
                    <div className="w-32 h-32 bg-white shadow-sm rounded-2xl flex items-center justify-center overflow-hidden transition-all group-hover:shadow-md">
                      {ngoProfile.stamp ? (
                        <img src={ngoProfile.stamp} alt="Stamp" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="text-center p-4">
                          <Droplet className="w-10 h-10 text-blue-200 mx-auto mb-2" />
                          <span className="text-[10px] text-blue-400 font-bold uppercase">Stamp</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleUpdateNgo(ngoProfile.id, { stamp: reader.result as string });
                            showNotification('Stamp updated!', 'success');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 italic text-[10px] text-orange-700">
                {t.stampGuidance}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl p-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-brand-red" />
                {entityTitle}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{isHospital ? 'Hospital Name' : 'NGO Name'}</label>
                  <input 
                    type="text"
                    value={ngoProfile.name}
                    onChange={e => handleUpdateNgo(ngoProfile.id, { name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-red/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                    <input 
                      type="tel"
                      value={ngoProfile.phone}
                      onChange={e => handleUpdateNgo(ngoProfile.id, { phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.district}</label>
                    <input 
                      type="text"
                      value={ngoProfile.district || ''}
                      onChange={e => handleUpdateNgo(ngoProfile.id, { district: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t.coolOff} (Days)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="30"
                      max="180"
                      step="10"
                      value={ngoProfile.coolOffPeriodDays || 90}
                      onChange={e => handleUpdateNgo(ngoProfile.id, { coolOffPeriodDays: parseInt(e.target.value) })}
                      className="flex-1 accent-brand-red"
                    />
                    <span className="font-black text-brand-red text-xl w-16 text-center">{ngoProfile.coolOffPeriodDays || 90}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
               {/* Right Column Stuff */}
               <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">{t.planStatus}</h4>
                {(() => {
                  const sub = dataService.getSubscriptions().find(s => s.userId === user.id);
                  const days = dataService.getSubscriptionDaysRemaining(sub?.expiryDate);
                  return (
                    <>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-3xl font-black text-brand-red">{days}</span>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{t.daysRemaining}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-6 italic">{t.expiresIn(days)}</p>
                    </>
                  );
                })()}
                <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl text-sm font-bold transition-all">
                  Upgrade Subscription
                </button>
              </div>
              <Droplet className="absolute -right-12 -bottom-12 w-48 h-48 text-white/5 rotate-12 fill-current" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg">
              <h4 className="text-lg font-bold flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-slate-400" />
                Donor Broadcast
              </h4>
              <textarea 
                placeholder="Alert your local donors about urgent needs..."
                id="ngoBroadcastInput"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm resize-none h-32 focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red outline-none transition-all"
              />
              <button 
                onClick={() => {
                  const val = (document.getElementById('ngoBroadcastInput') as HTMLTextAreaElement).value;
                  if (val) {
                    showNotification(language === 'ur' ? 'ڈونرز کو الرٹ بھیج دیا گیا ہے' : 'Alert sent successfully!', 'success');
                    (document.getElementById('ngoBroadcastInput') as HTMLTextAreaElement).value = '';
                  }
                }}
                className="w-full mt-3 bg-brand-red text-white py-3 rounded-xl font-bold hover:bg-brand-red-dark transition-all shadow-md"
              >
                Send SMS Alert
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                   <span className="text-sm font-bold text-slate-900">App Language</span>
                   <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
                      <button 
                        onClick={() => onLanguageChange('en')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                      >
                        EN
                      </button>
                      <button 
                        onClick={() => onLanguageChange('ur')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all urdu ${language === 'ur' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                      >
                        اردو
                      </button>
                   </div>
                </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-8 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center transition-all group"
            >
              <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.settings}</h2>
              <p className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                {user.role === UserRole.SUPER_ADMIN ? (
                  <><Shield className="w-3 h-3" /> Global Control Room</>
                ) : (
                  <><SettingsIcon className="w-3 h-3" /> {workplaceTitle}</>
                )}
              </p>
            </div>
          </div>
          <button 
             onClick={() => onNavigate('dashboard')}
             className="bg-brand-red text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-brand-red/20 hover:bg-brand-red-dark transition-all flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Done
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6">
        {user.role === UserRole.SUPER_ADMIN ? renderSuperAdmin() : (user.role === UserRole.NGO_ADMIN || user.role === UserRole.HOSPITAL) ? renderNgoAdmin() : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-200">
            <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Private Settings</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Only NGO and Hospital admins can access workspace brand settings.</p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Confirm Deletion</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Are you sure you want to delete <span className="font-bold text-slate-700">{deleteConfirmation.name}</span>? 
                  This will remove all associated data permanently.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDeleteConfirmation(null)}
                  className="py-4 rounded-2xl font-black text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteNgo(deleteConfirmation.id, deleteConfirmation.name)}
                  className="py-4 rounded-2xl font-black text-sm bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all font-inter"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
