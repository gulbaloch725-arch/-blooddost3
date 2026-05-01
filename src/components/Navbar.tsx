import React, { useState } from 'react';
import { 
  Droplet, LogOut, User, LayoutDashboard, Heart, CreditCard, 
  Package, Shield, Settings as SettingsIcon, Menu, X, 
  ShieldCheck, Info, Lock, Clock, Users, Scale
} from 'lucide-react';
import { AppUser, UserRole, UserSubscription } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';
import { dataService } from '../services/dataService';

interface NavbarProps {
  user: AppUser | null;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'profile' | 'requests' | 'subscription' | 'inventory' | 'admin_panel' | 'thalassemia' | 'settings' | 'standards' | 'donors') => void;
  currentView: string;
  onShowAbout?: () => void;
  onShowAppInfo?: () => void;
  onShowCompatibility?: () => void;
  onShowPrivacyPolicy?: () => void;
  onShowContact?: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  subscription?: UserSubscription | null;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onNavigate, 
  currentView, 
  onShowAbout, 
  onShowAppInfo,
  onShowCompatibility,
  onShowPrivacyPolicy,
  onShowContact,
  language,
  onLanguageChange,
  subscription
}) => {
  const t = translations[language];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'donors', label: t.donors, icon: Heart },
    { id: 'requests', label: t.history, icon: Clock },
    { id: 'standards', label: t.standards, icon: Scale },
  ];

  if (user?.role !== UserRole.DONOR) {
    menuItems.push({ id: 'thalassemia', label: t.thalassemia, icon: User });
  }

  if (user?.role === UserRole.NGO_ADMIN) {
    menuItems.push({ id: 'inventory', label: t.inventory, icon: Package });
  }

  if (user?.role === UserRole.SUPER_ADMIN) {
    menuItems.push({ id: 'admin_panel', label: t.adminPanel, icon: Shield });
  }

  const handleMenuClick = (id: any) => {
    onNavigate(id);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
              >
                <Menu className="w-6 h-6" />
              </button>
                <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('dashboard')}>
                  <div className="mr-3 group-hover:scale-110 transition-transform relative">
                    <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/20 overflow-hidden relative">
                      {(() => {
                         const systemLogo = dataService.getSystemLogo();
                         if (systemLogo) return <img src={systemLogo} alt="Logo" className="w-full h-full object-contain bg-white" />;
                         
                         const ngoLogo = user?.role === UserRole.NGO_ADMIN ? dataService.getNGOs().find(n => n.id === user.ngoId)?.logo : null;
                         if (ngoLogo) return <img src={ngoLogo} alt="Logo" className="w-full h-full object-contain bg-white" />;
                         
                         return <Droplet className="w-6 h-6 text-white fill-current" />;
                      })()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-slate-50">
                      <div className="w-2 h-2 bg-brand-red rounded-full animate-pulse" />
                    </div>
                  </div>
                  <span className="font-black text-xl tracking-tighter text-slate-900">{t.appName}</span>
                </div>
            </div>

            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-sm font-bold text-slate-900">{user.name}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">{user.role}</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(true)}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden hover:ring-2 hover:ring-brand-red/20 transition-all flex items-center justify-center p-1"
                >
                  {(() => {
                    const ngoLogo = user?.role === UserRole.NGO_ADMIN || user?.role === UserRole.HOSPITAL 
                      ? dataService.getNGOs().find(n => n.id === user.ngoId)?.logo 
                      : null;
                    if (ngoLogo) return <img src={ngoLogo} alt="Logo" className="w-full h-full object-contain" />;
                    return <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="avatar" className="w-full h-full object-cover" />;
                  })()}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Enhanced Sidebar Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/20">
                    <Droplet className="w-6 h-6 text-white fill-current" />
                  </div>
                  <span className="font-black text-xl tracking-tighter">{t.appName}</span>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {/* User Section */}
                <div className="px-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shadow-sm">
                      {(() => {
                        const ngoLogo = user?.role === UserRole.NGO_ADMIN || user?.role === UserRole.HOSPITAL 
                          ? dataService.getNGOs().find(n => n.id === user.ngoId)?.logo 
                          : null;
                        if (ngoLogo) return <img src={ngoLogo} alt="Logo" className="w-full h-full object-contain" />;
                        return <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="avatar" className="w-full h-full object-cover" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{user?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
                    </div>
                  </div>

                  {/* Plan Status Widget for NGOs */}
                  {user?.role === UserRole.NGO_ADMIN && subscription && (
                    <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-xl mb-4 group">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-4 h-4 text-brand-red" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.planDetails}</span>
                        </div>
                        <h5 className="font-black text-xl mb-1 text-brand-red uppercase">{subscription.tier} Plan</h5>
                        {subscription.expiryDate && (
                          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span className="font-bold">{t.expiresIn(dataService.getSubscriptionDaysRemaining(subscription.expiryDate))}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                        <Droplet className="w-full h-full text-white fill-current" />
                      </div>
                    </div>
                  )}

                  {/* Language Toggle */}
                  <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
                    <button 
                      onClick={() => onLanguageChange('en')}
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                    >
                      ENGLISH
                    </button>
                    <button 
                      onClick={() => onLanguageChange('ur')}
                      className={`flex-1 py-2 text-xs font-black rounded-lg transition-all urdu ${language === 'ur' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400'}`}
                    >
                      اردو
                    </button>
                  </div>
                </div>

                {/* Primary Apps */}
                <div className="space-y-1">
                  <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t.dashboard}</span>
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                        currentView === item.id ? 'bg-brand-red-light text-brand-red' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Account & Settings */}
                <div className="space-y-1 border-t border-slate-50 pt-6">
                  <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{t.settings}</span>
                  <button
                    onClick={() => handleMenuClick('settings')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                      currentView === 'settings' ? 'bg-brand-red-light text-brand-red' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.settings}</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('profile')}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                      currentView === 'profile' ? 'bg-brand-red-light text-brand-red' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.myProfile}</span>
                  </button>
                </div>

                {/* Info & Legal */}
                <div className="space-y-1 border-t border-slate-50 pt-6">
                  <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Information</span>
                  {onShowAbout && (
                    <button onClick={() => { onShowAbout(); setIsDrawerOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all">
                      <ShieldCheck className="w-5 h-5 text-slate-400" />
                      <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.aboutUs}</span>
                    </button>
                  )}
                  {onShowAppInfo && (
                    <button onClick={() => { onShowAppInfo(); setIsDrawerOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all">
                      <Info className="w-5 h-5 text-slate-400" />
                      <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.aboutApp}</span>
                    </button>
                  )}
                  {onShowCompatibility && (
                    <button onClick={() => { onShowCompatibility(); setIsDrawerOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all">
                      <Droplet className="w-5 h-5 text-brand-red" />
                      <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.compatibilityChart}</span>
                    </button>
                  )}
                  <button onClick={() => { onShowPrivacyPolicy?.(); setIsDrawerOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.privacyPolicy}</span>
                  </button>
                  {onShowContact && (
                    <button onClick={() => { onShowContact(); setIsDrawerOpen(false); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all">
                      <Users className="w-5 h-5 text-slate-400" />
                      <span className={`font-bold ${language === 'ur' ? 'urdu text-lg' : 'text-sm'}`}>{t.contactUs}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-3 bg-red-50 text-brand-red py-4 rounded-2xl font-black shadow-lg shadow-brand-red/5 hover:bg-brand-red hover:text-white transition-all active:scale-[0.98]"
                >
                  <LogOut className="w-5 h-5" />
                  <span className={language === 'ur' ? 'urdu text-lg' : ''}>{t.logout}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
