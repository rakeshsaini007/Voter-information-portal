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
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="glow-orb -top-20 -right-20 w-96 h-96 bg-indigo-500"></div>
        <div className="glow-orb top-40 -left-20 w-72 h-72 bg-blue-500" style={{ animationDelay: '1s' }}></div>
        <div className="glow-orb bottom-20 right-1/3 w-80 h-80 bg-purple-500" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="primary-gradient p-3 rounded-2xl text-white shadow-2xl shadow-indigo-500/50 transform hover:scale-110 transition-transform duration-300">
                <Database size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                  Voter <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Portal</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Database Management System</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="text-xs font-bold text-white/80 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                {sheetName ? `Part: ${sheetName}` : 'Select Range'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar / Controls */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Sheet Selection */}
              <div className="glass-card p-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 primary-gradient"></div>
                <label className="text-xs font-black text-white/50 uppercase mb-4 flex items-center gap-2 tracking-widest">
                  <Database size={14} className="text-indigo-400" />
                  1. Region Range
                </label>
                <select 
                  value={sheetName}
                  onChange={(e) => {
                    setSheetName(e.target.value);
                    setSelectedVoter(null);
                    setSearchResult([]);
                    setError(null);
                  }}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 font-bold text-white focus:border-indigo-400 transition-all outline-none appearance-none"
                >
                  <option value="" className="bg-slate-900">-- Choose Range --</option>
                  {SHEET_RANGES.map(range => (
                    <option key={range} value={range} className="bg-slate-900">{range}</option>
                  ))}
                </select>
              </div>

              {/* Epic Search */}
              <div className={`glass-card p-6 overflow-hidden relative transition-opacity ${!sheetName ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <label className="text-xs font-black text-white/50 uppercase mb-4 flex items-center gap-2 tracking-widest">
                  <SearchCode size={14} className="text-purple-400" />
                  2. Search By Epic
                </label>
                <form onSubmit={handleEpicSearch} className="space-y-4">
                  <input 
                    type="text"
                    placeholder="Enter Epic Number"
                    value={epicSearch}
                    onChange={(e) => setEpicSearch(e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 font-bold text-white focus:border-purple-400 transition-all outline-none uppercase placeholder:normal-case placeholder:text-white/20"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="primary-button group w-full p-0 h-[52px]"
                  >
                    <div className="absolute inset-0 primary-gradient group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="relative flex items-center gap-2">
                      {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Search size={16} />}
                      Fetch Details
                    </div>
                  </button>
                </form>
              </div>

              {/* Alternative Search */}
              <div className={`glass-card p-6 overflow-hidden relative transition-opacity ${!sheetName ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <label className="text-xs font-black text-white/50 uppercase mb-4 flex items-center gap-2 tracking-widest">
                  <Users size={14} className="text-pink-400" />
                  3. Browse Mode
                </label>
                <form onSubmit={handleGeneralSearch} className="space-y-4">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {(['name', 'serial'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSearchBy(type)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${searchBy === type ? 'bg-white/10 shadow-lg text-white' : 'text-white/30 hover:text-white/50'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text"
                    placeholder={`Type ${searchBy}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 font-bold text-white focus:border-pink-400 transition-all outline-none placeholder:text-white/20"
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="primary-button group w-full p-0 h-[52px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="relative flex items-center gap-2">
                      {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Search size={16} />}
                      Search List
                    </div>
                  </button>
                </form>
              </div>
            </aside>

            {/* Result Display Area */}
            <div className="lg:col-span-3 min-h-[500px] relative">
              <AnimatePresence mode="wait">
                {loading && !selectedVoter && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-20"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-white/10 border-t-indigo-400 rounded-full animate-spin"></div>
                      <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={32} />
                    </div>
                    <p className="mt-6 font-black uppercase text-xs tracking-[0.3em] text-white/40 animate-pulse">Syncing Cloud Nodes...</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card border-red-500/30 bg-red-500/10 p-8 flex items-center gap-6 text-red-200"
                  >
                    <div className="bg-red-500/20 p-4 rounded-2xl">
                      <AlertCircle size={40} className="shrink-0 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-sm tracking-widest text-red-400 mb-1">Process Halted</h3>
                      <p className="text-sm font-medium opacity-80">{error}</p>
                    </div>
                  </motion.div>
                )}

                {selectedVoter ? (
                  <motion.div 
                    key="voter-details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => setSelectedVoter(null)}
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10"
                    >
                      <ChevronRight size={14} className="rotate-180" /> Back to cluster
                    </button>
                    <VoterCard voter={selectedVoter} onUpdate={handleUpdate} isUpdating={isUpdating} />
                  </motion.div>
                ) : searchResult.length > 0 ? (
                  <motion.div 
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="col-span-full border-b border-white/10 pb-4 mb-2 flex justify-between items-end">
                      <h2 className="font-black uppercase text-[10px] tracking-widest text-white/40">Query Results: {searchResult.length} Nodes Found</h2>
                    </div>
                    {searchResult.map((voter, index) => (
                      <motion.button
                        key={voter.EpicNumber}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, translateY: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedVoter(voter)}
                        className="glass-card p-6 text-left group overflow-hidden relative"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-indigo-300 border border-indigo-500/30">
                            {voter.EpicNumber}
                          </div>
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-tighter">P{voter.PartNo} | S{voter.SerialNo}</div>
                        </div>
                        <h3 className="font-black text-white text-xl group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{voter.ElectorsName}</h3>
                        <p className="text-sm font-medium text-white/40 mb-4">{voter.ElectorNameHindi}</p>
                        <div className="flex items-center justify-end">
                          <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">Expand Node <ChevronRight size={10} /></span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : !loading && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center py-20 px-4"
                  >
                    <div className="relative mb-8">
                       <div className="absolute -inset-4 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                       <div className="bg-white/5 p-12 rounded-full border border-white/10 relative">
                        <Database className="text-white/20" size={80} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Idle System</h3>
                      <p className="text-sm font-medium text-white/30 max-w-sm mx-auto leading-relaxed">
                        Select a Part No range and enter sequence data to fetch records from the Cloud Intelligence Nodes.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur-3xl py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <Database className="text-indigo-400" size={20} />
              </div>
              <span className="font-black uppercase tracking-[0.2em] text-[10px] text-white/60">Voter Intelligence Network</span>
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">© 2026 Secured Data Infrastructure · Layer 1 Protocol</p>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                <span className="text-[10px] font-black uppercase text-white/40">Secure Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[10px] font-black uppercase text-emerald-400">Live API</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
