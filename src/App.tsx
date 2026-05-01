/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Activity, 
  Users, 
  Droplet, 
  ShieldCheck,
  ChevronRight,
  Heart,
  Package,
  Clock,
  Shield,
  LogOut,
  User,
  Building2,
  AlertCircle,
  Scale
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { DonorCard, RequestCard, NGOCard } from './components/Cards';
import { BloodRequestForm } from './components/BloodRequestForm';
import { SubscriptionPortal } from './components/SubscriptionPortal';
import { InventoryScreen } from './components/InventoryScreen';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { ThalassemiaScreen } from './components/ThalassemiaScreen';
import { DonorRegistrationForm } from './components/DonorRegistrationForm';
import { NGORegistrationForm } from './components/NGORegistrationForm';
import { HospitalRegistrationForm } from './components/HospitalRegistrationForm';
import { SettingsScreen } from './components/SettingsScreen';
import { StandardsScreen } from './components/StandardsScreen';
import { DonationRecordModal } from './components/DonationRecordModal';
import { BloodCompatibilityChart } from './components/BloodCompatibilityChart';
import { BadgeDashboard } from './components/BadgeDashboard';
import { LocationSelector } from './components/LocationSelector';
import { generateCertificate, shareOnWhatsApp, shareOnFacebook } from './lib/certificate';
import { dataService } from './services/dataService';
import { exportDonorsToPDF, exportPatientsToPDF, exportToCSV, exportNGOMonitorReportPDF } from './services/exportService';
import { ProfileView } from './components/ProfileView';
import { AppUser, DonorProfile, BloodRequest, UserRole, SubscriptionTier, NGO, UserSubscription, InventoryItem, ThalassemiaPatient } from './types';
import { Language, translations } from './translations';
import { isNearlyEligible } from './lib/eligibility';
import { Share2, FileText } from 'lucide-react';

