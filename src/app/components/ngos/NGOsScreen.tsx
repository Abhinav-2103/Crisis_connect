import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { mockNGOs, mockVolunteers, mockNeeds } from '../../data/mockData';
import { Building2, MapPin, Phone, Mail, Users, AlertCircle, CalendarDays, Plus, X, CheckCircle2 } from 'lucide-react';

const ngoColors: Record<string, string> = {
  'ngo-1': '#a855f7',
  'ngo-2': '#3b82f6',
  'ngo-3': '#10b981',
  'ngo-4': '#f59e0b',
};

function NGORegistrationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (ngo: any) => void }) {
  const [form, setForm] = useState({ name: '', city: '', state: '', phone: '', email: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    const newNgo = {
      id: `ngo-${Date.now()}`,
      ...form,
      color: ['#e879f9', '#38bdf8', '#34d399', '#fb923c'][Math.floor(Math.random() * 4)],
      hq: { lat: 20.5937, lng: 78.9629 },
      established: new Date().getFullYear().toString(),
      volunteerCount: 0,
    };
    setSubmitting(false);
    onSuccess(newNgo);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-900 border border-white/20 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Register New NGO</h2>
            <p className="text-gray-400 text-sm mt-1">Expand the CrisisConnect network across India</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">NGO Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Disaster Relief India"
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">City *</label>
              <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="e.g., Hyderabad"
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">State *</label>
              <input required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                placeholder="e.g., Telangana"
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91-xx-xxxx-xxxx"
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="contact@ngo.org"
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Brief description of your NGO's focus areas..."
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registering...</>
            ) : (
              <><Plus className="w-5 h-5" /> Register NGO</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function NGOsScreen() {
  const [showModal, setShowModal] = useState(false);
  const [registeredNgos, setRegisteredNgos] = useState<any[]>([]);
  const [successNgo, setSuccessNgo] = useState<any>(null);
  const allNgos = [...mockNGOs, ...registeredNgos];

  const handleSuccess = (ngo: any) => {
    setRegisteredNgos(prev => [...prev, ngo]);
    setShowModal(false);
    setSuccessNgo(ngo);
    setTimeout(() => setSuccessNgo(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">NGO Management</h2>
          <p className="text-gray-400 text-sm mt-1">Organisations operating on CrisisConnect across India</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 text-sm"
        >
          <Plus className="w-5 h-5" />
          Register NGO
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successNgo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-green-500/20 border border-green-500/40 text-green-300"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium"><strong>{successNgo.name}</strong> has been registered successfully! It will appear on the map once volunteers are assigned.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total NGOs', value: allNgos.length, color: 'from-purple-500 to-blue-600', icon: Building2 },
          { label: 'Total Volunteers', value: mockVolunteers.length, color: 'from-green-500 to-emerald-600', icon: Users },
          { label: 'Active Needs', value: mockNeeds.filter(n => n.status !== 'resolved').length, color: 'from-orange-500 to-red-600', icon: AlertCircle },
          { label: 'Cities Covered', value: [...new Set(allNgos.map(n => n.city))].length, color: 'from-blue-500 to-cyan-600', icon: MapPin },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* NGO Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allNgos.map((ngo, index) => {
          const ngoVolunteers = mockVolunteers.filter(v => v.ngoId === ngo.id);
          const ngoNeeds = mockNeeds.filter(n => n.ngoId === ngo.id);
          const activeNeeds = ngoNeeds.filter(n => n.status !== 'resolved');
          const resolvedNeeds = ngoNeeds.filter(n => n.status === 'resolved');
          const color = ngoColors[ngo.id] || ngo.color || '#6366f1';

          return (
            <motion.div
              key={ngo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900/70 to-slate-900/90 border border-white/10 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              style={{ borderTopColor: color, borderTopWidth: '3px' }}
            >
              {/* NGO Header */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${color}80, ${color}30)`, border: `1px solid ${color}40` }}
                >
                  {ngo.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg leading-tight mb-1" style={{ color }}>{ngo.name}</h3>
                  <p className="text-gray-400 text-sm">{ngo.description || 'Disaster relief & community support'}</p>
                </div>
                {registeredNgos.find(r => r.id === ngo.id) && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30 flex-shrink-0">
                    New
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-5 p-4 rounded-xl bg-white/5 border border-white/8">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color }} />
                  <span>{ngo.city}, {ngo.state}</span>
                </div>
                {ngo.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span>{ngo.phone}</span>
                  </div>
                )}
                {ngo.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span>{ngo.email}</span>
                  </div>
                )}
                {ngo.established && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span>Est. {ngo.established}</span>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold" style={{ color }}>{ngoVolunteers.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Volunteers</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-orange-400">{activeNeeds.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Active Needs</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-bold text-green-400">{resolvedNeeds.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Resolved</p>
                </div>
              </div>

              {/* Coverage badge */}
              <div
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-4"
                style={{ background: color + '15', border: `1px solid ${color}30`, color }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }}></div>
                <span>Coverage radius: ~{Math.max(5, ngoVolunteers.length * 8)}km (based on {ngoVolunteers.length} volunteer{ngoVolunteers.length !== 1 ? 's' : ''})</span>
              </div>

              {/* Volunteer Avatars */}
              {ngoVolunteers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Active Volunteers</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {ngoVolunteers.slice(0, 5).map(v => (
                        <img
                          key={v.id}
                          src={v.avatar}
                          alt={v.name}
                          title={v.name}
                          className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                        />
                      ))}
                      {ngoVolunteers.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-white/10 flex items-center justify-center text-xs text-gray-300">
                          +{ngoVolunteers.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">{ngoVolunteers.filter(v => v.availability === 'available').length} available now</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <NGORegistrationModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
        )}
      </AnimatePresence>
    </div>
  );
}
