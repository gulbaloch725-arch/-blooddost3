import React from 'react';
import { Award, Star, Shield, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface BadgeProps {
  donationCount: number;
  language: 'en' | 'ur';
  t: any;
}

export const BadgeDashboard: React.FC<BadgeProps> = ({ donationCount, language, t }) => {
  const badges = [
    { 
      id: 'lifesaver',
      name: t.lifeSaver, 
      count: 1, 
      icon: Award, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      active: donationCount >= 1
    },
    { 
      id: 'bloodhero',
      name: t.bloodHero, 
      count: 5, 
      icon: Shield, 
      color: 'text-brand-red', 
      bg: 'bg-brand-red/10',
      active: donationCount >= 5
    },
    { 
      id: 'legendary',
      name: t.legendaryDonor, 
      count: 10, 
      icon: Star, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      active: donationCount >= 10
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className={`text-sm font-black text-slate-900 uppercase tracking-widest ${language === 'ur' ? 'urdu' : ''}`}>
          {t.badges}
        </h4>
        <div className="bg-brand-red/10 px-3 py-1 rounded-full">
           <span className="text-brand-red text-xs font-black">{donationCount} {t.donationCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`
              relative p-4 rounded-3xl flex flex-col items-center justify-center text-center border-2 transition-all duration-500
              ${badge.active 
                ? `${badge.bg} border-brand-red/5 shadow-[0_10px_30px_-10px_rgba(183,28,28,0.2)] scale-100` 
                : 'bg-slate-50 border-slate-100 grayscale opacity-40 scale-95'}
            `}
          >
            <div className={`
              w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-500
              ${badge.active ? 'bg-white shadow-sm' : 'bg-slate-100'}
            `}>
               <badge.icon className={`w-7 h-7 ${badge.active ? badge.color : 'text-slate-400'}`} />
            </div>
            <p className={`text-[9px] font-black uppercase tracking-tighter leading-tight ${language === 'ur' ? 'urdu' : ''}`}>
              {badge.name}
            </p>
            {badge.active && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-white"
              >
                <span className="text-[10px] text-white font-bold">✓</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {donationCount > 0 && (
        <div className="pt-4 space-y-2">
           <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
              <span>Progress</span>
              <span>
                {donationCount < 5 ? `${donationCount}/5` : donationCount < 10 ? `${donationCount}/10` : 'MAXED'}
              </span>
           </div>
           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (donationCount < 5 ? (donationCount/5)*100 : donationCount < 10 ? (donationCount/10)*100 : 100))}%` }}
                className="h-full bg-brand-red rounded-full"
              />
           </div>
           <p className="text-[10px] text-slate-400 font-bold italic text-center">
             {language === 'ur' 
               ? 'مزید عطیات دے کر نئے بیجز حاصل کریں!'
               : donationCount < 10 
                 ? `Donate ${donationCount < 5 ? 5 - donationCount : 10 - donationCount} more times to reach the next milestone!`
                 : 'You are a Legendary Donor! Keep saving lives!'}
           </p>
        </div>
      )}
    </div>
  );
};
