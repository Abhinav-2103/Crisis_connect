import { useState } from 'react';
import { Bell, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setIsOpen(false);
    
    // Complex routing
    if (notif.type === 'query') {
      navigate('/chat');
      // Ideally we should inject actionData into the router state, but keeping it simple for the demo
    } else if (notif.type === 'need_posted' || notif.type === 'need_resolved') {
      navigate('/needs');
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">
                    You're all caught up!
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors flex gap-3 ${!notif.read ? 'bg-purple-900/10' : ''}`}
                      >
                        <div className={`mt-1 flex-shrink-0 ${!notif.read ? 'text-purple-400' : 'text-gray-500'}`}>
                          {notif.type === 'query' ? <HelpCircle className="w-5 h-5 text-blue-400" /> :
                           notif.type === 'need_resolved' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                           <Info className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm mb-1 ${!notif.read ? 'font-semibold text-white' : 'font-medium text-gray-300'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {notif.description}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-2">
                            {new Date(notif.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
