import { useState, useEffect } from 'react';
import { volunteersApi } from '../../utils/api';
import { mockVolunteers, mockNGOs } from '../../data/mockData';
import { Star, MapPin, Award, Calendar, Search, Filter, ChevronDown, Phone, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

const availabilityColors: Record<string, string> = {
  available: 'bg-green-500/20 text-green-300 border-green-500/30',
  busy: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  offline: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const availabilityDots: Record<string, string> = {
  available: 'bg-green-500',
  busy: 'bg-orange-500',
  offline: 'bg-gray-500',
};

// Small colored dot per NGO
const ngoColorMap: Record<string, string> = {
  'ngo-1': '#a855f7',
  'ngo-2': '#3b82f6',
  'ngo-3': '#10b981',
  'ngo-4': '#f59e0b',
};

export function VolunteersScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedNgo, setSelectedNgo] = useState<string>('all');
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const { volunteers: fetchedVolunteers } = await volunteersApi.getAll();
      // Use mock data if backend data is old (no ngoId field present)
      const hasIndianData = fetchedVolunteers?.length > 0 && fetchedVolunteers[0]?.ngoId;
      setVolunteers(hasIndianData ? fetchedVolunteers : mockVolunteers);
    } catch (error) {
      console.error('Failed to load volunteers:', error);
      setVolunteers(mockVolunteers);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (volunteer.skills || []).some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (volunteer.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAvailability = selectedAvailability === 'all' || volunteer.availability === selectedAvailability;
    const matchesNgo = selectedNgo === 'all' || volunteer.ngoId === selectedNgo;
    return matchesSearch && matchesAvailability && matchesNgo;
  });

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 relative min-w-[220px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search volunteers by name, skill, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm text-sm"
          />
        </div>

        {/* NGO Filter */}
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedNgo}
            onChange={(e) => setSelectedNgo(e.target.value)}
            className="appearance-none pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm cursor-pointer min-w-[200px] text-sm"
          >
            <option value="all">All NGOs</option>
            {mockNGOs.map(ngo => (
              <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Availability Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="appearance-none pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm cursor-pointer min-w-[180px] text-sm"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Volunteers', value: filteredVolunteers.length, color: 'from-blue-500 to-purple-600' },
          { label: 'Available Now', value: filteredVolunteers.filter(v => v.availability === 'available').length, color: 'from-green-500 to-emerald-600' },
          { label: 'Currently Busy', value: filteredVolunteers.filter(v => v.availability === 'busy').length, color: 'from-orange-500 to-yellow-600' },
          { label: 'Avg Rating', value: (filteredVolunteers.reduce((sum, v) => sum + (v.rating || 0), 0) / (filteredVolunteers.length || 1)).toFixed(1), color: 'from-purple-500 to-pink-600' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-semibold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Volunteers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVolunteers.map((volunteer, index) => {
            const ngoColor = ngoColorMap[volunteer.ngoId] || '#6366f1';
            return (
              <motion.div
                key={volunteer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                {/* NGO Tag */}
                {volunteer.ngoName && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      style={{ color: ngoColor, borderColor: ngoColor + '55', backgroundColor: ngoColor + '18' }}
                    >
                      <Building2 className="w-3 h-3" />
                      {volunteer.ngoName}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={volunteer.avatar}
                      alt={volunteer.name}
                      className="w-16 h-16 rounded-full border-2 object-cover"
                      style={{ borderColor: ngoColor + '66' }}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${availabilityDots[volunteer.availability]} rounded-full border-2 border-slate-900`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                      {volunteer.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${availabilityColors[volunteer.availability]}`}>
                      {volunteer.availability}
                    </span>
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{volunteer.rating}</span>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="text-sm text-gray-400">
                    <span className="text-white font-medium">{volunteer.totalHelps}</span> helps
                  </div>
                  {volunteer.phone && (
                    <>
                      <div className="w-px h-4 bg-white/10"></div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{volunteer.phone}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{volunteer.location}</span>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {(volunteer.skills || []).map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-lg border border-purple-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                {(volunteer.badges || []).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Badges</p>
                    <div className="flex flex-wrap gap-2">
                      {(volunteer.badges || []).map((badge: string) => (
                        <span key={badge} className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded-lg border border-blue-500/20">
                          <Award className="w-3 h-3" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Joined Date */}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {new Date(volunteer.joinedDate).toLocaleDateString('en-IN')}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500 hover:to-blue-600 border border-purple-500/30 rounded-lg transition-all duration-200 text-sm font-medium">
                    Contact
                  </button>
                  <button className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200 text-sm font-medium">
                    View Profile
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {filteredVolunteers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400">No volunteers found matching your filters</p>
        </div>
      )}
    </div>
  );
}