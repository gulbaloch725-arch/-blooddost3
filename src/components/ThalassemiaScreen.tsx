import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Download, AlertCircle, Clock, User, Phone, CheckCircle2, FileText, Plus, UserCheck, Hospital, Activity, MapPin } from 'lucide-react';
import { ThalassemiaPatient, UserRole, AppUser } from '../types';
import { dataService } from '../services/dataService';
import { exportPatientsToPDF, exportToCSV } from '../services/exportService';
import { Language, translations } from '../translations';
import ThalassemiaForm from './ThalassemiaForm';

interface ThalassemiaScreenProps {
  language: Language;
  user: AppUser;
}

export const ThalassemiaScreen: React.FC<ThalassemiaScreenProps> = ({ language, user }) => {
  const t = translations[language];
  const [patients, setPatients] = useState<ThalassemiaPatient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const currentUser = user;

  const loadPatients = () => {
    setPatients(dataService.getPatients(currentUser));
  };

  useEffect(() => {
    loadPatients();
  }, [currentUser.id, currentUser.role]);

  const calculateRemaining = (lastDate: string, cycle: number) => {
    const last = new Date(lastDate);
    const next = new Date(last.getTime() + cycle * 24 * 60 * 60 * 1000);
    const diff = next.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleExportCSV = () => {
    exportToCSV(patients, 'Thalassemia_Patients_Report');
  };

  const handleExportPDF = async () => {
    try {
      const ngo = currentUser.ngoId ? dataService.getNGOs().find(n => n.id === currentUser.ngoId) : undefined;
      await exportPatientsToPDF(patients, ngo, dataService.getSystemLogo());
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert('Failed to generate PDF Report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <Activity className="w-8 h-8 text-brand-red" />
            {t.patientList}
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {currentUser?.role === UserRole.NGO_ADMIN && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-brand-red text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-black hover:bg-red-600 transition-all shadow-xl shadow-brand-red/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className={language === 'ur' ? 'urdu' : ''}>{t.addPatient}</span>
            </button>
          )}
          <button 
            onClick={handleExportCSV}
            className="bg-white border-2 border-slate-100 text-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2 font-bold hover:bg-slate-50 transition-all group active:scale-95"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center gap-2 font-bold hover:bg-black transition-all shadow-lg group active:scale-95 border-2 border-slate-800"
          >
            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
            PDF Report
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && currentUser && (
          <ThalassemiaForm 
            user={currentUser}
            language={language}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadPatients();
            }}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.map((patient) => {
          const daysLeft = calculateRemaining(patient.lastTransfusion, patient.cycleDays);
          const isUrgent = daysLeft <= 3 && daysLeft > 0;
          const isDue = daysLeft <= 0;

          return (
            <motion.div 
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl border-2 p-6 transition-all relative overflow-hidden group ${
                isDue ? 'border-brand-red shadow-xl shadow-brand-red/10 animate-pulse' : 
                isUrgent ? 'border-orange-400 shadow-lg shadow-orange-100' : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Urgency Light/Indicator */}
              {(isDue || isUrgent) && (
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 animate-pulse blur-3xl ${
                  isDue ? 'bg-brand-red' : 'bg-orange-400'
                }`} />
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                    isDue ? 'bg-brand-red text-white' : 
                    isUrgent ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-900'
                  }`}>
                    {patient.bloodGroup}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                      {patient.name}
                      {isDue && <div className="w-2 h-2 bg-brand-red rounded-full animate-ping" />}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      s/o {patient.fatherName}
                    </p>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-2xl font-black text-sm flex flex-col items-center min-w-[100px] border-2 ${
                  isDue ? 'bg-brand-red/10 border-brand-red text-brand-red' : 
                  isUrgent ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-green-100 border-green-200 text-green-600'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">
                    {isDue ? 'OVERDUE' : isUrgent ? 'CRITICAL' : 'REMAINING'}
                  </span>
                  {isDue ? 'ACTION' : `${daysLeft} ${translations[language].days}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter block mb-1">Last Transfusion</span>
                  <span className="text-sm font-black text-slate-700">{new Date(patient.lastTransfusion).toLocaleDateString()}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter block mb-1">Age & Gender</span>
                  <span className="text-sm font-black text-slate-700">{patient.age}Y • {patient.gender}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter block mb-1">Cycle & Next</span>
                  <span className="text-sm font-black text-brand-red flex items-center gap-1">
                    {patient.cycleDays} Days
                    <div className="w-1 h-1 bg-slate-300 rounded-full mx-1" />
                    Due in {daysLeft}d
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl col-span-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Hospital className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Hospital & Doctor</span>
                  </div>
                  <span className="text-sm font-black text-slate-700">{patient.hospital}</span>
                  <span className="text-xs font-bold text-slate-400 block">Dr. {patient.doctor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 font-bold">
                    <Phone className="w-4 h-4 text-brand-red" />
                    <span className="text-sm">{patient.contactNumber}</span>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                    isDue || isUrgent ? 'bg-red-100 text-brand-red grow-0' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isDue || isUrgent ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        {t.urgencyAlert}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Stable
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium italic truncate">{patient.address}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
