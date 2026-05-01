import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Scale, 
  Clock, 
  AlertTriangle, 
  Ban, 
  Droplet,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { Language, translations } from '../translations';

interface StandardsScreenProps {
  language: Language;
  onBack: () => void;
}

export const StandardsScreen: React.FC<StandardsScreenProps> = ({ language, onBack }) => {
  const t = translations[language];
  const isUrdu = language === 'ur';

  const sections = [
    {
      icon: ShieldCheck,
      color: 'text-brand-red',
      bg: 'bg-red-50',
      title: { en: '1. Basic Eligibility', ur: '1. بنیادی شرائط' },
      content: [
        { 
          en: 'Age: 18 to 65 years.', 
          ur: 'عمر: ڈونر کی عمر 18 سے 65 سال کے درمیان ہونی چاہیے۔' 
        },
        { 
          en: 'Weight: Minimum 50 kg.', 
          ur: 'وزن: ڈونر کا وزن کم از کم 50 کلوگرام ہونا چاہیے۔' 
        },
        { 
          en: 'Health: Must be healthy. Wait if you have small illnesses (flu, cold).', 
          ur: 'صحت: ڈونر کو بالکل صحت مند ہونا چاہیے۔ اگر زکام یا فلو ہے تو ٹھیک ہونے تک انتظار کریں۔' 
        },
        { 
          en: 'Hemoglobin: Min 12.0 g/dl (Women), 13.0 g/dl (Men).', 
          ur: 'ہیموگلوبن: خواتین کے لیے 12.0 اور مردوں کے لیے 13.0 سے کم نہیں ہونا چاہیے۔' 
        }
      ]
    },
    {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      title: { en: '2. Donation Gap', ur: '2. خون عطیہ کرنے کا وقفہ' },
      content: [
        { 
          en: 'Whole Blood: Wait at least 8 to 12 weeks (2-3 months) between donations.', 
          ur: 'ہول بلڈ: دوبارہ خون دینے کے لیے کم از کم 8 سے 12 ہفتے (2-3 ماہ) کا انتظار ضروری ہے۔' 
        },
        { 
          en: 'Platelets: Can be donated every 7 to 14 days.', 
          ur: 'پلیٹلیٹس: یہ ہر 7 سے 14 دن بعد دیے جا سکتے ہیں۔' 
        }
      ]
    },
    {
      icon: AlertTriangle,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      title: { en: '3. Temporary Deferral', ur: '3. انکار یا انتظار کی وجوہات' },
      content: [
        { 
          en: 'Tattoos/Piercing: Wait 6 months after getting a tattoo or piercing.', 
          ur: 'ٹیٹو/پیئرسنگ: اگر حال ہی میں کروائی ہے تو عام طور پر 6 مہینے تک عطیہ نہیں کر سکتے۔' 
        },
        { 
          en: 'Dental Work: Wait 24 hours for small work, 1 month for surgeries.', 
          ur: 'دانتوں کا کام: چھوٹے کام کے لیے 24 گھنٹے، سرجری کے لیے 1 ماہ انتظار کریں۔' 
        },
        { 
          en: 'Pregnancy: Avoid during pregnancy and up to 6 months after childbirth.', 
          ur: 'حمل: حمل کے دوران اور بچے کی پیدائش کے 6 ماہ بعد تک خون نہیں دینا چاہیے۔' 
        }
      ]
    },
    {
      icon: Ban,
      color: 'text-slate-900',
      bg: 'bg-slate-100',
      title: { en: '4. Permanent Disqualification', ur: '4. ہمیشہ کے لیے پابندی' },
      content: [
        { 
          en: 'Positive tests for HIV/AIDS or Hepatitis B/C.', 
          ur: 'ایچ آئی وی یا ہیپاٹائٹس بی/سی کا ٹیسٹ پوزیٹو ہونا۔' 
        },
        { 
          en: 'Using unsafe injecting drugs.', 
          ur: 'ایسی دوائیاں لینا جو خون کی سپلائی کے لیے خطرناک ہوں۔' 
        },
        { 
          en: 'Serious heart diseases.', 
          ur: 'دل کی کوئی سنجیدہ بیماری۔' 
        }
      ]
    },
    {
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
      title: { en: '5. Pre & Post Donation Rules', ur: '5. عطیہ سے پہلے اور بعد کے رولز' },
      content: [
        { 
          en: 'Before: Eat a light meal, stay hydrated (approx 500ml water).', 
          ur: 'پہلے: ہلکا کھانا ضروری ہے۔ خالی پیٹ خون نہ دیں۔ خوب پانی پیئیں۔' 
        },
        { 
          en: 'After: Rest for 10-15 mins. Avoid heavy exercise for 24 hours.', 
          ur: 'بعد میں: 10-15 منٹ آرام کریں۔ اگلے 24 گھنٹے تک کوئی سخت ورزش نہ کریں۔' 
        }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className={`text-3xl font-black text-slate-900 tracking-tight ${isUrdu ? 'urdu text-4xl mb-2' : ''}`}>
            {isUrdu ? 'عالمی معیارات' : 'International Standards'}
          </h2>
          <p className={`text-slate-500 font-medium text-sm ${isUrdu ? 'text-right' : ''}`}>WHO & IFRC Guidelines</p>
        </div>
      </div>

      <div className={`bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Scale className="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-8">
          <p className={`text-slate-600 leading-relaxed ${isUrdu ? 'urdu text-2xl text-right' : 'text-lg'}`}>
            {isUrdu 
              ? 'خون کے عطیہ کے لیے بین الاقوامی معیارات زیادہ تر ورلڈ ہیلتھ آرگنائزیشن (WHO) اور ریڈ کراس (IFRC) سیٹ کرتے ہیں۔ ان کا مقصد ڈونر اور خون لینے والے دونوں کی حفاظت ہوتا ہے۔'
              : 'International standards for blood donation are primarily set by the World Health Organization (WHO) and the International Federation of Red Cross (IFRC). Their goal is to protect both the donor and the recipient.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${section.bg} rounded-3xl p-6 border border-white/50 shadow-sm`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <h3 className={`font-black text-slate-900 ${isUrdu ? 'urdu text-2xl' : 'text-lg'}`}>
                    {isUrdu ? section.title.ur : section.title.en}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${section.color.replace('text', 'bg')}`} />
                      <div>
                        <p className={`text-slate-800 font-bold ${isUrdu ? 'urdu text-right text-xl' : 'text-sm'}`}>
                          {isUrdu ? item.ur : item.en}
                        </p>
                        {!isUrdu && <p className="text-slate-500 text-xs mt-1 italic">{item.ur}</p>}
                        {isUrdu && <p className="text-slate-400 text-xs mt-2 text-right">{item.en}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <Droplet className="w-full h-full scale-150 rotate-12" />
            </div>
            <div className="relative z-10 space-y-4">
              <h4 className={`font-black ${isUrdu ? 'urdu text-3xl' : 'text-2xl'}`}>
                {isUrdu ? 'رضاکارانہ عطیہ (VNRBD)' : 'Voluntary Donation (VNRBD)'}
              </h4>
              <p className={`text-slate-300 ${isUrdu ? 'urdu text-xl' : 'text-sm'}`}>
                {isUrdu 
                  ? 'WHO کا سب سے بڑا رول "رضاکارانہ عطیہ" ہے، یعنی خون ہمیشہ اپنی مرزی سے اور بغیر کسی پیسوں کے لالچ کے دینا چاہیے، کیونکہ یہی سب سے محفوظ خون مانا جاتا ہے۔'
                  : 'WHO\'s primary principle is "Voluntary Non-Remunerated Blood Donation" (VNRBD), meaning blood should always be given freely and without financial incentive, as it is considered the safest.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
