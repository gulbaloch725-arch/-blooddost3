import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Info } from 'lucide-react';

interface CompatibilityProps {
  language: 'en' | 'ur';
  t: any;
}

const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const compatibilityData: Record<string, { give: string[], receive: string[] }> = {
  'O-': { 
    give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], 
    receive: ['O-'] 
  },
  'O+': { 
    give: ['O+', 'A+', 'B+', 'AB+'], 
    receive: ['O-', 'O+'] 
  },
  'A-': { 
    give: ['A-', 'A+', 'AB-', 'AB+'], 
    receive: ['O-', 'A-'] 
  },
  'A+': { 
    give: ['A+', 'AB+'], 
    receive: ['O-', 'O+', 'A-', 'A+'] 
  },
  'B-': { 
    give: ['B-', 'B+', 'AB-', 'AB+'], 
    receive: ['O-', 'B-'] 
  },
  'B+': { 
    give: ['B+', 'AB+'], 
    receive: ['O-', 'O+', 'B-', 'B+'] 
  },
  'AB-': { 
    give: ['AB-', 'AB+'], 
    receive: ['O-', 'A-', 'B-', 'AB-'] 
  },
  'AB+': { 
    give: ['AB+'], 
    receive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] 
  },
};

export const BloodCompatibilityChart: React.FC<CompatibilityProps> = ({ language, t }) => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const isHighlighted = (group: string) => {
    if (!selectedGroup) return false;
    return compatibilityData[selectedGroup].give.includes(group) || 
           compatibilityData[selectedGroup].receive.includes(group);
  };

  const getType = (group: string) => {
    if (!selectedGroup) return null;
    const canGive = compatibilityData[selectedGroup].give.includes(group);
    const canReceive = compatibilityData[selectedGroup].receive.includes(group);
    if (canGive && canReceive) return 'both';
    if (canGive) return 'give';
    if (canReceive) return 'receive';
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
          <ShieldCheck className="text-brand-red w-6 h-6" />
        </div>
        <h3 className={`text-xl font-black text-slate-900 ${language === 'ur' ? 'urdu' : ''}`}>
          {t.compatibilityChart}
        </h3>
      </div>

      <p className={`text-slate-500 text-sm mb-6 ${language === 'ur' ? 'urdu text-right' : ''}`}>
        {language === 'ur' 
          ? 'کسی بھی بلڈ گروپ پر کلک کریں یہ دیکھنے کے لیے کہ وہ کس کو خون دے سکتا ہے اور کس سے لے سکتا ہے'
          : 'Click on any blood group to see their matching compatibility for giving and receiving.'}
      </p>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {bloodGroups.map((group) => {
          const type = getType(group);
          const isUniversalDonor = group === 'O-';
          const isUniversalRecipient = group === 'AB+';

          return (
            <motion.button
              key={group}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
              className={`
                relative h-16 rounded-2xl flex flex-col items-center justify-center transition-all border-2
                ${selectedGroup === group 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                  : type === 'give'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : type === 'receive'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : type === 'both'
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-white border-slate-100 text-slate-900 hover:border-brand-red/30'}
              `}
            >
              <span className="text-lg font-black">{group}</span>
              {(isUniversalDonor || isUniversalRecipient) && !selectedGroup && (
                <span className="absolute -top-1 -right-1 bg-brand-red text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">
                  UNI
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedGroup && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
            <h4 className={`text-xs font-black text-green-600 uppercase tracking-widest mb-2 ${language === 'ur' ? 'urdu' : ''}`}>
              {t.canGiveTo} (Giving)
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibilityData[selectedGroup].give.map(g => (
                <span key={g} className="bg-white px-3 py-1 rounded-lg text-sm font-black text-green-700 shadow-sm">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
            <h4 className={`text-xs font-black text-blue-600 uppercase tracking-widest mb-2 ${language === 'ur' ? 'urdu' : ''}`}>
              {t.canReceiveFrom} (Receiving)
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibilityData[selectedGroup].receive.map(g => (
                <span key={g} className="bg-white px-3 py-1 rounded-lg text-sm font-black text-blue-700 shadow-sm">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <Info className="w-4 h-4 text-slate-400" />
             </div>
             <p className="text-[10px] text-slate-400 font-bold leading-tight italic">
               {selectedGroup === 'O-' && t.universalDonor}
               {selectedGroup === 'AB+' && t.universalRecipient}
               {selectedGroup !== 'O-' && selectedGroup !== 'AB+' && (
                 language === 'ur' 
                   ? 'انشور کریں کہ پٹیشنٹ کا بلڈ گروپ اور ڈونر کا گروپ ڈاکٹر کی نگرانی میں ٹیسٹ کیا گیا ہو۔'
                   : 'Always ensure blood groups are professionally cross-matched before transfusion.'
               )}
             </p>
          </div>
        </motion.div>
      )}

      {!selectedGroup && (
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 bg-brand-red/5 rounded-2xl border border-brand-red/10">
              <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">O- Negative</span>
              <p className={`text-xs font-bold text-slate-900 mt-1 ${language === 'ur' ? 'urdu' : ''}`}>{t.universalDonor}</p>
           </div>
           <div className="p-4 bg-slate-900/5 rounded-2xl border border-slate-900/10">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">AB+ Positive</span>
              <p className={`text-xs font-bold text-slate-900 mt-1 ${language === 'ur' ? 'urdu' : ''}`}>{t.universalRecipient}</p>
           </div>
        </div>
      )}
    </div>
  );
};
