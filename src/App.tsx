/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Database, 
  AlertCircle, 
  ChevronRight, 
  RefreshCcw,
  SearchCode,
  Users
} from 'lucide-react';
import { Voter, SHEET_RANGES } from './types';
import * as gasService from './services/gasService';
import { VoterCard } from './components/VoterCard';

export default function App() {
  const [sheetName, setSheetName] = useState('');
  const [epicSearch, setEpicSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBy, setSearchBy] = useState<'name' | 'serial'>('name');
  
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchResult, setSearchResult] = useState<Voter[]>([]);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);

  const handleEpicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetName) return setError('Please select a sheet range first.');
    if (!epicSearch) return setError('Please enter an Epic Number.');
    
    setLoading(true);
    setError(null);
    setSearchResult([]);
    setSelectedVoter(null);
    
    try {
      const result = await gasService.searchByEpic(sheetName, epicSearch);
      if (result) {
        setSelectedVoter(result);
      } else {
        setError('No voter found with this Epic Number.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetName) return setError('Please select a sheet range first.');
    if (!searchQuery) return setError('Please enter a search query.');
    
    setLoading(true);
    setError(null);
    setSelectedVoter(null);
    
    try {
      const results = await gasService.searchVoters(sheetName, searchQuery, searchBy);
      setSearchResult(results);
      if (results.length === 0) {
        setError('No matches found.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search voters.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (adhar: string, mobile: string) => {
    if (!selectedVoter) return;
    
    setIsUpdating(true);
    try {
      const message = await gasService.updateVoter(sheetName, selectedVoter.EpicNumber, adhar, mobile);
      alert(message);
      // Update local state to reflect changes
      setSelectedVoter({ ...selectedVoter, AdharNumber: adhar, MobileNumber: mobile });
    } catch (err: any) {
      alert('Error updating: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Voter Portal</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Database Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Part No Range</span>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-blue-500" />
                <span className="font-bold text-slate-700">{sheetName || 'Not Selected'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Controls */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Sheet Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2 tracking-tight">
                <Database size={16} className="text-blue-600" />
                1. Select Part No Range
              </label>
              <select 
                value={sheetName}
                onChange={(e) => {
                  setSheetName(e.target.value);
                  setSelectedVoter(null);
                  setSearchResult([]);
                  setError(null);
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">-- Choose Range --</option>
                {SHEET_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            {/* Epic Search */}
            <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-opacity ${!sheetName ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2 tracking-tight">
                <SearchCode size={16} className="text-blue-600" />
                2. Search By Epic
              </label>
              <form onSubmit={handleEpicSearch} className="space-y-3">
                <input 
                  type="text"
                  placeholder="Enter Epic Number"
                  value={epicSearch}
                  onChange={(e) => setEpicSearch(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 transition-all outline-none uppercase placeholder:normal-case"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white rounded-xl py-3 font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Search size={16} />}
                  Find Elector
                </button>
              </form>
            </div>

            {/* Advanced Search */}
            <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-opacity ${!sheetName ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2 tracking-tight">
                <Users size={16} className="text-blue-600" />
                Alternative Search
              </label>
              <form onSubmit={handleGeneralSearch} className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['name', 'serial'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSearchBy(type)}
                      className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${searchBy === type ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  placeholder={`Search by ${searchBy}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-xl py-3 font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-blue-100"
                >
                  {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Search size={16} />}
                  Browse List
                </button>
              </form>
            </div>
          </aside>

          {/* Result Display Area */}
          <div className="lg:col-span-3 min-h-[600px] relative">
            <AnimatePresence mode="wait">
              {loading && !selectedVoter && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-20"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
                  </div>
                  <p className="mt-4 font-black uppercase text-xs tracking-[0.2em] text-slate-400 animate-pulse">Fetching Secure Data...</p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-700"
                >
                  <AlertCircle size={32} className="shrink-0" />
                  <div>
                    <h3 className="font-black uppercase text-sm tracking-tight">Access Error</h3>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </motion.div>
              )}

              {selectedVoter ? (
                <motion.div 
                  key="voter-details"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <button 
                    onClick={() => setSelectedVoter(null)}
                    className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <ChevronRight size={14} className="rotate-180" /> Back to results
                  </button>
                  <VoterCard voter={selectedVoter} onUpdate={handleUpdate} isUpdating={isUpdating} />
                </motion.div>
              ) : searchResult.length > 0 ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="col-span-full border-b border-slate-200 pb-2 mb-2 flex justify-between items-end">
                    <h2 className="font-black uppercase text-xs tracking-widest text-slate-400">Found {searchResult.length} Matches</h2>
                  </div>
                  {searchResult.map((voter) => (
                    <motion.button
                      key={voter.EpicNumber}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedVoter(voter)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-slate-100 px-2 py-1 rounded text-[9px] font-black uppercase text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600">
                          Epic: {voter.EpicNumber}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Part {voter.PartNo} | Serial {voter.SerialNo}</div>
                      </div>
                      <h3 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors uppercase">{voter.ElectorsName}</h3>
                      <p className="text-sm font-medium text-slate-500 mb-3">{voter.ElectorNameHindi}</p>
                      <div className="flex items-center justify-end">
                        <span className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">View Profile <ChevronRight size={10} /></span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : !loading && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20"
                >
                  <div className="bg-slate-100 p-8 rounded-full">
                    <Database className="text-slate-300" size={64} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ready for query</h3>
                    <p className="text-sm font-medium text-slate-400 max-w-xs">Select a sheet range and enter an Epic number or use search criteria to fetch records from the Cloud Database.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Database className="text-white" size={16} />
            </div>
            <span className="font-black uppercase tracking-widest text-xs">Voter Information System</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">© 2026 Secured Voter Management Network</p>
          <div className="flex gap-6">
            <span className="text-[10px] font-black uppercase text-slate-400">Database Ready</span>
            <span className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              API Synchronized
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
