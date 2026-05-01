import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Map as MapIcon, Navigation } from 'lucide-react';
import { Province, District } from '../lib/pakistanLocations';
import { Language, translations } from '../translations';
import { dataService } from '../services/dataService';

interface LocationSelectorProps {
  language: Language;
  onLocationChange: (location: { province: string; district: string; city: string }) => void;
  initialLocation?: { province: string; district: string; city: string };
  showLabels?: boolean;
  className?: string;
  forceRow?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  language,
  onLocationChange,
  initialLocation,
  showLabels = true,
  className = "",
  forceRow = false
}) => {
  const t = translations[language];
  const PAKISTAN_LOCATIONS = dataService.getLocationData();
  const [selectedProvince, setSelectedProvince] = useState<string>(initialLocation?.province || "");
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialLocation?.district || "");
  const [selectedCity, setSelectedCity] = useState<string>(initialLocation?.city || "");

  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        // Mocking geo-reverse to Pakistan Cities for demo
        // In a real app we would use Google Maps Geocoding API
        setTimeout(() => {
          setSelectedProvince("Punjab");
          setSelectedDistrict("Lahore");
          setSelectedCity("Lahore City");
          setIsDetecting(false);
          alert(language === 'ur' ? 'مقام کا پتہ چل گیا: لاہور، پنجاب' : 'Location Detected: Lahore, Punjab');
        }, 1500);
      }, () => {
        setIsDetecting(false);
        alert('Could not detect location. Please select manually.');
      });
    } else {
      setIsDetecting(false);
      alert('Geolocation not supported');
    }
  };

  // Update districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const provinceData = PAKISTAN_LOCATIONS.find(p => p.name === selectedProvince);
      if (provinceData) {
        setDistricts(provinceData.districts);
        // Reset district if it's not in the new province
        if (!provinceData.districts.find(d => d.name === selectedDistrict)) {
          setSelectedDistrict("");
          setSelectedCity("");
        }
      }
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      setSelectedCity("");
    }
  }, [selectedProvince]);

  // Update cities when district changes
  useEffect(() => {
    if (selectedDistrict && selectedProvince) {
      const provinceData = PAKISTAN_LOCATIONS.find(p => p.name === selectedProvince);
      const districtData = provinceData?.districts.find(d => d.name === selectedDistrict);
      if (districtData) {
        setCities(districtData.cities);
        // Reset city if it's not in the new district
        if (!districtData.cities.includes(selectedCity)) {
          setSelectedCity("");
        }
      }
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedDistrict, selectedProvince]);

  // Notify parent of changes
  useEffect(() => {
    onLocationChange({
      province: selectedProvince,
      district: selectedDistrict,
      city: selectedCity
    });
  }, [selectedProvince, selectedDistrict, selectedCity]);

  const selectClasses = `w-full bg-slate-50 border-2 border-slate-100 rounded-2xl ${forceRow ? 'px-2 py-2.5 text-[11px]' : 'px-4 py-3 text-sm'} font-bold text-slate-900 focus:bg-white focus:border-brand-red outline-none transition-all`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <button 
          type="button"
          onClick={detectLocation}
          className={`flex items-center gap-2 ${forceRow ? 'text-[9px]' : 'text-[10px]'} font-black text-brand-red uppercase tracking-[0.2em] bg-brand-red/5 ${forceRow ? 'px-3 py-1.5' : 'px-4 py-2'} rounded-full hover:bg-brand-red/10 transition-all border border-brand-red/10 group`}
        >
          <Navigation className={`${forceRow ? 'w-2.5 h-2.5' : 'w-3 h-3'} ${isDetecting ? 'animate-ping' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'}`} />
          {isDetecting ? (language === 'ur' ? 'پتہ لگا رہا ہے...' : 'Detecting...') : (language === 'ur' ? 'موجودہ مقام' : 'Current Location')}
        </button>
      </div>

      <div className={`grid ${forceRow ? 'grid-cols-3 gap-2' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
        {/* Province Select */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className={`block ${forceRow ? 'text-[8px]' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-widest ml-1`}>
              {language === 'ur' ? 'صوبہ' : 'Province'}
            </label>
          )}
          <div className="relative">
            {!forceRow && <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className={`${selectClasses} ${!forceRow ? 'pl-11' : ''} ${language === 'ur' ? 'urdu' : ''}`}
            >
              <option value="">{language === 'ur' ? 'صوبہ' : 'Province'}</option>
              {PAKISTAN_LOCATIONS.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* District Select */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className={`block ${forceRow ? 'text-[8px]' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-widest ml-1`}>
              {language === 'ur' ? 'ضلع' : 'District'}
            </label>
          )}
          <div className="relative">
            {!forceRow && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedProvince}
              className={`${selectClasses} ${!forceRow ? 'pl-11' : ''} ${language === 'ur' ? 'urdu' : ''} disabled:opacity-50`}
            >
              <option value="">{language === 'ur' ? 'ضلع' : 'District'}</option>
              {districts.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* City Select */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className={`block ${forceRow ? 'text-[8px]' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-widest ml-1`}>
              {language === 'ur' ? 'شہر' : 'City'}
            </label>
          )}
          <div className="relative">
            {!forceRow && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedDistrict}
              className={`${selectClasses} ${!forceRow ? 'pl-11' : ''} ${language === 'ur' ? 'urdu' : ''} disabled:opacity-50`}
            >
              <option value="">{language === 'ur' ? 'شہر' : 'City'}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
