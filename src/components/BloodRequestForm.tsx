import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { BloodRequest, UserRole } from '../types';

interface BloodRequestFormProps {
  onClose: () => void;
  onSubmit: (request: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>) => void;
  ngoId: string;
  ngoName: string;
}

export const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ onClose, onSubmit, ngoId, ngoName }) => {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState<BloodRequest['urgency']>('Medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ngoId,
      ngoName,
      bloodGroup,
      units,
      urgency,
      location,
      description
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-brand-red p-6 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-xl">Create Blood Request</h3>
            <p className="text-brand-red-light text-sm opacity-80">Post an urgent requirement for donors</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</label>
              <select 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Units Needed</label>
              <input 
                type="number" 
                min="1" 
                value={isNaN(units) ? '' : units}
                onChange={(e) => setUnits(parseInt(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency Level</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High', 'Emergency'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    urgency === level 
                      ? 'bg-brand-red text-white shadow-lg shadow-brand-red/30' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital / Location</label>
            <input 
              type="text" 
              placeholder="e.g. Civil Hospital, Sibi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Additional Details</label>
            <textarea 
              rows={3}
              placeholder="Case details, patient contact info..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red resize-none"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex gap-3 text-yellow-800 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Ensure all information is accurate. Verified requests help donors act faster.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-brand-red transition-colors shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" />
            Post Blood Request
          </button>
        </form>
      </div>
    </div>
  );
};
