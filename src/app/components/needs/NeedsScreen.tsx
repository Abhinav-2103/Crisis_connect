import { useState, useEffect } from 'react';
import { needsApi } from '../../utils/api';
import { mockNeeds, mockNGOs } from '../../data/mockData';
import { MapPin, Clock, Tag, Search, Filter, ChevronDown, Heart, Building2, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

const urgencyColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-300 border-green-500/30',
};

const urgencyBorderColors: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

const categoryIcons: Record<string, string> = {
  Medical: '🏥',
  Food: '🍱',
  Water: '💧',
  Shelter: '🏕️',
  Transport: '🚐',
  Rescue: '🆘',
};

const ngoColorMap: Record<string, string> = {
  'ngo-1': '#a855f7',
  'ngo-2': '#3b82f6',
  'ngo-3': '#10b981',
  'ngo-4': '#f59e0b',
};

function timeAgo(date: Date | string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NeedsScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNgo, setSelectedNgo] = useState<string>('all');
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNeeds();
  }, [selectedCategory]);

  const loadNeeds = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      const { needs: fetchedNeeds } = await needsApi.getAll(filters);
      // Ensure we don't hide new user-posted needs. If we fetch data, use it.
      const hasData = fetchedNeeds?.length > 0;
      setNeeds(hasData ? fetchedNeeds : mockNeeds);
    } catch (error) {
      console.error('Failed to load needs:', error);
      setNeeds(mockNeeds);
    } finally {
      setLoading(false);
    }
  };

  const handleHelp = async (need: any) => {
    try {
      // Optimistic update
      setNeeds(prev => prev.map(n => n.id === need.id ? { ...n, status: 'in-progress' } : n));
      await needsApi.update(need.id, { status: 'in-progress' });
    } catch (error) {
      console.error('Failed to accept need:', error);
      loadNeeds(); // reload on error
    }
  };

  const filteredNeeds = needs.filter(need => {
    const matchesSearch =
      need.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      need.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (need.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = selectedUrgency === 'all' || need.urgency === selectedUrgency;
    const matchesNgo = selectedNgo === 'all' || need.ngoId === selectedNgo;
    return matchesSearch && matchesUrgency && matchesNgo;
  });

  const isVolunteer = user?.role === 'volunteer';

  return (
    <div className="space-y-6">
      {/* Volunteer Banner */}
      {isVolunteer && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40">
          <h3 className="text-lg font-semibold mb-2">Available Needs - Make a Difference Today! 💪</h3>
          <p className="text-gray-300 text-sm">
            Browse emergency requests from people across India. Coordinate with your NGO to respond fast.
          </p>
        </div>
      )}

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 relative min-w-[220px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm text-sm"
          />
        </div>

        {/* NGO Filter */}
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedNgo}
            onChange={(e) => setSelectedNgo(e.target.value)}
            className="appearance-none pl-12 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm cursor-pointer min-w-[200px] text-sm"
          >
            <option value="all">All NGOs</option>
            {mockNGOs.map(ngo => (
              <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Urgency Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="appearance-none pl-12 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm cursor-pointer min-w-[150px] text-sm"
          >
            <option value="all">All Urgency</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none px-4 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm cursor-pointer min-w-[150px] text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Medical">🏥 Medical</option>
            <option value="Food">🍱 Food</option>
            <option value="Water">💧 Water</option>
            <option value="Shelter">🏕️ Shelter</option>
            <option value="Transport">🚐 Transport</option>
            <option value="Rescue">🆘 Rescue</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Needs', value: filteredNeeds.length, color: 'from-blue-500 to-purple-600' },
          { label: 'Critical', value: filteredNeeds.filter(n => n.urgency === 'critical').length, color: 'from-red-500 to-orange-600' },
          { label: 'High Priority', value: filteredNeeds.filter(n => n.urgency === 'high').length, color: 'from-orange-500 to-yellow-600' },
          { label: 'Resolved', value: needs.filter(n => n.status === 'resolved').length, color: 'from-green-500 to-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-semibold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Needs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNeeds.map((need, index) => {
            const ngoColor = ngoColorMap[need.ngoId] || '#6366f1';
            return (
              <motion.div
                key={need.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`group p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-white/15 border-l-4 ${urgencyBorderColors[need.urgency]} backdrop-blur-sm hover:border-r-purple-500/40 hover:shadow-xl hover:shadow-purple-500/15 transition-all duration-300`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urgencyColors[need.urgency]}`}>
                      {need.urgency.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/40">
                      {categoryIcons[need.category]} {need.category}
                    </span>
                    {need.status === 'in-progress' && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 animate-pulse">
                        In Progress
                      </span>
                    )}
                    {need.status === 'resolved' && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                        ✓ Resolved
                      </span>
                    )}
                  </div>
                </div>

                {/* NGO Tag */}
                {need.ngoName && (
                  <div className="mb-3">
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border w-fit"
                      style={{ color: ngoColor, borderColor: ngoColor + '55', backgroundColor: ngoColor + '18' }}
                    >
                      <Building2 className="w-3 h-3" />
                      {need.ngoName}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-300 transition-colors leading-snug">
                  {need.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                  {need.description}
                </p>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>{need.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>{timeAgo(need.timestamp)}</span>
                    </div>
                    {need.contact && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs">{need.contact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(need.tags || []).slice(0, 3).map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-lg border border-white/15">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleHelp(need)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-500/30 to-blue-500/30 hover:from-purple-500 hover:to-blue-600 border border-purple-500/40 rounded-xl transition-all duration-200 font-medium group-hover:shadow-lg group-hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-sm"
                  disabled={need.status === 'resolved' || need.status === 'in-progress'}
                  style={{ opacity: need.status === 'resolved' ? 0.5 : 1 }}
                >
                  <Heart className="w-4 h-4" />
                  {need.status === 'resolved' ? 'Need Resolved' : need.status === 'in-progress' ? 'In Progress' : isVolunteer ? 'I Can Help' : 'View Details'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredNeeds.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">No needs found matching your filters</p>
        </div>
      )}
    </div>
  );
}