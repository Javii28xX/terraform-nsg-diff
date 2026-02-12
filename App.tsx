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
  ShieldAlert
} from 'lucide-react';

function App() {
  const [logInput, setLogInput] = useState(SAMPLE_LOG);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DiffType | 'ALL'>('ALL');
  const [selectedModification, setSelectedModification] = useState<DiffResult | null>(null);

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
      case DiffType.ADDED: return 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-500';
      case DiffType.REMOVED: return 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500 opacity-75';
      case DiffType.MODIFIED: return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-l-yellow-500';
      default: return 'bg-white';
    }
  };

  const getBadgeStyle = (type: DiffType) => {
    switch (type) {
      case DiffType.ADDED: return 'bg-green-100 text-green-800';
      case DiffType.REMOVED: return 'bg-red-100 text-red-800';
      case DiffType.MODIFIED: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPort = (ranges?: string[]) => {
    if (!ranges || ranges.length === 0) return '*';
    return ranges.join(', ');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Terraform Plan Visualizer</h1>
          </div>
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard size={16} /> Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'input' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
               <div className="flex items-center gap-2">
                <FileText size={16} /> Logs Input
              </div>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'input' ? (
          <div className="bg-white rounded-xl shadow-sm border p-6 h-[calc(100vh-10rem)] flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Paste Terraform Output</h2>
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-600"
              placeholder="Paste your terraform plan output here..."
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Changes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <AlertCircle size={24} />
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer hover:border-green-300 transition"
                   onClick={() => setFilterType(DiffType.ADDED)}>
                <div>
                  <p className="text-sm font-medium text-gray-500">Added</p>
                  <p className="text-2xl font-bold text-green-600">+{stats.added}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full text-green-600">
                  <PlusCircle size={24} />
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer hover:border-red-300 transition"
                   onClick={() => setFilterType(DiffType.REMOVED)}>
                <div>
                  <p className="text-sm font-medium text-gray-500">Removed</p>
                  <p className="text-2xl font-bold text-red-600">-{stats.removed}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-full text-red-600">
                  <MinusCircle size={24} />
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border flex items-center justify-between cursor-pointer hover:border-yellow-300 transition"
                   onClick={() => setFilterType(DiffType.MODIFIED)}>
                <div>
                  <p className="text-sm font-medium text-gray-500">Modified</p>
                  <p className="text-2xl font-bold text-yellow-600">~{stats.modified}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
                  <Edit3 size={24} />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search rules..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium mr-2">Filter:</span>
                {(['ALL', DiffType.ADDED, DiffType.REMOVED, DiffType.MODIFIED] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filterType === type 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dest Port</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {result.rule.priority}
                            {result.type === DiffType.MODIFIED && result.previousRule?.priority !== result.rule.priority && (
                              <span className="text-xs text-red-500 ml-2 line-through">{result.previousRule?.priority}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {result.rule.name}
                            {result.type === DiffType.MODIFIED && (
                              <span className="ml-2 inline-flex items-center text-xs text-blue-600 hover:underline">
                                Compare <ArrowRight size={10} className="ml-1" />
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${result.rule.access === 'Allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {result.rule.access}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {result.rule.direction}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
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