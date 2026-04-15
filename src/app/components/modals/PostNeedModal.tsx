import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { needsApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface PostNeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

export function PostNeedModal({ isOpen, onClose, onSuccess, editData }: PostNeedModalProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: editData?.title || '',
    location: editData?.location || '',
    description: editData?.description || '',
    urgency: editData?.urgency || 'medium',
    category: editData?.category || 'Medical',
    contact: editData?.contact || editData?.userPhone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to post a need');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      if (editData) {
        await needsApi.update(editData.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          urgency: formData.urgency,
          userPhone: formData.contact,
        });
      } else {
        await needsApi.create({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          urgency: formData.urgency,
          userId: user.id,
          userName: user.name,
          userPhone: formData.contact,
        });

        // Notify admins/all of a new emergency need
        addNotification({
          type: 'need_posted',
          title: `New Emergency Needs Help`,
          description: `${user.name} reported a ${formData.urgency} urgency ${formData.category} situation in ${formData.location}.`,
          targetRole: 'all',
        });
      }
      
      // Reset form
      setFormData({
        title: '',
        location: '',
        description: '',
        urgency: 'medium',
        category: 'Medical',
        contact: '',
      });
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to post need:', err);
      setError(err.message || 'Failed to post need. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editData ? 'Edit Request' : 'Post New Request'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of what you need"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Your address or landmark"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Category and Urgency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Medical">Medical</option>
                    <option value="Food">Food</option>
                    <option value="Water">Water</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Transport">Transport</option>
                    <option value="Rescue">Rescue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Urgency *</label>
                  <select
                    required
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide detailed information about your situation and what help you need"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium mb-2">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="+1 234-567-8900"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Your request will be visible to all volunteers in your area. Emergency services will be notified for critical situations.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 font-medium"
                >
                  {isSubmitting ? 'Processing...' : editData ? 'Save Changes' : 'Post Need'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}