import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle, Calendar, Package, Search } from 'lucide-react';
import { InventoryItem } from '../types';
import { dataService } from '../services/dataService';
import { motion } from 'motion/react';
import { Language, translations } from '../translations';

interface InventoryScreenProps {
  ngoId: string;
  language: Language;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ ngoId, language }) => {
  const t = translations[language];
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState({ 
    bloodGroup: 'O+', 
    units: 1, 
    expiryDate: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    setInventory(dataService.getInventory(ngoId));
  }, [ngoId]);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.addInventory({
      ngoId,
      ...newStock
    });
    setInventory(dataService.getInventory(ngoId));
    setShowAddForm(false);
  };

  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date);
    const diff = expiry.getTime() - new Date().getTime();
    return diff < (7 * 24 * 60 * 60 * 1000); // Less than 7 days
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.inventory}</h2>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-brand-red text-white p-3 rounded-xl shadow-lg hover:bg-brand-red-dark transition-all active:scale-95"
          title="Add New Stock"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => {
          const expiring = isExpiringSoon(item.expiryDate);
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-2xl border bg-white shadow-sm flex items-center justify-between group ${
                expiring ? 'border-orange-200' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  expiring ? 'bg-orange-100 text-orange-600' : 'bg-brand-red-light text-brand-red'
                }`}>
                  {item.bloodGroup}
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900">{item.units} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Bags</span></div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold uppercase transition-colors ${
                    expiring ? 'text-orange-500' : 'text-slate-400'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    Exp: {new Date(item.expiryDate).toLocaleDateString()}
                    {expiring && <AlertTriangle className="w-3 h-3 ml-1 animate-pulse" />}
                  </div>
                </div>
              </div>
              
              {expiring && (
                <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm">
                  Expiring Soon
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold">Add to Inventory</h3>
              <button onClick={() => setShowAddForm(false)}>
                <Plus className="w-6 h-6 rotate-45 opacity-60 hover:opacity-100 transition-opacity" />
              </button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Blood Group</label>
                  <select 
                    value={newStock.bloodGroup}
                    onChange={(e) => setNewStock({...newStock, bloodGroup: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Units (Bags)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={isNaN(newStock.units) ? '' : newStock.units}
                    onChange={(e) => setNewStock({...newStock, units: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expiry Date</label>
                <input 
                  type="date" 
                  value={newStock.expiryDate}
                  onChange={(e) => setNewStock({...newStock, expiryDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-brand-red/10 focus:border-brand-red"
                />
              </div>

              <button className="w-full bg-brand-red text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-brand-red-dark transition-all active:scale-[0.98]">
                Update Stock
              </button>
              <p className="urdu text-center text-slate-400 text-xs">محفوظ کریں</p>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
