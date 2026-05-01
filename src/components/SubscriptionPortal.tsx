import React, { useState } from 'react';
import { Check, Upload, ShieldCheck, CreditCard, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '../types';

interface SubscriptionPortalProps {
  onClose: () => void;
  onSubscribe: (tier: SubscriptionTier, proof: File | null) => void;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: SubscriptionTier.FREE,
    price: 'PKR 0',
    features: ['Standard matching', '5 donor requests/month', 'Basic support']
  },
  {
    id: 'bronze',
    tier: SubscriptionTier.BRONZE,
    price: 'PKR 500',
    features: ['Urgent request priority', 'Unlimited matching', 'Direct phone access', 'Standard status badge']
  },
  {
    id: 'silver',
    tier: SubscriptionTier.SILVER,
    price: 'PKR 1,500',
    features: ['Real-time SMS alerts', 'Verified NGO status', 'Regional donor search', 'Featured requests'],
    recommended: true
  },
  {
    id: 'golden',
    tier: SubscriptionTier.GOLDEN,
    price: 'PKR 5,000',
    features: ['Multi-city donor database', 'Direct blood bank integration', 'Advanced analytics', 'VIP support']
  }
];

export const SubscriptionPortal: React.FC<SubscriptionPortalProps> = ({ onClose, onSubscribe }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.BRONZE);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSubscribe(selectedTier, screenshot);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side: Plans */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Upgrade Your Impact</h2>
            <p className="urdu text-brand-red font-semibold text-lg">پلان منتخب کریں</p>
            <p className="text-slate-500 text-sm mt-1">Choose a plan that fits your NGO's lifesaving needs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedTier(plan.tier)}
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedTier === plan.tier 
                    ? 'border-brand-red bg-white shadow-xl scale-[1.02]' 
                    : 'border-slate-200 bg-white/50 hover:border-slate-300'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-brand-red text-white text-[10px] font-bold uppercase rounded-full tracking-widest flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{plan.tier}</h3>
                    <div className="text-2xl font-black text-slate-900 mt-1">{plan.price}</div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">per month</span>
                  </div>
                  <div className={`p-2 rounded-full ${selectedTier === plan.tier ? 'bg-brand-red text-white' : 'bg-slate-100 text-slate-300'}`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-xs text-slate-600 gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-red/30 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Payment */}
        <div className="w-full md:w-[400px] bg-slate-900 p-8 text-white flex flex-col">
          <div className="flex justify-between items-start mb-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <CreditCard className="text-white w-6 h-6" />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <AlertCircle className="w-5 h-5 opacity-40 rotate-45" />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
            <p className="text-slate-400 text-sm">Send your payment to the official Blood Dost Easypaisa/JazzCash account</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center font-bold">EP</div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Easypaisa Account</p>
                <p className="font-bold">0300 1234567</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-500 text-black rounded-lg flex items-center justify-center font-bold">JC</div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">JazzCash Account</p>
                <p className="font-bold">0333 9876543</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Upload Payment Screenshot
              <p className="urdu text-brand-red-light font-normal text-xs mt-1 lowercase">پیمنٹ کا اسکرین شاٹ اپ لوڈ کریں</p>
            </label>

            <div className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${
                previewUrl ? 'border-brand-red bg-brand-red/5' : 'border-white/20 hover:border-white/40'
              }`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-500 mb-2 group-hover:text-brand-red transition-colors" />
                    <p className="text-xs text-slate-500">Tap to browse or drop file</p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                <Clock className="w-3 h-3" />
                Processing time: 1-2 hours
              </div>

              <button
                disabled={!screenshot || isSubmitting}
                onClick={handleSubmit}
                className={`w-full py-4 rounded-2xl font-bold shadow-2xl transition-all flex items-center justify-center gap-2 ${
                  !screenshot || isSubmitting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-brand-red hover:bg-brand-red-dark text-white active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Submit for Verification
                  </>
                )}
              </button>
              <p className="urdu text-center text-slate-500 text-xs">تصدیق کے لیے بھیجیں</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