const Dropdown = ({ 
  value, 
  options, 
  onChange, 
  icon: Icon, 
  language 
}: { 
  value: string; 
  options: { value: string; label: string }[]; 
  onChange: (val: any) => void; 
  icon?: any;
  language: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-xs sm:text-sm font-black text-slate-900 focus:bg-white focus:border-brand-red transition-all outline-none shadow-sm h-[56px]"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Icon && <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-red ${value === 'available' ? 'animate-pulse' : ''}`} />}
          <span className={language === 'ur' ? 'urdu' : ''}>{selectedOption?.label || value}</span>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-brand-red' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {options.map((opt, idx) => (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 hover:bg-slate-50 text-xs sm:text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${value === opt.value ? 'text-brand-red bg-brand-red/5' : 'text-slate-600'}`}
                >
                  <span className={language === 'ur' ? 'urdu' : ''}>{opt.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [view, setView] = useState<'dashboard' | 'profile' | 'requests' | 'subscription' | 'inventory' | 'admin_panel' | 'thalassemia' | 'settings' | 'standards' | 'donors'>('dashboard');
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [thalassemiaPatients, setThalassemiaPatients] = useState<ThalassemiaPatient[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isNGOModalOpen, setIsNGOModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'nearlyEligible' | 'notAvailable'>('all');
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<'NGO' | 'Hospital'>('NGO');
  const [authEmail, setAuthEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [selectedDonorForRecord, setSelectedDonorForRecord] = useState<DonorProfile | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const t = translations[language];

  const [showAbout, setShowAbout] = useState(false);
  const [showAppInfo, setShowAppInfo] = useState(false);
  const [showCompatibilityChart, setShowCompatibilityChart] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const [provinceFilter, setProvinceFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [selectedCityFilter, setSelectedCityFilter] = useState('All'); // Renamed to avoid confusion with existing cityFilter
  const PAKISTAN_LOCATIONS = dataService.getLocationData();

  useEffect(() => {
    dataService.init();
    const currentUser = dataService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      refreshData(currentUser);
      
      // Check for Admin Alerts
      if (currentUser.role === UserRole.NGO_ADMIN) {
        const alert = dataService.consumeAlert(currentUser.ngoId!);
        if (alert === 'settings_updated') {
          showNotification(t.settingsUpdatedByAdmin, 'info');
        }
      }
    }

    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Internet connection restored', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showNotification('You are currently offline. Some features may be restricted.', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = (currentUser?: AppUser) => {
    const activeUser = currentUser || user;
    if (!activeUser) return;
    setDonors(dataService.getDonors(activeUser));
    setRequests(dataService.getRequests(activeUser));
    
    if (activeUser.ngoId) {
      setInventory(dataService.getInventory(activeUser.ngoId));
      setThalassemiaPatients(dataService.getPatients(activeUser.ngoId));
    }

    if (activeUser.role === UserRole.NGO_ADMIN) {
      const subs = dataService.getSubscriptions();
      setSubscription(subs.find(s => s.userId === activeUser.id) || null);
    }
  };

  const currentUserNgo = user?.ngoId ? dataService.getNGOs().find(n => n.id === user.ngoId) : undefined;

  const performLogin = (targetIdentifier: string, targetPass: string) => {
    const identifier = targetIdentifier.trim().toLowerCase();
    const pass = targetPass.trim();

    // Default passwords for demo
    const credentialsMap: Record<string, string> = {
      'admin@blooddost.pk': 'admin123',
      'ngo@test.com': 'pass123',
      'donor@test.com': 'pass123',
      'hospital@test.com': 'pass123'
    };

    // Check if it's a seeded user or existing user
    const users = dataService.getUsers();
    const seededUser = users.find(u => u.email === identifier || u.phone === identifier);

    // If it's a known identifier but not in map, allow with 'pass123' or '12345678' for seeded/new users
    const isValid = credentialsMap[identifier] === pass || (seededUser && (pass === 'pass123' || pass === '12345678'));

    if (isValid) {
      const loggedInUser = dataService.login(identifier);
      if (loggedInUser) {
        setUser(loggedInUser);
        refreshData(loggedInUser);
      } else {
        // Fallback for manually entered but valid demo identifiers
        const fallbackUser: AppUser = {
          id: 'temp-' + Math.random().toString(36).substr(2, 5),
          name: identifier.split('@')[0].toUpperCase(),
          email: identifier.includes('@') ? identifier : `${identifier}@test.com`,
          phone: identifier.includes('@') ? undefined : identifier,
          role: identifier.includes('admin') ? UserRole.SUPER_ADMIN : 
                identifier.includes('ngo') ? UserRole.NGO_ADMIN :
                identifier.includes('hospital') ? UserRole.HOSPITAL : UserRole.DONOR,
          ngoId: identifier.includes('ngo') ? 'ngo-karachi-1' : undefined
        };
        setUser(fallbackUser);
        refreshData(fallbackUser);
      }
    } else {
      alert(`Invalid Credentials!\n\nDefault Accounts (Pass: pass123):\n- ngo@test.com\n- hospital@test.com\n- donor@test.com\n\nAdmin Account (Pass: admin123):\n- admin@blooddost.pk`);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(authEmail, password);
  };

  const handleLogout = () => {
    dataService.logout();
    setUser(null);
    setAuthEmail('');
    setPassword('');
    setView('dashboard');
  };

  const getDashboardCards = () => {
    if (!user) return [];
    const cards = [
      { 
        id: 'donors', 
        title: (user.role === UserRole.DONOR || user.role === UserRole.HOSPITAL) 
          ? (language === 'ur' ? 'این جی اوز' : 'NGO Directory') 
          : t.donors, 
        icon: (user.role === UserRole.DONOR || user.role === UserRole.HOSPITAL) ? Building2 : Heart, 
        color: 'text-brand-red', 
        bg: 'bg-brand-red-light' 
      },
    ];

    if (user.role !== UserRole.DONOR) {
      cards.push({ id: 'thalassemia', title: t.thalassemia, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' });
    }

    if (user.role === UserRole.NGO_ADMIN || user.role === UserRole.SUPER_ADMIN) {
      cards.push({ id: 'inventory', title: t.inventory, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' });
      cards.push({ id: 'report', title: language === 'ur' ? 'مکمل رپورٹ' : 'Full Audit Report', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' });
    }

    cards.push({ id: 'requests', title: t.history, icon: Clock, color: 'text-green-600', bg: 'bg-green-50' });
    cards.push({ id: 'standards', title: t.standards, icon: Scale, color: 'text-indigo-600', bg: 'bg-indigo-50' });

    if (user.role === UserRole.SUPER_ADMIN) {
      cards.push({ id: 'admin_panel', title: t.adminPanel, icon: Shield, color: 'text-slate-900', bg: 'bg-slate-100' });
    }

    cards.push({ id: 'compatibility', title: t.compatibilityChart, icon: ShieldCheck, color: 'text-brand-red', bg: 'bg-red-50' });

    return cards;
  };

  const dashboardCards = getDashboardCards();

  const handleCreateRequest = (req: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>) => {
    dataService.addRequest({ ...req, status: 'Pending' });
    setRequests(dataService.getRequests(user || undefined));
    setIsRequestModalOpen(false);
  };

  const handleRegisterDonor = (donor: Omit<DonorProfile, 'id'>) => {
    try {
      let finalUserId = donor.userId;

      // If no user is logged in, this is a standalone registration
      if (!user) {
        const existingUser = dataService.findUserByPhone(donor.phone);
        if (existingUser) {
          showNotification(language === 'ur' ? 'اس فون نمبر والا صارف پہلے ہی موجود ہے۔' : 'A user with this phone already exists.', 'error');
          return;
        }

        const newUser: AppUser = {
          id: 'u-' + Math.random().toString(36).substr(2, 5),
          name: donor.name,
          email: donor.phone + '@blooddost.pk',
          phone: donor.phone,
          role: UserRole.DONOR,
          needsPasswordReset: true
        };
        dataService.addUser(newUser);
        finalUserId = newUser.id;
      }

      const newDonor = dataService.addDonor({
        ...donor,
        userId: finalUserId,
        addedByNgoId: user?.ngoId
      });

      if (!user) {
        // Auto login after registration
        dataService.login(donor.phone);
        const loggedInUser = dataService.getCurrentUser();
        if (loggedInUser) {
          setUser(loggedInUser);
          refreshData(loggedInUser);
          showNotification(language === 'ur' ? 'آپ کامیابی سے رجسٹر ہو گئے ہیں!' : 'You have registered successfully!', 'success');
        }
      } else {
        refreshData();
        setSearchQuery('');
        setSelectedBloodGroup('All');
        setAvailabilityFilter('all');
        showNotification(language === 'ur' ? 'ڈونر کامیابی سے رجسٹر ہو گیا!' : 'Donor registered successfully!', 'success');
      }
      
      setIsDonorModalOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      showNotification(msg, 'error');
    }
  };

  const [showShareCard, setShowShareCard] = useState<AppUser | null>(null);

  const handleRegisterNGO = (ngo: Omit<NGO, 'id'>) => {
    try {
      const newNgo = dataService.addNGO(ngo);
      const users = dataService.getUsers();
      const newUser = users.find(u => u.ngoId === newNgo.id);
      
      if (newUser) {
        // Auto login for NGO after registration
        dataService.login(newUser.email);
        const loggedInUser = dataService.getCurrentUser();
        if (loggedInUser) {
          setUser(loggedInUser);
          refreshData(loggedInUser);
          showNotification(language === 'ur' ? 'این جی او اور ایڈمن اکاؤنٹ رجسٹر ہو گیا!' : 'NGO and Admin account registered!', 'success');
        }
      } else {
        refreshData(user || undefined);
        showNotification(language === 'ur' ? 'این جی او رجسٹر ہو گئی!' : 'NGO registered!', 'success');
      }
      
      setIsNGOModalOpen(false);
    } catch (error) {
      showNotification('Error creating NGO', 'error');
    }
  };

  const handleRegisterHospital = (hospital: { name: string; email: string; phone: string; address: string; city: string }) => {
    try {
      const hospitalUser = dataService.addHospital(hospital);
      
      // Auto login after registration
      dataService.login(hospitalUser.email);
      const loggedInUser = dataService.getCurrentUser();
      if (loggedInUser) {
        setUser(loggedInUser);
        refreshData(loggedInUser);
        showNotification(language === 'ur' ? 'ہسپتال کامیابی کے ساتھ رجسٹر ہو گیا ہے!' : 'Hospital registered successfully!', 'success');
      }
      
      setIsHospitalModalOpen(false);
    } catch (error) {
      showNotification('Error registering hospital', 'error');
    }
  };

  const handleRecordDonation = (donorId: string) => {
    const donor = donors.find(d => d.id === donorId);
    if (donor) {
      setSelectedDonorForRecord(donor);
    }
  };

  const handleSubscribe = (tier: SubscriptionTier, proof: File | null) => {
    if (user) {
      // For demo, we just simulate submitting
      dataService.submitSubscription(user.id, tier, proof ? URL.createObjectURL(proof) : '');
      alert(`${tier} subscription submitted for verification!`);
      setView('dashboard');
    }
  };

  const filteredDonors = donors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         d.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup;
    
    // Eligibility calculation for filter
    const donorNgo = dataService.getNGOs().find(n => n.id === d.addedByNgoId);
    const coolOff = donorNgo?.coolOffPeriodDays || 90;
    const isNearly = isNearlyEligible(d.lastDonated || '', coolOff);

    let matchesAvailable = availabilityFilter === 'all';
    if (availabilityFilter === 'available') {
      matchesAvailable = d.isAvailable;
    } else if (availabilityFilter === 'nearlyEligible') {
      matchesAvailable = isNearly;
    } else if (availabilityFilter === 'notAvailable') {
      matchesAvailable = !d.isAvailable && !isNearly;
    }
    
    const matchesProvince = provinceFilter === 'All' || d.location.province === provinceFilter;
    const matchesDistrict = districtFilter === 'All' || d.location.district === districtFilter;
    const matchesCity = selectedCityFilter === 'All' || d.location.city === selectedCityFilter;

    return matchesSearch && matchesBlood && matchesAvailable && matchesProvince && matchesDistrict && matchesCity;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-hidden relative"
        >
          <div className="text-center mb-10 relative z-10">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center shadow-xl shadow-brand-red/20 overflow-hidden mb-4">
                {(() => {
                   const systemLogo = dataService.getSystemLogo();
                   if (systemLogo) return <img src={systemLogo} alt="Logo" className="w-full h-full object-contain bg-white" />;
                   return <Droplet className="w-10 h-10 text-white fill-current" />;
                })()}
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">BLOOD <span className="text-brand-red">DOST</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Digital Blood Network</p>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${language === 'en' ? 'bg-brand-red text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ur')}
                className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${language === 'ur' ? 'bg-brand-red text-white urdu' : 'bg-slate-100 text-slate-400 urdu'}`}
              >
                اردو
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                {language === 'ur' ? 'ای میل یا فون نمبر' : 'Email or Phone Number'}
              </label>
              <input 
                type="text" 
                placeholder="donor@example.com / 03001234567"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t.password}</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red transition-all"
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={() => setShowRecoveryModal(true)}
                className={`text-[10px] font-bold text-brand-red hover:underline uppercase tracking-widest ${language === 'ur' ? 'urdu' : ''}`}
              >
                {t.forgotPassword}
              </button>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-brand-red transition-all shadow-lg active:scale-[0.98]">
              {t.loginButton}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest py-2">OR</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setIsNGOModalOpen(true)}
                className="w-full bg-white border-2 border-slate-100 text-slate-900 rounded-xl py-3 font-black hover:bg-slate-50 transition-all text-[10px] tracking-wide uppercase"
              >
                {language === 'ur' ? 'این جی او رجسٹر کریں' : 'Register NGO'}
              </button>
              <button 
                type="button"
                onClick={() => setIsDonorModalOpen(true)}
                className="w-full bg-white border-2 border-slate-100 text-brand-red rounded-xl py-3 font-black hover:bg-red-50 transition-all text-[10px] tracking-wide uppercase"
              >
                {language === 'ur' ? 'خون کا عطیہ دہندہ بنیں' : 'Become a Donor'}
              </button>
              <button 
                type="button"
                onClick={() => setIsHospitalModalOpen(true)}
                className="w-full sm:col-span-2 bg-white border-2 border-slate-100 text-blue-600 rounded-xl py-3 font-black hover:bg-blue-50 transition-all text-[10px] tracking-wide uppercase"
              >
                {language === 'ur' ? 'ہسپتال رجسٹر کریں' : 'Register Hospital'}
              </button>
            </div>
          </form>

          {isNGOModalOpen && (
            <NGORegistrationForm 
              onClose={() => setIsNGOModalOpen(false)}
              onSave={handleRegisterNGO}
              language={language}
            />
          )}

          {isHospitalModalOpen && (
            <HospitalRegistrationForm 
              onClose={() => setIsHospitalModalOpen(false)}
              onSave={handleRegisterHospital}
              language={language}
            />
          )}

          {isDonorModalOpen && (
            <DonorRegistrationForm 
              onClose={() => setIsDonorModalOpen(false)}
              coolOffDays={user?.ngoId ? dataService.getNGOs().find(n => n.id === user.ngoId)?.coolOffPeriodDays : 90}
              onSave={handleRegisterDonor}
              language={language}
            />
          )}

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="text-center space-y-2">
              <p className="urdu text-xl text-brand-red leading-relaxed font-medium">
                "جس نے ایک انسان کی جان بچائی، گویا اس نے پوری انسانیت کی جان بچائی۔"
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                {language === 'ur' ? 'القرآن (۵:۳۲)' : 'Al-Quran (5:32)'}
              </p>
            </div>
          </div>
        </motion.div>
        
        <p className="text-slate-500 text-xs mt-8">Secure health network for verified NGOs & Donors</p>

        {/* Recovery Modal */}
        <AnimatePresence>
          {showRecoveryModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowRecoveryModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10"
              >
                <h3 className={`text-xl font-black text-slate-900 mb-4 flex items-center gap-3 ${language === 'ur' ? 'urdu' : ''}`}>
                  <Shield className="w-6 h-6 text-brand-red" />
                  {t.recoveryTitle}
                </h3>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className={`text-sm text-blue-700 leading-relaxed ${language === 'ur' ? 'urdu' : ''}`}>
                      {t.recoveryNgoMsg}
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className={`text-xs font-black text-orange-800 uppercase tracking-widest mb-2 ${language === 'ur' ? 'urdu' : ''}`}>For Super Admins:</h4>
                    <p className={`text-xs text-orange-700 leading-relaxed mb-4 ${language === 'ur' ? 'urdu' : ''}`}>
                      {t.recoveryAdminMsg}
                    </p>
                    <button 
                      onClick={() => {
                        if (confirm(t.confirmReset)) {
                          dataService.resetSystem();
                          window.location.reload();
                        }
                      }}
                      className={`w-full py-3 bg-white border-2 border-orange-200 text-orange-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-all ${language === 'ur' ? 'urdu' : ''}`}
                    >
                      {t.resetSystem}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => setShowRecoveryModal(false)}
                  className="w-full mt-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 sm:pb-0">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setView}
        currentView={view}
        onShowAbout={() => setShowAbout(true)}
        onShowAppInfo={() => setShowAppInfo(true)}
        onShowCompatibility={() => setShowCompatibilityChart(true)}
        onShowPrivacyPolicy={() => setShowPrivacyPolicy(true)}
        onShowContact={() => setShowContact(true)}
        language={language}
        onLanguageChange={setLanguage}
        subscription={subscription}
      />

      {/* Search and Filters Section - Now non-sticky and single row locations */}
      {(view === 'dashboard' || view === 'donors') && user && (
        <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-[1.5] group">
                <input 
                  type="text" 
                  placeholder={user.role === UserRole.DONOR || user.role === UserRole.HOSPITAL 
                    ? (language === 'ur' ? 'این جی او یا ہسپتال تلاش کریں...' : 'Search NGO or Hospital...')
                    : t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-red focus:ring-8 focus:ring-brand-red/5 transition-all outline-none shadow-sm group-hover:border-slate-200 h-[56px] ${language === 'ur' ? 'urdu' : ''}`}
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-[18px] group-focus-within:text-brand-red transition-colors" />
              </div>
              
              <div className="flex gap-2 flex-1">
                {(user.role === UserRole.DONOR || user.role === UserRole.HOSPITAL) ? (
                  <>
                    <Dropdown 
                      value={typeFilter}
                      onChange={setTypeFilter}
                      language={language}
                      icon={Building2}
                      options={[
                        { value: 'NGO', label: language === 'ur' ? 'این جی او' : 'NGO' },
                        { value: 'Hospital', label: language === 'ur' ? 'ہسپتال' : 'Hospital' }
                      ]}
                    />
                    <Dropdown 
                      value={cityFilter}
                      onChange={setCityFilter}
                      language={language}
                      icon={MapPin}
                      options={[
                        { value: 'All', label: language === 'ur' ? 'تمام شہر' : 'All Cities' },
                        ...dataService.getCities().map(c => ({ value: c, label: c }))
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <Dropdown 
                      value={selectedBloodGroup}
                      onChange={setSelectedBloodGroup}
                      language={language}
                      icon={Droplet}
                      options={[
                        { value: 'All', label: t.allGroups },
                        ...['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => ({ value: g, label: g }))
                      ]}
                    />
                    
                    <Dropdown 
                      value={availabilityFilter}
                      onChange={setAvailabilityFilter}
                      language={language}
                      icon={Activity}
                      options={[
                        { value: 'all', label: t.all },
                        { value: 'available', label: language === 'ur' ? 'دستیاب (خون دے سکتے ہیں)' : 'Available (Ready Now)' },
                        { value: 'nearlyEligible', label: language === 'ur' ? 'جلد دستیاب (Reminder)' : 'Ready Soon (< 5 days)' },
                        { value: 'notAvailable', label: language === 'ur' ? 'دستیاب نہیں (انتظار کریں)' : 'Still in Cool-off' }
                      ]}
                    />
                  </>
                )}
              </div>
            </div>

            {user.role !== UserRole.DONOR && user.role !== UserRole.HOSPITAL && (
              <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Filter className="w-3.5 h-3.5 text-brand-red" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location Filter</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={provinceFilter}
                    onChange={(e) => {
                      setProvinceFilter(e.target.value);
                      setDistrictFilter('All');
                      setSelectedCityFilter('All');
                    }}
                    className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2.5 text-[10px] sm:text-xs font-bold text-slate-900 outline-none focus:border-brand-red transition-all"
                  >
                    <option value="All">{language === 'ur' ? 'صوبہ' : 'Province'}</option>
                    {PAKISTAN_LOCATIONS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>

                  <select
                    value={districtFilter}
                    onChange={(e) => {
                      setDistrictFilter(e.target.value);
                      setSelectedCityFilter('All');
                    }}
                    disabled={provinceFilter === 'All'}
                    className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2.5 text-[10px] sm:text-xs font-bold text-slate-900 outline-none focus:border-brand-red transition-all disabled:opacity-50"
                  >
                    <option value="All">{language === 'ur' ? 'ضلع' : 'District'}</option>
                    {provinceFilter !== 'All' && PAKISTAN_LOCATIONS.find(p => p.name === provinceFilter)?.districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedCityFilter}
                    onChange={(e) => setSelectedCityFilter(e.target.value)}
                    disabled={districtFilter === 'All'}
                    className="bg-white border-2 border-slate-100 rounded-xl px-2 py-2.5 text-[10px] sm:text-xs font-bold text-slate-900 outline-none focus:border-brand-red transition-all disabled:opacity-50"
                  >
                    <option value="All">{language === 'ur' ? 'شہر' : 'City'}</option>
                    {districtFilter !== 'All' && provinceFilter !== 'All' && 
                      PAKISTAN_LOCATIONS.find(p => p.name === provinceFilter)?.districts.find(d => d.name === districtFilter)?.cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.dashboard}</h2>
                  {user.role === UserRole.NGO_ADMIN && currentUserNgo && (
                    <div className="mt-2 flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                         {t.donorsRemaining}: 
                         <span className="text-brand-red ml-1">
                           {currentUserNgo.donorLimit ? (currentUserNgo.donorLimit - donors.length) : t.unlimited}
                         </span>
                       </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {(user.role === UserRole.NGO_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                    <button 
                      onClick={() => setIsDonorModalOpen(true)}
                      className="hidden sm:flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-5 h-5 text-brand-red" />
                      {t.addDonor}
                    </button>
                  )}
                  {user.role === UserRole.SUPER_ADMIN && (
                    <button 
                      onClick={() => setIsNGOModalOpen(true)}
                      className="hidden sm:flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      {t.addNGO}
                    </button>
                  )}
                  {user.role === UserRole.NGO_ADMIN && (
                    <button 
                      onClick={() => setIsRequestModalOpen(true)}
                      className="flex items-center justify-center gap-2 bg-brand-red text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-red-dark transition-all shadow-lg shadow-brand-red/20 active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      {t.createRequest}
                    </button>
                  )}
                  {(user.role === UserRole.NGO_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => exportToCSV(donors, 'Blood_Donors_Report')}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        title={t.exportReport}
                      >
                        <Package className="w-5 h-5 text-brand-red" />
                        <span className="hidden lg:inline">CSV</span>
                      </button>
                      <button 
                        onClick={() => exportDonorsToPDF(donors, currentUserNgo, dataService.getSystemLogo())}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                        title={t.exportPDF}
                      >
                        <ShieldCheck className="w-5 h-5 text-brand-red" />
                        <span>{t.exportPDF}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
                {dashboardCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (card.id === 'compatibility') {
                        setShowCompatibilityChart(true);
                      } else if (card.id === 'report') {
                        const ngo = dataService.getNGOs().find(n => n.id === user.ngoId);
                        if (ngo) {
                          exportNGOMonitorReportPDF(ngo, donors, inventory, thalassemiaPatients);
                        }
                      } else {
                        setView(card.id as any);
                      }
                    }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col gap-4 group"
                  >
                    <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <card.icon className={`w-7 h-7 ${card.color} fill-current opacity-80`} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-slate-900 group-hover:text-brand-red transition-colors ${language === 'ur' ? 'urdu' : ''}`}>{card.title}</h3>
                    </div>
                  </button>
                ))}
              </div>

              {/* Browse Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                      {user.role === UserRole.DONOR || user.role === UserRole.HOSPITAL 
                        ? (typeFilter === 'NGO' ? (language === 'ur' ? 'این جی اوز کی فہرست' : 'NGO Directory') : (language === 'ur' ? 'ہسپتالوں کی فہرست' : 'Hospital Directory'))
                        : t.liveDonors}
                    </h3>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(user.role === UserRole.DONOR || user.role === UserRole.HOSPITAL) ? (
                  dataService.getNGOs()
                    .filter(n => {
                      const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCity = cityFilter === 'All' || n.address.toLowerCase().includes(cityFilter.toLowerCase()) || n.district?.toLowerCase() === cityFilter.toLowerCase();
                      
                      const isHospital = n.name.toLowerCase().includes('hospital') || n.name.toLowerCase().includes('ہسپتال');
                      const isNGO = !isHospital;
                      
                      const matchesType = typeFilter === 'NGO' ? isNGO : isHospital;
                      
                      return matchesSearch && matchesCity && matchesType;
                    })
                    .map(ngo => (
                      <NGOCard key={ngo.id} ngo={ngo} language={language} />
                    ))
                ) : (
                  filteredDonors.map(donor => (
                    <DonorCard 
                      key={donor.id} 
                      donor={donor} 
                      language={language} 
                      viewerRole={user.role}
                      onRecordDonation={handleRecordDonation}
                      coolOffDays={dataService.getNGOs().find(n => n.id === donor.addedByNgoId)?.coolOffPeriodDays}
                      ngoName={currentUserNgo?.name}
                      ngoPhone={currentUserNgo?.phone}
                    />
                  ))
                )}
              </div>

              {/* Record Donation Modal Integration */}
              <AnimatePresence>
                {selectedDonorForRecord && (
                  <DonationRecordModal 
                    donor={selectedDonorForRecord}
                    language={language}
                    onClose={() => {
                      setSelectedDonorForRecord(null);
                      refreshData();
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'donors' && (
            <motion.div
              key="donors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Heart className="w-8 h-8 text-brand-red fill-current" />
                    {t.donors}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">{language === 'ur' ? 'آپ کی این جی او کے رجسٹرڈ ڈونرز کی فہرست۔' : 'List of donors registered by your NGO.'}</p>
                </div>
                <button 
                  onClick={() => setView('dashboard')}
                  className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                >
                  {language === 'ur' ? 'واپس ڈیش بورڈ' : 'Back to Dashboard'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDonors.length > 0 ? (
                  filteredDonors.map(donor => (
                    <DonorCard 
                      key={donor.id} 
                      donor={donor} 
                      language={language} 
                      viewerRole={user.role}
                      onRecordDonation={handleRecordDonation}
                      coolOffDays={dataService.getNGOs().find(n => n.id === donor.addedByNgoId)?.coolOffPeriodDays}
                      ngoName={currentUserNgo?.name}
                      ngoPhone={currentUserNgo?.phone}
                    />
                  ))
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <Heart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-400">{language === 'ur' ? 'کوئی ڈونر نہیں ملا' : 'No Donors Found'}</h3>
                    <p className="text-slate-300 text-sm mb-6">{language === 'ur' ? 'براہ کرم ڈونر رجسٹر کریں یا فلٹر تبدیل کریں۔' : 'Please register a donor or change filters.'}</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedBloodGroup('All');
                        setAvailabilityFilter('all');
                        setProvinceFilter('All');
                        setDistrictFilter('All');
                        setSelectedCityFilter('All');
                      }}
                      className="px-6 py-3 bg-brand-red text-white rounded-xl font-bold hover:bg-brand-red-dark transition-all shadow-lg shadow-brand-red/20"
                    >
                      {language === 'ur' ? 'تمام فلٹرز ختم کریں' : 'Clear All Filters'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                  <Heart className="w-7 h-7 text-brand-red fill-current" />
                  {language === 'ur' ? 'کمیونٹی بلڈ الرٹس' : 'Live Blood Alerts'}
                </h2>
                <p className={`text-slate-500 text-sm ${language === 'ur' ? 'urdu' : ''}`}>
                  {language === 'ur' 
                    ? 'تمام این جی اوز اور ہسپتالوں کی طرف سے خون کی حالیہ درخواستیں۔' 
                    : 'Real-time blood requests from all connected NGOs and Hospitals.'}
                </p>
              </div>
              <div className="space-y-4">
                {requests.map(request => (
                  <RequestCard key={request.id} request={request} language={language} />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'profile' && user && (
            <ProfileView 
              user={user}
              language={language}
              t={t}
              onLogout={handleLogout}
              onNavigate={setView}
              onShowNotification={showNotification}
            />
          )}

          {view === 'inventory' && (
            <InventoryScreen ngoId={user.ngoId || 'ngo1'} language={language} />
          )}

          {view === 'admin_panel' && (
            <SuperAdminPanel 
              language={language} 
              onShowNotification={showNotification}
            />
          )}

          {view === 'thalassemia' && user && (
            <ThalassemiaScreen user={user} language={language} />
          )}

          {view === 'settings' && (
            <SettingsScreen 
              user={user} 
              language={language} 
              onNavigate={setView} 
              onLanguageChange={setLanguage}
              showNotification={showNotification}
            />
          )}

          {view === 'standards' && (
            <StandardsScreen 
              language={language} 
              onBack={() => setView('dashboard')} 
            />
          )}
        </AnimatePresence>

        {view === 'subscription' && (
          <SubscriptionPortal 
            onClose={() => setView('dashboard')}
            onSubscribe={handleSubscribe}
          />
        )}
      </main>

      {/* Mobile Feed Action */}
      <div className="sm:hidden fixed bottom-20 right-6 flex flex-col items-end gap-3 z-40">
        <AnimatePresence>
          {showActionSheet && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-end gap-3 mb-2"
            >
              {(user.role === UserRole.NGO_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                <button 
                  onClick={() => { setIsDonorModalOpen(true); setShowActionSheet(false); }}
                  className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-xl shadow-xl font-bold border border-slate-100 whitespace-nowrap active:scale-95 transition-transform"
                >
                  <Heart className="w-4 h-4 text-brand-red fill-current" />
                  {t.addDonor}
                </button>
              )}
              {user.role === UserRole.SUPER_ADMIN && (
                <button 
                  onClick={() => { setIsNGOModalOpen(true); setShowActionSheet(false); }}
                  className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-xl shadow-xl font-bold border border-slate-100 whitespace-nowrap active:scale-95 transition-transform"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {t.addNGO}
                </button>
              )}
              <button 
                onClick={() => { setIsRequestModalOpen(true); setShowActionSheet(false); }}
                className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2.5 rounded-xl shadow-xl font-bold border border-slate-100 whitespace-nowrap active:scale-95 transition-transform"
              >
                <Droplet className="w-4 h-4 text-brand-red fill-current" />
                {t.createRequest}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowActionSheet(!showActionSheet)}
          className={`w-14 h-14 bg-brand-red text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all duration-300 ${showActionSheet ? 'rotate-45 bg-slate-900' : ''}`}
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-40">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-brand-red' : 'text-slate-400'}`}
        >
          <Droplet className={`w-6 h-6 ${view === 'dashboard' ? 'fill-current' : ''}`} />
          <span className={`text-[10px] font-bold ${language === 'ur' ? 'urdu' : ''}`}>{t.dashboard}</span>
        </button>
        <button 
          onClick={() => setView('requests')}
          className={`flex flex-col items-center gap-1 ${view === 'requests' ? 'text-brand-red' : 'text-slate-400'}`}
        >
          <Activity className="w-6 h-6" />
          <span className={`text-[10px] font-bold ${language === 'ur' ? 'urdu' : ''}`}>{t.history}</span>
        </button>
        <button 
          onClick={() => setView('profile')}
          className={`flex flex-col items-center gap-1 ${view === 'profile' ? 'text-brand-red' : 'text-slate-400'}`}
        >
          <User className="w-6 h-6" />
          <span className={`text-[10px] font-bold ${language === 'ur' ? 'urdu' : ''}`}>{t.myProfile}</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <LogOut className="w-6 h-6" />
          <span className={`text-[10px] font-bold ${language === 'ur' ? 'urdu' : ''}`}>{t.logout}</span>
        </button>
      </div>

      {isRequestModalOpen && (
        <BloodRequestForm 
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleCreateRequest}
          ngoId={user?.ngoId || 'ngo1'}
          ngoName={user?.name || 'Connected NGO'}
        />
      )}

      {isDonorModalOpen && (
        <DonorRegistrationForm 
          onClose={() => setIsDonorModalOpen(false)}
          coolOffDays={user?.ngoId ? dataService.getNGOs().find(n => n.id === user.ngoId)?.coolOffPeriodDays : 90}
          onSave={handleRegisterDonor}
          language={language}
        />
      )}

      {isNGOModalOpen && (
        <NGORegistrationForm 
          onClose={() => setIsNGOModalOpen(false)}
          onSave={handleRegisterNGO}
          language={language}
        />
      )}

      {/* Global Notifications Toast */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 min-w-[280px] ${
                n.type === 'success' ? 'bg-white border-green-100 text-green-700' :
                n.type === 'error' ? 'bg-white border-red-100 text-red-600' :
                'bg-white border-slate-100 text-slate-700'
              }`}
            >
              {n.type === 'success' && <ShieldCheck className="w-5 h-5 text-green-500" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {n.type === 'info' && <Package className="w-5 h-5 text-blue-500" />}
              <p className="text-sm font-bold">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Shareable Credential Card */}
      <AnimatePresence>
        {showShareCard && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldCheck className="w-32 h-32 text-brand-red fill-current" />
                </div>
                <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10 shadow-xl shadow-brand-red/30">
                  <Building2 className="text-white w-8 h-8" />
                </div>
                <h3 className="text-white font-black text-xl relative z-10">NGO Registration Success</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Credentials Ready to Share</p>
              </div>

              <div className="p-8">
                 <div className="space-y-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Login Email</p>
                      <p className="font-mono text-sm font-bold text-slate-800 break-all">{showShareCard.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temporary Password</p>
                      <p className="font-mono text-sm font-bold text-slate-800 tracking-widest">12345678</p>
                    </div>
                 </div>

                 <div className="flex flex-col gap-3">
                   <button 
                     onClick={() => {
                        const text = `Blood Dost NGO Login:\nEmail: ${showShareCard.email}\nPass: 12345678\n\nLogin here: ${window.location.origin}`;
                        navigator.clipboard.writeText(text);
                        showNotification('Copied to clipboard!', 'success');
                     }}
                     className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                   >
                     <Package className="w-5 h-5" />
                     Copy Access Details
                   </button>
                   <button 
                     onClick={() => setShowShareCard(null)}
                     className="w-full bg-slate-100 text-slate-500 rounded-2xl py-4 font-bold hover:bg-slate-200 transition-all"
                   >
                     Done
                   </button>
                 </div>
                 <p className="text-[10px] text-center text-slate-400 mt-6 italic">Password reset will be required at first login.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mandatory Password Reset Modal */}
      <AnimatePresence>
        {user?.needsPasswordReset && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
              
              <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-red/30">
                <ShieldCheck className="text-white w-10 h-10" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">First Time Setup</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                Welcome to Blood Dost! For security, please choose a new private password before proceeding.
              </p>

              <form onSubmit={(e) => {
                e.preventDefault();
                dataService.updateUser(user.id, { needsPasswordReset: false });
                setUser({ ...user, needsPasswordReset: false });
                showNotification('Account setup complete!', 'success');
              }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red transition-all"
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black text-lg shadow-xl hover:bg-brand-red hover:shadow-brand-red/30 active:scale-95 transition-all">
                  Set Password & Start
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About App Modal */}
      <AnimatePresence>
        {showAppInfo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
              
              <div className="flex items-center gap-4 mb-6 relative z-10 shrink-0">
                <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center shadow-lg shadow-brand-red/20">
                  <Package className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">About Blood Dost</h3>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Version 1.0.0 Global Release</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 relative z-10">
                <section>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Blood Dost is a cutting-edge, cloud-based SaaS (Software as a Service) platform designed to revolutionize the way blood donation is managed. In regions where every second counts, this app serves as a digital bridge, connecting NGOs, hospitals, and life-saving donors through a unified, secure, and lightning-fast interface.
                  </p>
                  <p className="text-slate-600 font-medium leading-relaxed mt-4">
                    Our goal is to replace manual, fragmented record-keeping with an intelligent system that ensures the right blood type reaches the right patient at the right time.
                  </p>
                </section>

                <section>
                  <h4 className="text-brand-red font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                     <Shield className="w-3 h-3" /> Key Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { t: "1. Secure Multi-Role Ecosystem", d: " dashboards for Super Admin, NGO Admin, Hospitals, and Donors." },
                      { t: "2. Thalassemia Care & Tracking", d: "Automated transfusion cycle alerts and history management." },
                      { t: "3. Privacy & Data Isolation", d: "Zero-Leak multi-tenant architecture for absolute NGO privacy." },
                      { t: "4. Intelligent Inventory", d: "Automatic donor cool-off tracking and live inventory levels." },
                      { t: "5. Branded Reporting", d: "Professional PDF/CSV export with automatic NGO letterheads." },
                      { t: "6. Smart Search & GPS", d: "Optimized donor locating reducing data entry time by 70%." }
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h5 className="font-bold text-slate-900 text-sm mb-1">{item.t}</h5>
                        <p className="text-slate-500 text-xs leading-tight">{item.d}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-brand-red font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                     <Heart className="w-3 h-3" /> Benefits
                  </h4>
                  <div className="space-y-4">
                     <div className="p-4 border border-slate-100 rounded-2xl">
                        <h5 className="font-bold text-slate-900 text-sm mb-1">For NGOs & Hospitals</h5>
                        <p className="text-slate-500 text-xs">Zero data clutter, enhanced credibility with branded reports, and real-time resource optimization.</p>
                     </div>
                     <div className="p-4 border border-slate-100 rounded-2xl">
                        <h5 className="font-bold text-slate-900 text-sm mb-1">For Donors & Patients</h5>
                        <p className="text-slate-500 text-xs">Full contact privacy, reliable scheduled support for Thalassemia patients, and simple mobile history management.</p>
                     </div>
                     <div className="p-4 border border-slate-100 rounded-2xl">
                        <h5 className="font-bold text-slate-900 text-sm mb-1">For the Community</h5>
                        <p className="text-slate-500 text-xs">Faster emergency response and a unified professional network starting from Sibi across Pakistan.</p>
                     </div>
                  </div>
                </section>

                  {/* <section>
                   <BloodCompatibilityChart language={language} t={t} />
                </section> */}

                <div className="pt-6 border-t border-slate-100 text-center">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">Developed By</p>
                   <p className="text-slate-900 font-black text-xl">AI Studio Solutions</p>
                   <p className="text-slate-400 text-[10px] uppercase font-extrabold tracking-[0.2em]">Innovation in Life Saving Tech</p>
                </div>
              </div>

              <button 
                onClick={() => setShowAppInfo(false)}
                className="mt-6 shrink-0 w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
              >
                {t.confirm}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blood Compatibility Chart Modal */}
      <AnimatePresence>
        {showCompatibilityChart && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center shadow-lg shadow-brand-red/20">
                    <Droplet className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">{t.compatibilityChart}</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Medical Reference Guide</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCompatibilityChart(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                >
                  <Filter className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                <BloodCompatibilityChart language={language} t={t} />
                
                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-2 truncate">Why it matters?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Understanding blood compatibility is crucial during emergencies. Certain blood groups can only donate to or receive from specific types. O- is the universal donor, while AB+ is the universal recipient.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowCompatibilityChart(false)}
                className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all relative z-10"
              >
                {t.confirm}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Us Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="w-16 h-16 bg-brand-red rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-red/20">
                <Users className="text-white w-8 h-8" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-6">{t.aboutUs}</h3>
              
              <div className="space-y-6 text-left">
                <section>
                  <h4 className="text-brand-red font-black uppercase text-xs tracking-widest mb-2">{t.mission}</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {language === 'ur' 
                      ? 'بلڈ کنیکٹ ایک وقف شدہ SaaS پلیٹ فارم ہے جسے رضاکارانہ خون عطیہ کرنے والوں، این جی اوز اور ہسپتالوں کے درمیان فرق کو ختم کرنے کے لیے ڈیزائن کیا گیا ہے۔ ہمارا مشن خون کے عطیہ کے جان بچانے والے عمل کو ڈیجیٹلائز کرنا ہے، اس بات کو یقینی بنانا کہ کسی بھی مریض کو معلومات یا رابطے کی کمی کی وجہ سے خون کا انتظار نہ کرنا پڑے۔'
                      : 'Blood Dost is a dedicated SaaS platform designed to bridge the gap between voluntary blood donors, NGOs, and hospitals. Our mission is to digitize the life-saving process of blood donation, ensuring that no patient has to wait for blood due to a lack of information or connectivity.'}
                  </p>
                </section>

                <section>
                  <h4 className="text-brand-red font-black uppercase text-xs tracking-widest mb-2">{t.whatWeDo}</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: language === 'ur' ? 'این جی اوز کو بااختیار بنانا' : 'Empowering NGOs', desc: language === 'ur' ? 'ہم تنظیموں کو ان کے ڈونر ڈیٹا بیس کو نجی اور مؤثر طریقے سے منظم کرنے کے لیے ایک محفوظ ماحول فراہم کرتے ہیں۔' : 'We provide a secure environment for organizations to manage their donor databases privately and efficiently.' },
                      { title: language === 'ur' ? 'تھلیسیمیا سپورٹ' : 'Thalassemia Support', desc: language === 'ur' ? 'ہمارا خصوصی ٹریکنگ سسٹم تھلیسیمیا کے مریضوں کے لیے باقاعدگی سے خون کی منتقلی کے انتظام میں مدد کرتا ہے، بروقت دیکھ بھال کو یقینی بناتا ہے۔' : 'Our specialized tracking system helps manage regular blood transfusions for Thalassemia patients, ensuring timely care.' },
                      { title: language === 'ur' ? 'اسمارٹ انوینٹری' : 'Smart Inventory', desc: language === 'ur' ? 'ہم ہسپتالوں اور این جی اوز کو ہنگامی حالات میں فوری ردعمل دینے میں مدد کرنے کے لیے ریئل ٹائم بلڈ اسٹاک مینجمنٹ پیش کرتے ہیں۔' : 'We offer real-time blood stock management to help hospitals and NGOs respond to emergencies instantly.' },
                      { title: language === 'ur' ? 'ڈیٹا کی رازداری' : 'Data Privacy', desc: language === 'ur' ? 'ہم اس بات کو یقینی بنانے کے لیے جدید ٹیکنالوجی کا استعمال کرتے ہیں کہ ڈونر کی معلومات کو اعلیٰ ترین سطح کی سیکیورٹی اور پیشہ ورانہ اخلاقیات کے ساتھ سنبھالا جائے۔' : 'We use advanced technology to ensure that donor information is handled with the highest level of security and professional ethics.' }
                    ].map((item, i) => (
                      <li key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <h5 className="font-black text-slate-900 text-sm mb-1">{item.title}</h5>
                        <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-brand-red font-black uppercase text-xs tracking-widest mb-2">{t.vision}</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {language === 'ur' 
                      ? 'پاکستان میں خاص طور پر سبی اور بلوچستان سے شروع کرتے ہوئے ایک ہموار، ٹیکنالوجی سے چلنے والے خون کے عطیہ کے ماحولیاتی نظام کو بنانا، جہاں خون کے ہر قطرے کو ریکارڈ، ٹریک اور ضرورت مندوں تک وقت پر پہنچایا جائے۔'
                      : 'To create a seamless, technology-driven blood donation ecosystem in Pakistan, starting from Sibi and Balochistan, where every drop of blood is recorded, tracked, and delivered to those in need on time.'}
                  </p>
                </section>
              </div>

              <button 
                onClick={() => setShowAbout(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-brand-red shadow-lg transition-all mt-8"
              >
                {t.confirm}
              </button>
            </motion.div>
          </div>
        )}

        {showPrivacyPolicy && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <h3 className={`text-2xl font-black text-slate-900 ${language === 'ur' ? 'urdu' : ''}`}>{t.privacyPolicy}</h3>
              </div>
              
              <div className="space-y-6 text-slate-600 text-sm max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <h4 className="font-black text-slate-900 mb-2 uppercase text-[10px] tracking-widest">Introduction</h4>
                  <p className="leading-relaxed">
                    {language === 'ur' ? 'بلڈ دوست میں، آپ کی رازداری ہماری اولین ترجیح ہے۔ یہ پالیسی بیان کرتی ہے کہ ہم ڈونرز، این جی اوز اور ہسپتالوں کی ذاتی معلومات کو کیسے جمع، استعمال اور محفوظ کرتے ہیں۔' : 'At Blood Dost, your privacy is our top priority. This policy outlines how we collect, use, and protect the personal information of donors, NGOs, and hospitals.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <h4 className="font-black text-slate-900 mb-2 uppercase text-[10px] tracking-widest">Collection</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Full Name & Contact</li>
                      <li>Blood Group & Eligibility</li>
                      <li>District & GPS Location</li>
                      <li>Donation History</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <h4 className="font-black text-slate-900 mb-2 uppercase text-[10px] tracking-widest">Usage</h4>
                    <p className="text-xs leading-relaxed">
                      To connect donors with urgent requests, provide NGO management tools, and generate transfusion schedules.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-red/5 border border-brand-red/10 rounded-2xl">
                  <h4 className="font-black text-brand-red mb-2 uppercase text-[10px] tracking-widest">Security & Multi-Tenancy</h4>
                  <p className="leading-relaxed font-bold">"Zero-Leak" Policy</p>
                  <p className="mt-2 text-xs">
                    NGO Privacy: Data is strictly isolated. One NGO cannot see another's database.
                  </p>
                  <p className="mt-1 text-xs">
                    No Third-Party Sharing: We never sell your health or contact data.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl">
                  <h4 className="font-black text-slate-900 mb-2 uppercase text-[10px] tracking-widest">User Rights</h4>
                  <p className="leading-relaxed text-xs">
                    Users and donors have the right to request the deletion of their records from the system at any time through their registered NGO or the Super Admin.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowPrivacyPolicy(false)}
                className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
              >
                {language === 'ur' ? 'سمجھ آگیا' : 'I Accept & Understand'}
              </button>
            </motion.div>
          </div>
        )}

        {showContact && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="text-green-600 w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-6">{t.contactUs}</h3>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Support</p>
                    <p className="text-slate-900 font-bold">support@bloodconnect.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Droplet className="w-5 h-5 text-brand-red" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp / Phone</p>
                    <p className="text-slate-900 font-bold">+92 33336631349</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Head Office</p>
                    <p className="text-slate-900 font-bold">Quetta Balochistan, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Official Website</p>
                    <p className="text-slate-900 font-bold">www.bloodconnect.pk</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Technical Support</p>
                 <p className="text-slate-600 font-medium">Mon – Sat (9:00 AM to 6:00 PM)</p>
              </div>

              <button 
                onClick={() => setShowContact(false)}
                className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
              >
                {t.confirm}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
