import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Shield, Users, Calendar, Lock, Settings, Activity, Trash2, AlertTriangle } from 'lucide-react';
import { NGO, UserSubscription } from '../types';

interface NGOEditModalProps {
  ngo: NGO;
  subscription?: UserSubscription;
  language: 'en' | 'ur';
  t: any;
  onClose: () => void;
  onSave: (ngoUpdates: Partial<NGO>, subUpdates: Partial<UserSubscription>, newPassword?: string) => void;
  onDelete?: (id: string, name: string) => void;
}

export const NGOEditModal: React.FC<NGOEditModalProps> = ({ ngo, subscription, language, t, onClose, onSave, onDelete }) => {
  const [donorLimit, setDonorLimit] = useState(ngo.donorLimit || 1000);
  const [expiryDate, setExpiryDate] = useState(subscription?.expiryDate?.split('T')[0] || '');
  const [newPassword, setNewPassword] = useState('');
  const [tier, setTier] = useState<UserSubscription['tier']>(subscription?.tier || 'Basic');
  const [status, setStatus] = useState<UserSubscription['status']>(subscription?.status || 'Active');

  const handleSave = () => {
    onSave(
      { donorLimit },
      { 
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        tier,
        status
      },
      newPassword || undefined
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[400] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400">
           <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className={`text-xl font-black text-slate-900 ${language === 'ur' ? 'urdu' : ''}`}>{t.ngoManagement}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{ngo.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Subscription Status */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Subscription Tier */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Shield className="w-3 h-3" /> Plan / Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
              <option value="Basic">Basic</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" /> {t.changePassword}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Donor Limit Field */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Users className="w-3 h-3" /> {t.donorLimit}
            </label>
            <input
              type="number"
              value={isNaN(donorLimit) ? '' : donorLimit}
              onChange={(e) => setDonorLimit(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Expiry Date Field */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {t.expiryDate}
            </label>
            <input
              type="date"
              value={expiryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-10">
          <button
            onClick={handleSave}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-black"
          >
            {t.saveSettings}
          </button>
          
          {onDelete && (
            <button
              onClick={() => {
                onDelete(ngo.id, ngo.name);
              }}
              className="w-full border border-red-200 text-red-500 py-4 rounded-2xl font-black active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
              {language === 'ur' ? 'این جی او کو ڈیلیٹ کریں' : 'Delete NGO'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
