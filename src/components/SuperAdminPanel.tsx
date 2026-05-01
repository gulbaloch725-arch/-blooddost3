import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, X, Shield, FileText, ExternalLink, Building2, 
  CreditCard, Activity, Users, Settings, MapPin, Globe, 
  Plus, Trash2, ChevronRight, Search, Download, Database,
  SearchX, Phone, Droplet, Heart, AlertTriangle
} from 'lucide-react';
import { UserSubscription, UserRole, NGO, DonorProfile, InventoryItem, ThalassemiaPatient } from '../types';
import { dataService } from '../services/dataService';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';
import { NGOEditModal } from './NGOEditModal';
import { Province, District } from '../lib/pakistanLocations';

import { exportSuperAdminReportPDF, exportNGOMonitorReportPDF } from '../services/exportService';

interface SuperAdminPanelProps {
  language: Language;
  onShowNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ language, onShowNotification }) => {
  const t = translations[language];
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [selectedNgoForEdit, setSelectedNgoForEdit] = useState<NGO | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [filters, setFilters] = useState({ city: '', ngo: '' });
  const [activeTab, setActiveTab] = useState<'ngos' | 'payments' | 'locations' | 'monitor'>('monitor');

  // Monitor State
  const [monitorCity, setMonitorCity] = useState('');
  const [selectedMonitorNgo, setSelectedMonitorNgo] = useState<NGO | null>(null);
  const [monitorData, setMonitorData] = useState<{
    donors: DonorProfile[];
    inventory: InventoryItem[];
    patients: ThalassemiaPatient[];
  } | null>(null);

  // Location Manager State
  const [locations, setLocations] = useState<Province[]>([]);
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (selectedMonitorNgo) {
      const donors = dataService.getDonorsByNGO(selectedMonitorNgo.id);
      const inventory = dataService.getInventory(selectedMonitorNgo.id);
      const patients = dataService.getPatientsByNGO(selectedMonitorNgo.id);
      setMonitorData({ donors, inventory, patients });
    } else {
      setMonitorData(null);
    }
  }, [selectedMonitorNgo]);

  const refresh = () => {
    try {
      const subs = dataService.getSubscriptions();
      const allNgos = dataService.getNGOs();
      const summaryData = dataService.getNGOSummary();
      const locationData = dataService.getLocationData();

      setSubscriptions([...subs]);
      setNgos([...allNgos]);
      setSummary({ ...summaryData });
      setLocations([...locationData]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  const handleAddProvince = () => {
    if (!newItemName.trim()) return;
    if (locations.some(p => p.name.toLowerCase() === newItemName.trim().toLowerCase())) {
      onShowNotification?.('Province already exists', 'error');
      return;
    }
    const updated = [...locations, { name: newItemName.trim(), districts: [] }];
    dataService.saveLocationData(updated);
    setLocations(updated);
    setNewItemName('');
  };

  const handleAddDistrict = (provinceName: string) => {
    if (!newItemName.trim()) return;
    const updated = locations.map(p => {
      if (p.name === provinceName) {
        if (p.districts.some(d => d.name.toLowerCase() === newItemName.trim().toLowerCase())) {
          onShowNotification?.('District already exists in this province', 'error');
          return p;
        }
        return { ...p, districts: [...p.districts, { name: newItemName.trim(), cities: [] }] };
      }
      return p;
    });
    dataService.saveLocationData(updated);
    setLocations(updated);
    setNewItemName('');
  };

  const handleAddCity = (provinceName: string, districtName: string) => {
    if (!newItemName.trim()) return;
    const updated = locations.map(p => {
      if (p.name === provinceName) {
        return {
          ...p,
          districts: p.districts.map(d => {
            if (d.name === districtName) {
              if (d.cities.some(c => c.toLowerCase() === newItemName.trim().toLowerCase())) {
                onShowNotification?.('City already exists in this district', 'error');
                return d;
              }
              return { ...d, cities: [...d.cities, newItemName.trim()] };
            }
            return d;
          })
        };
      }
      return p;
    });
    dataService.saveLocationData(updated);
    setLocations(updated);
    setNewItemName('');
  };

  const handleRemoveProvince = (name: string) => {
    const updated = locations.filter(p => p.name !== name);
    dataService.saveLocationData(updated);
    setLocations(updated);
  };

  const handleRemoveDistrict = (pName: string, dName: string) => {
    const updated = locations.map(p => {
      if (p.name === pName) {
        return { ...p, districts: p.districts.filter(d => d.name !== dName) };
      }
      return p;
    });
    dataService.saveLocationData(updated);
    setLocations(updated);
  };

  const handleRemoveCity = (pName: string, dName: string, cName: string) => {
    const updated = locations.map(p => {
      if (p.name === pName) {
        return {
          ...p,
          districts: p.districts.map(d => {
            if (d.name === dName) {
              return { ...d, cities: d.cities.filter(c => c !== cName) };
            }
            return d;
          })
        };
      }
      return p;
    });
    dataService.saveLocationData(updated);
    setLocations(updated);
  };

  const filteredNgos = ngos.filter(n => {
    const matchesCity = !filters.city || n.district?.toLowerCase().includes(filters.city.toLowerCase()) || n.address.toLowerCase().includes(filters.city.toLowerCase());
    const matchesNgo = !filters.ngo || n.name.toLowerCase().includes(filters.ngo.toLowerCase());
    return matchesCity && matchesNgo;
  });

  const handleApprove = (userId: string) => {
    dataService.updateSubscription(userId, { status: 'Active' });
    refresh();
  };

  const handleReject = (userId: string) => {
    dataService.updateSubscription(userId, { status: 'Expired' });
    refresh();
  };

  const handleSuspend = (userId: string) => {
    dataService.updateSubscription(userId, { status: 'Expired' });
    refresh();
  };

  const handleExtend = (userId: string) => {
    const sub = subscriptions.find(s => s.userId === userId);
    if (sub) {
      const currentExpiry = sub.expiryDate ? new Date(sub.expiryDate) : new Date();
      currentExpiry.setDate(currentExpiry.getDate() + 30);
      dataService.updateSubscription(userId, { status: 'Active', expiryDate: currentExpiry.toISOString() });
      refresh();
    }
  };

  const handleSaveNGO = (ngoUpdates: Partial<NGO>, subUpdates: Partial<UserSubscription>, newPassword?: string) => {
    if (selectedNgoForEdit) {
      dataService.updateNGOManagement(selectedNgoForEdit.id, ngoUpdates, subUpdates, newPassword);
      setSelectedNgoForEdit(null);
      refresh();
    }
  };

  const handleDeleteNGO = (id: string, name: string) => {
    if (!id || !name) return;
    try {
      // 1. Delete data from service
      dataService.deleteNGO(id);
      
      // 2. Clear UI states immediately to avoid stale references
      setDeleteConfirmation(null);
      setSelectedNgoForEdit(null);
      
      if (selectedMonitorNgo?.id === id) {
        setSelectedMonitorNgo(null);
      }
      
      // 3. Refresh list and analytics
      refresh();
      
      if (onShowNotification) {
        onShowNotification(`NGO "${name}" deleted successfully`, 'success');
      }
    } catch (error) {
      console.error('Error deleting NGO:', error);
      if (onShowNotification) {
        onShowNotification('Error deleting NGO', 'error');
      }
      setDeleteConfirmation(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-slate-900" />
          {t.adminPanel}
        </h2>
      </div>

      {/* Analytics Summary */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalAppUsage}</p>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-red" />
                <p className="text-2xl font-black text-slate-900">{summary.totalDonors}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total NGOs</p>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <p className="text-2xl font-black text-slate-900">{summary.ngoCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active NGOs</p>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                <p className="text-2xl font-black text-green-600">{summary.activeNGOs}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expired/Inactive</p>
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                <p className="text-2xl font-black text-red-500">{summary.expiredNGOs}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => exportSuperAdminReportPDF(summary, filteredNgos, dataService.getSystemLogo())}
            className="bg-slate-900 text-white rounded-[32px] p-6 flex flex-col items-center justify-center gap-2 shadow-xl hover:bg-black transition-all group"
          >
            <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-black text-sm uppercase tracking-widest">{t.summaryReport}</span>
          </button>
        </div>
      )}

      {/* Administration Tabs */}
      <div className="flex gap-4 p-1 bg-white border border-slate-100 rounded-3xl overflow-x-auto no-scrollbar shadow-sm">
        <button 
          onClick={() => setActiveTab('monitor')}
          className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'monitor' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Database className={`w-5 h-5 ${activeTab === 'monitor' ? 'text-brand-red' : 'text-slate-400'}`} />
          {t.ngoDataMonitor}
        </button>
        <button 
          onClick={() => setActiveTab('ngos')}
          className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'ngos' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Building2 className="w-5 h-5" />
          NGO Management
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'payments' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <CreditCard className="w-5 h-5" />
          Subscription Proofs
          {subscriptions.filter(s => s.status === 'Pending').length > 0 && (
            <span className="bg-brand-red text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {subscriptions.filter(s => s.status === 'Pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 whitespace-nowrap ${activeTab === 'locations' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <MapPin className="w-5 h-5" />
          Location Hierarchy
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'monitor' && (
          <motion.div 
            key="monitor"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Search and Select */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{t.monitorNgoData}</h3>
                  <p className="text-slate-400 text-sm">Target NGO data for verification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">1. {t.searchCity}</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-red transition-colors" />
                    <input 
                      type="text"
                      placeholder="e.g. Quetta, Sibi..."
                      value={monitorCity}
                      onChange={(e) => {
                        setMonitorCity(e.target.value);
                        setSelectedMonitorNgo(null);
                      }}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">2. {t.selectNgo}</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all appearance-none"
                    value={selectedMonitorNgo?.id || ''}
                    onChange={(e) => {
                      const ngo = ngos.find(n => n.id === e.target.value);
                      setSelectedMonitorNgo(ngo || null);
                    }}
                  >
                    <option value="">{monitorCity ? `Found ${ngos.filter(n => n.district?.toLowerCase().includes(monitorCity.toLowerCase()) || n.address.toLowerCase().includes(monitorCity.toLowerCase())).length} NGOs` : t.selectNgo}</option>
                    {ngos
                      .filter(n => !monitorCity || n.district?.toLowerCase().includes(monitorCity.toLowerCase()) || n.address.toLowerCase().includes(monitorCity.toLowerCase()))
                      .map(ngo => (
                        <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Data View */}
            {selectedMonitorNgo && monitorData ? (
              <div className="grid grid-cols-1 gap-8">
                {/* NGO Info Card */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Building2 className="w-32 h-32 rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-black tracking-tight mb-2">{selectedMonitorNgo.name}</h2>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedMonitorNgo.address}
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedMonitorNgo.phone}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (selectedMonitorNgo && monitorData) {
                        exportNGOMonitorReportPDF(
                          selectedMonitorNgo, 
                          monitorData.donors, 
                          monitorData.inventory, 
                          monitorData.patients
                        );
                      }
                    }}
                    className="bg-brand-red px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-red-dark transition-all shadow-xl flex items-center gap-3 relative z-10"
                  >
                    <Download className="w-5 h-5" />
                    {t.downloadFullReport}
                  </button>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Donors</p>
                    <div className="flex items-end justify-between">
                      <p className="text-4xl font-black text-slate-900">{monitorData.donors.length}</p>
                      <Users className="w-10 h-10 text-slate-100" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inventory Items</p>
                    <div className="flex items-end justify-between">
                      <p className="text-4xl font-black text-slate-900">{monitorData.inventory.length}</p>
                      <Droplet className="w-10 h-10 text-slate-100" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Patients</p>
                    <div className="flex items-end justify-between">
                      <p className="text-4xl font-black text-slate-900">{monitorData.patients.length}</p>
                      <Heart className="w-10 h-10 text-slate-100" />
                    </div>
                  </div>
                </div>

                {/* Detailed Data Tabs */}
                <div className="space-y-6">
                  {/* Donors Table */}
                  <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-brand-red" />
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">{t.activeDonorsList}</h3>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {monitorData.donors.map(donor => (
                            <tr key={donor.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="font-bold text-slate-900 text-sm">{donor.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">ID: {donor.id}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-red-50 text-brand-red px-3 py-1 rounded-full font-black text-xs">{donor.bloodGroup}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-slate-900 font-bold text-sm tracking-tighter">{donor.phone}</span>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-slate-500 text-xs font-medium max-w-[200px] truncate">{donor.location.address}</p>
                              </td>
                            </tr>
                          ))}
                          {monitorData.donors.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No donors registered by this NGO</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Inventory */}
                    <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl">
                      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <Database className="w-5 h-5 text-blue-600" />
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">{t.stockInventory}</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => {
                            const count = monitorData.inventory.filter(i => i.bloodGroup === group).reduce((acc, curr) => acc + curr.units, 0);
                            return (
                              <div key={group} className={`p-4 rounded-2xl border ${count > 0 ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group}</p>
                                <p className={`text-2xl font-black ${count > 0 ? 'text-blue-600' : 'text-slate-200'}`}>{count}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Patients */}
                    <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl">
                      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <Heart className="w-5 h-5 text-brand-red" />
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">{t.thalassemiaPatients}</h3>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {monitorData.patients.map(patient => (
                          <div key={patient.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                              <p className="text-[10px] text-slate-500">{patient.hospital}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">{patient.bloodGroup}</span>
                              <p className="text-[10px] text-brand-red font-bold mt-1">Cycle: {patient.cycleDays} days</p>
                            </div>
                          </div>
                        ))}
                        {monitorData.patients.length === 0 && (
                          <div className="p-12 text-center text-slate-300 italic">No patients listed</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : monitorCity && !selectedMonitorNgo ? (
              <div className="bg-white p-20 rounded-[40px] border border-slate-100 shadow-xl text-center space-y-4">
                <SearchX className="w-16 h-16 text-slate-200 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Select an NGO to view data</h3>
                  <p className="text-slate-400 text-sm">Choose from the list above to perform a monitoring audit</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[40px] border border-slate-100 shadow-xl text-center space-y-4">
                <Search className="w-16 h-16 text-slate-200 mx-auto" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Find any NGO by City</h3>
                  <p className="text-slate-400 text-sm">Search for a city like "Quetta" or "Sibi" and select a branch</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
        {activeTab === 'ngos' && (
          <motion.div 
            key="ngos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Filter By City</label>
                <input 
                  type="text"
                  placeholder="e.g. Quetta"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Filter By NGO Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Edhi"
                  value={filters.ngo}
                  onChange={(e) => setFilters(prev => ({ ...prev, ngo: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>
            </div>

            {/* NGO Management List */}
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{t.ngoManagement}</h3>
                  <p className="text-slate-400 text-xs">Manage limits, passwords and subscriptions</p>
                </div>
                <div className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                  {filteredNgos.length} NGOs
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredNgos.map(ngo => {
                  const admin = dataService.getUsers().find(u => u.ngoId === ngo.id && u.role === UserRole.NGO_ADMIN);
                  const sub = admin ? subscriptions.find(s => s.userId === admin.id) : null;
                  return (
                    <div key={ngo.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black">
                          {ngo.name ? ngo.name[0] : '?'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{ngo.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">Limit: {ngo.donorLimit}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase">{sub?.tier || 'No Plan'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${sub?.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                              {sub?.status || 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedNgoForEdit(ngo)}
                          className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Manage
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmation({ id: ngo.id, name: ngo.name || '' })}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Delete NGO"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'payments' && (
          <motion.div 
            key="payments"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl"
          >
            <div className="bg-brand-red p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Subscription Proofs</h3>
                <p className="text-brand-red-light/80 text-xs shadow-sm">Process pending payments</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {subscriptions.filter(s => s.status === 'Pending').length === 0 ? (
                <div className="p-12 text-center">
                  <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No pending subscriptions</p>
                </div>
              ) : (
                subscriptions.filter(s => s.status === 'Pending').map((sub) => (
                  <div key={sub.userId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">
                          {(() => {
                            const allUsers = dataService.getUsers();
                            const subUser = allUsers.find(u => u.id === sub.userId);
                            if (subUser?.ngoId) {
                              const ngo = dataService.getNGOs().find(n => n.id === subUser.ngoId);
                              if (ngo) return ngo.name;
                            }
                            return `NGO Account (${sub.userId})`;
                          })()} - {sub.tier} Plan
                        </h4>
                        <span className="text-yellow-600 text-[10px] uppercase font-bold tracking-widest">{sub.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.paymentProofUrl && (
                        <button 
                          onClick={() => setSelectedProof(sub.paymentProofUrl!)}
                          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          View Proof
                        </button>
                      )}
                      <button onClick={() => handleApprove(sub.userId)} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
                        <Check className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReject(sub.userId)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'locations' && (
          <motion.div 
            key="locations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-xl p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Location Hierarchy Manager</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Define provinces, districts, and cities for the network</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="New Province Name..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-brand-red transition-all min-w-[200px]"
                  />
                  <button 
                    onClick={handleAddProvince}
                    className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Province
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {locations.map((province, pIdx) => (
                  <div key={`${province.name}-${pIdx}`} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-slate-50/50">
                      <button 
                        onClick={() => setExpandedProvince(expandedProvince === province.name ? null : province.name)}
                        className="flex items-center gap-3 flex-1 text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
                          <Globe className={`w-4 h-4 text-brand-red transition-transform ${expandedProvince === province.name ? 'scale-110' : ''}`} />
                        </div>
                        <span className="font-bold text-slate-900">{province.name}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full">
                          {province.districts.length} Districts
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${expandedProvince === province.name ? 'rotate-90 text-brand-red' : ''}`} />
                      </button>
                      <button 
                        onClick={() => handleRemoveProvince(province.name)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedProvince === province.name && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-8 pb-4 pt-2 bg-white space-y-4"
                        >
                          <div className="flex gap-2 p-2 bg-slate-50 rounded-xl">
                            <input 
                              type="text" 
                              placeholder="New District for this province..."
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-brand-red transition-all"
                            />
                            <button 
                              onClick={() => handleAddDistrict(province.name)}
                              className="bg-brand-red text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand-red-dark transition-all flex items-center gap-2 shadow-sm"
                            >
                              <Plus className="w-3 h-3" />
                              Add District
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {province.districts.map((district, dIdx) => (
                              <div key={`${district.name}-${dIdx}`} className="border border-slate-100 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-3 bg-slate-50/20 hover:bg-slate-50 transition-colors">
                                  <button 
                                    onClick={() => setExpandedDistrict(expandedDistrict === district.name ? null : district.name)}
                                    className="flex items-center gap-3 flex-1 text-left"
                                  >
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{district.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 italic">
                                      {district.cities.length} Cities
                                    </span>
                                  </button>
                                  <button 
                                    onClick={() => handleRemoveDistrict(province.name, district.name)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <AnimatePresence>
                                  {expandedDistrict === district.name && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="px-10 pb-3 pt-1 space-y-3"
                                    >
                                      <div className="flex gap-2">
                                        <input 
                                          type="text" 
                                          placeholder="New City name..."
                                          value={newItemName}
                                          onChange={(e) => setNewItemName(e.target.value)}
                                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-brand-red transition-all"
                                        />
                                        <button 
                                          onClick={() => handleAddCity(province.name, district.name)}
                                          className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1 shadow-sm"
                                        >
                                          <Plus className="w-2.5 h-2.5" />
                                          Add
                                        </button>
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        {district.cities.map((city, cIdx) => (
                                          <div key={`${city}-${cIdx}`} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group hover:border-slate-300 transition-all">
                                            <span className="text-xs font-bold text-slate-600">{city}</span>
                                            <button 
                                              onClick={() => handleRemoveCity(province.name, district.name, city)}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProof && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[500] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full"
            >
              <button 
                onClick={() => setSelectedProof(null)}
                className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold hover:text-brand-red transition-colors"
               >
                <X className="w-6 h-6" /> 
                Close Preview
              </button>
              <img src={selectedProof} alt="Payment Proof" className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/10" />
            </motion.div>
          </div>
        )}

        {selectedNgoForEdit && (
          <NGOEditModal 
            ngo={selectedNgoForEdit}
            subscription={subscriptions.find(s => dataService.getUsers().find(u => u.ngoId === selectedNgoForEdit.id && u.role === UserRole.NGO_ADMIN)?.id === s.userId)}
            language={language}
            t={translations[language]}
            onClose={() => setSelectedNgoForEdit(null)}
            onSave={handleSaveNGO}
            onDelete={(id, name) => {
              setDeleteConfirmation({ id, name });
            }}
          />
        )}

        {deleteConfirmation && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Are you sure?</h3>
                <p className="text-slate-500 text-sm mt-2">
                  You are about to delete <span className="font-bold text-slate-700">{deleteConfirmation.name}</span>. 
                  This will permanently remove all donors, patients, and inventory records.
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
                  onClick={() => handleDeleteNGO(deleteConfirmation.id, deleteConfirmation.name)}
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
