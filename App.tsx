import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_LOG } from './constants';
import { parseTerraformLog } from './services/parser';
import { calculateDiff } from './services/diffEngine';
import { DiffResult, DiffType } from './types';
import { ComparisonView } from './components/ComparisonView';
import { 
  FileText, 
  Search, 
  AlertCircle, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  ArrowRight, 
  LayoutDashboard,
  ShieldAlert,
  Moon,
  Sun
} from 'lucide-react';

function App() {
  const [logInput, setLogInput] = useState(SAMPLE_LOG);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DiffType | 'ALL'>('ALL');
  const [selectedModification, setSelectedModification] = useState<DiffResult | null>(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const diffResults = useMemo(() => {
    const { added, removed } = parseTerraformLog(logInput);
    return calculateDiff(added, removed);
  }, [logInput]);

  const stats = useMemo(() => {
    return {
      total: diffResults.length,
      added: diffResults.filter(r => r.type === DiffType.ADDED).length,
      removed: diffResults.filter(r => r.type === DiffType.REMOVED).length,
      modified: diffResults.filter(r => r.type === DiffType.MODIFIED).length,
    };
  }, [diffResults]);

  const filteredResults = useMemo(() => {
    return diffResults.filter(result => {
      const matchesSearch = 
        result.rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'ALL' || result.type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [diffResults, searchTerm, filterType]);

  const getRowStyle = (type: DiffType) => {
    switch (type) {
      case DiffType.ADDED: 
        return 'bg-green-50 hover:bg-green-100 border-l-green-500 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-l-green-600 border-l-4';
      case DiffType.REMOVED: 
        return 'bg-red-50 hover:bg-red-100 border-l-red-500 opacity-75 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-l-red-600 border-l-4';
      case DiffType.MODIFIED: 
        return 'bg-yellow-50 hover:bg-yellow-100 border-l-yellow-500 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:border-l-yellow-600 border-l-4';
      default: 
        return 'bg-white dark:bg-slate-800';
    }
  };

  const getBadgeStyle = (type: DiffType) => {
    switch (type) {
      case DiffType.ADDED: return 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300';
      case DiffType.REMOVED: return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300';
      case DiffType.MODIFIED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const formatPort = (ranges?: string[]) => {
    if (!ranges || ranges.length === 0) return '*';
    return ranges.join(', ');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Terraform Plan Visualizer</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard size={16} /> Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'input' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                 <div className="flex items-center gap-2">
                  <FileText size={16} /> Logs Input
                </div>
              </button>
            </nav>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'input' ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 p-6 h-[calc(100vh-10rem)] flex flex-col transition-colors duration-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Paste Terraform Output</h2>
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm border dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-600 dark:text-slate-300 transition-colors duration-200"
              placeholder="Paste your terraform plan output here..."
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border dark:border-slate-800 flex items-center justify-between transition-colors duration-200">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Changes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full text-blue-600 dark:text-blue-400">
                  <AlertCircle size={24} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                   onClick={() => setFilterType(DiffType.ADDED)}>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Added</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">+{stats.added}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full text-green-600 dark:text-green-400">
                  <PlusCircle size={24} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                   onClick={() => setFilterType(DiffType.REMOVED)}>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Removed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">-{stats.removed}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full text-red-600 dark:text-red-400">
                  <MinusCircle size={24} />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-200"
                   onClick={() => setFilterType(DiffType.MODIFIED)}>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Modified</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">~{stats.modified}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-full text-yellow-600 dark:text-yellow-400">
                  <Edit3 size={24} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border dark:border-slate-800 transition-colors duration-200">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search rules..." 
                  className="w-full pl-10 pr-4 py-2 border dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mr-2">Filter:</span>
                {(['ALL', DiffType.ADDED, DiffType.REMOVED, DiffType.MODIFIED] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filterType === type 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border dark:border-slate-800 overflow-hidden transition-colors duration-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
                  <thead className="bg-gray-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Access</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Direction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dest Port</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          No changes found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((result, idx) => (
                        <tr 
                          key={`${result.rule.name}-${idx}`} 
                          className={`transition-colors cursor-pointer ${getRowStyle(result.type)}`}
                          onClick={() => result.type === DiffType.MODIFIED && setSelectedModification(result)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(result.type)}`}>
                              {result.type === DiffType.ADDED && <PlusCircle size={12} className="mr-1" />}
                              {result.type === DiffType.REMOVED && <MinusCircle size={12} className="mr-1" />}
                              {result.type === DiffType.MODIFIED && <Edit3 size={12} className="mr-1" />}
                              {result.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-mono">
                            {result.rule.priority}
                            {result.type === DiffType.MODIFIED && result.previousRule?.priority !== result.rule.priority && (
                              <span className="text-xs text-red-500 dark:text-red-400 ml-2 line-through">{result.previousRule?.priority}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {result.rule.name}
                            {result.type === DiffType.MODIFIED && (
                              <span className="ml-2 inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                Compare <ArrowRight size={10} className="ml-1" />
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              result.rule.access === 'Allow' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {result.rule.access}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {result.rule.direction}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {formatPort(result.rule.destination_port_ranges)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedModification && selectedModification.previousRule && (
          <ComparisonView 
            oldRule={selectedModification.previousRule}
            newRule={selectedModification.rule}
            onClose={() => setSelectedModification(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;