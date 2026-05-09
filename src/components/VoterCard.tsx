import React, { useState, useEffect } from 'react';
import { Voter } from '../types';
import { motion } from 'motion/react';
import { Save, User, Hash, FileText, Phone, CreditCard, Calendar, UserCheck } from 'lucide-react';

interface VoterCardProps {
  voter: Voter;
  onUpdate: (adhar: string, mobile: string) => Promise<void>;
  isUpdating: boolean;
}

const Field = ({ icon: Icon, label, value, readOnly = true, onChange, error, type = "text", placeholder }: any) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-tighter flex items-center gap-1.5">
      <Icon size={12} /> {label}
    </label>
    {readOnly ? (
      <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-800 font-medium min-h-[40px] flex items-center">
        {value || '-'}
      </div>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-white border rounded px-3 py-2 text-gray-800 font-bold focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'}`}
      />
    )}
    {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
  </div>
);

export const VoterCard: React.FC<VoterCardProps> = ({ voter, onUpdate, isUpdating }) => {
  const [adhar, setAdhar] = useState(String(voter.AdharNumber || ''));
  const [mobile, setMobile] = useState(String(voter.MobileNumber || ''));
  const [errors, setErrors] = useState<{ adhar?: string; mobile?: string }>({});

  useEffect(() => {
    setAdhar(String(voter.AdharNumber || ''));
    setMobile(String(voter.MobileNumber || ''));
  }, [voter]);

  const validate = () => {
    const newErrors: { adhar?: string; mobile?: string } = {};
    
    if (adhar && !/^\d{12}$/.test(adhar)) {
      newErrors.adhar = "Aadhaar must be 12 digits";
    }
    
    if (!mobile) {
      newErrors.mobile = "Mobile number is mandatory";
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validate()) {
      await onUpdate(adhar, mobile);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-4xl w-full mx-auto"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{voter.ElectorsName}</h2>
            <p className="text-blue-100 text-lg font-medium">{voter.ElectorNameHindi}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-right">
            <span className="block text-[10px] uppercase font-bold opacity-80">Epic Number</span>
            <span className="text-xl font-mono font-bold tracking-widest">{voter.EpicNumber}</span>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-full grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Field icon={Hash} label="AC No" value={voter.ACNo} />
          <Field icon={FileText} label="Part No" value={voter.PartNo} />
          <Field icon={FileText} label="Serial No" value={voter.SerialNo} />
          <Field icon={UserCheck} label="Gender" value={voter.ElectorGender} />
        </div>

        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field icon={Calendar} label="Age" value={voter.Age} />
          <Field icon={User} label="Relative Type" value={voter.Relativetype} />
        </div>

        <div className="col-span-full border-t border-gray-100 pt-6"></div>

        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field icon={User} label="Relative Name" value={voter.RelativeName} />
          <Field icon={User} label="Relative Name (Hindi)" value={voter.RelativeNameHindi} />
        </div>

        <div className="col-span-full border-t border-gray-100 pt-6"></div>

        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
          <Field 
            icon={CreditCard} 
            label="Adhar Number" 
            value={adhar} 
            readOnly={false} 
            onChange={setAdhar}
            error={errors.adhar}
            placeholder="12 digit Aadhaar"
          />
          <Field 
            icon={Phone} 
            label="Mobile Number *" 
            value={mobile} 
            readOnly={false} 
            onChange={setMobile}
            error={errors.mobile}
            placeholder="10 digit Mobile"
          />
        </div>

        <div className="col-span-full flex justify-end">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all
              ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 shadow-blue-200'}
            `}
          >
            <Save size={20} />
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
