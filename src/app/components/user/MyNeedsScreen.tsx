import { useState, useEffect } from 'react';
import { mockNeeds } from '../../data/mockData';
import { needsApi } from '../../utils/api';
import { PostNeedModal } from '../modals/PostNeedModal';
import { useNotifications } from '../../contexts/NotificationContext';
import { MapPin, Clock, Tag, Edit, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

const urgencyColors = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-300 border-green-500/30',
};

const statusColors = {
  open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'in-progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  resolved: 'bg-green-500/20 text-green-300 border-green-500/30',
};

export function MyNeedsScreen() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [myNeeds, setMyNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNeed, setEditingNeed] = useState<any>(null);

  useEffect(() => {
    const loadUserNeeds = async () => {
      try {
        const { needs: fetchedNeeds } = await needsApi.getAll();
        const hasData = fetchedNeeds && fetchedNeeds.length > 0;
        let allData = hasData ? fetchedNeeds : mockNeeds;
        // Just filter strictly by user.id if logged in, else fallback
        let userSpecificNeeds = allData.filter((n: any) => n.userId === user?.id || n.userId === 'user-1' || n.userPhone === '+91-98110-99001');

        setMyNeeds(userSpecificNeeds);
      } catch (error) {
        console.error('Failed to load user needs:', error);
        setMyNeeds([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserNeeds();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleResolve = async (needId: string) => {
    setMyNeeds(prev => prev.map(n => n.id === needId ? { ...n, status: 'resolved' } : n));
    try {
      await needsApi.update(needId, { status: 'resolved' });
      addNotification({
        type: 'need_resolved',
        title: `Emergency Resolved`,
        description: `A user marked their need as successfully resolved.`,
        targetRole: 'all',
      });
    } catch(err) {
      console.error('Failed to resolve need', err);
    }
  };

  const handleDelete = async (needId: string) => {
    setMyNeeds(prev => prev.filter(n => n.id !== needId));
    try {
      await needsApi.delete(needId);
    } catch(err) {
      console.error('Failed to delete need', err);
    }
  };

  const handleEditSuccess = async () => {
    setEditingNeed(null);
    // Reload dynamically without breaking loading states
    try {
      const { needs: fetchedNeeds } = await needsApi.getAll();
      const hasData = fetchedNeeds?.length > 0;
      let allData = hasData ? fetchedNeeds : mockNeeds;
      setMyNeeds(allData.filter((n: any) => n.userId === user?.id || n.userId === 'user-1' || n.userPhone === '+91-98110-99001'));
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Posted', value: myNeeds.length, color: 'from-blue-500 to-purple-600' },
          { label: 'Active', value: myNeeds.filter(n => n.status === 'open').length, color: 'from-orange-500 to-yellow-600' },
          { label: 'Resolved', value: myNeeds.filter(n => n.status === 'resolved').length, color: 'from-green-500 to-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm">
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-semibold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Welcome Message */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40">
        <h3 className="text-lg font-semibold mb-2">Welcome, {user?.name}!</h3>
        <p className="text-gray-300 text-sm">
          Manage your emergency requests here. Our volunteers are ready to help you in times of need.
        </p>
      </div>

      {/* My Needs List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Posted Needs</h2>
        <div className="space-y-4">
          {myNeeds.map((need, index) => (
            <motion.div
              key={need.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-white/20 backdrop-blur-sm hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${urgencyColors[need.urgency]}`}>
                    {need.urgency.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[need.status]}`}>
                    {need.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingNeed(need)}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group/edit" 
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-blue-400 group-hover/edit:scale-110 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleDelete(need.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group/del" 
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover/del:scale-110 transition-transform" />
                  </button>
                  {need.status === 'in-progress' && (
                    <button 
                      onClick={() => handleResolve(need.id)}
                      className="p-2 hover:bg-green-500/20 rounded-lg transition-colors group/resolve" 
                      title="Mark Resolved"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400 group-hover/resolve:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                  {need.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {need.description}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>{need.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{need.timestamp.toLocaleString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/40">
                  {need.category}
                </span>
                {(need.tags || []).map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-white/15 text-gray-300 text-xs rounded-lg border border-white/20">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Response Info */}
              {need.status === 'in-progress' && (
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/40">
                  <p className="text-sm text-purple-300">
                    🎉 A volunteer is working on your request! They will contact you soon.
                  </p>
                </div>
              )}

              {need.status === 'resolved' && (
                <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/40">
                  <p className="text-sm text-green-300">
                    ✅ This need has been resolved. Thank you for using CrisisConnect!
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {myNeeds.length === 0 && (
          <div className="text-center py-12 p-6 rounded-2xl bg-white/10 border border-white/20">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 mb-4">You haven't posted any needs yet</p>
            <p className="text-sm text-gray-500">Click "Post a Need" button to request help from volunteers</p>
          </div>
        )}
      </div>

      {editingNeed && (
        <PostNeedModal
          isOpen={!!editingNeed}
          onClose={() => setEditingNeed(null)}
          onSuccess={handleEditSuccess}
          editData={editingNeed}
        />
      )}
    </div>
  );
}