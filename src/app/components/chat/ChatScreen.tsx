import { useState, useEffect, useRef, useCallback } from 'react';
import { chatApi, volunteersApi, needsApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { mockVolunteers, mockNeeds } from '../../data/mockData';
import { QueryModal } from '../modals/QueryModal';
import { useNotifications } from '../../contexts/NotificationContext';

// ─── Stable conversationId: sort both IDs so A↔B and B↔A share the same key ───
// IMPORTANT: must use '-' to match keys already stored in Supabase KV (e.g. chat:user-1-vol-1:msgId)
const makeConvId = (idA: string, idB: string) => [idA, idB].sort().join('-');

// ─── LocalStorage helpers for persistent message cache ───
const LS_KEY = (convId: string) => `cc_chat_v2_${convId}`; // v2 busts any stale '::' cache
const readCache = (convId: string): any[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY(convId)) || '[]'); } catch { return []; }
};
const writeCache = (convId: string, msgs: any[]) => {
  try { localStorage.setItem(LS_KEY(convId), JSON.stringify(msgs)); } catch {}
};
const mergeMessages = (existing: any[], incoming: any[]): any[] => {
  const map = new Map(existing.map(m => [m.id, m]));
  incoming.forEach(m => map.set(m.id, m));
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

export function ChatScreen() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  // ─── Load + poll messages whenever contact changes ───
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedContact || !user) return;

    // Seed from cache immediately so UI is never blank
    const convId = makeConvId(user.id, selectedContact.id);
    const cached = readCache(convId);
    if (cached.length > 0) setMessages(cached);

    // Fetch from backend and merge
    fetchAndMerge(convId);

    // Poll every 5 seconds for replies from the other party
    pollRef.current = setInterval(() => fetchAndMerge(convId), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedContact?.id]);

  const fetchAndMerge = useCallback(async (convId: string) => {
    try {
      const { messages: remote } = await chatApi.getMessages(convId);
      if (!remote) return;
      setMessages(prev => {
        const merged = mergeMessages(prev, remote);
        writeCache(convId, merged);
        return merged;
      });
    } catch {
      // Network error — keep existing local state, don't wipe it
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      
      // Fetch Volunteers
      const { volunteers } = await volunteersApi.getAll();
      const hasData = volunteers && volunteers.length > 0;
      let allVols = hasData ? volunteers : mockVolunteers;

      // Fetch Users (derived from active Needs + System Queries)
      let activeUsers: any[] = [];
      try {
        const { needs: fetchedNeeds } = await needsApi.getAll();
        const hasNeedsData = fetchedNeeds && fetchedNeeds.length > 0;
        const allNeeds = hasNeedsData ? fetchedNeeds : mockNeeds;
        const usersMap = new Map();
        
        // 1. Users from active Needs
        allNeeds.forEach((n: any) => {
          if (n.userId && n.userName && !usersMap.has(n.userId)) {
            usersMap.set(n.userId, {
              id: n.userId,
              name: n.userName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(n.userName)}&background=3b82f6&color=fff`,
              availability: 'user',
              skills: ['Seeking Help']
            });
          }
        });

        // 2. Users from Queries (if newly registered user without needs opened a ticket)
        notifications.forEach((notif) => {
          if (notif.type === 'query' && notif.actionData?.userId && !usersMap.has(notif.actionData.userId)) {
            usersMap.set(notif.actionData.userId, {
              id: notif.actionData.userId,
              name: notif.actionData.userName,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.actionData.userName)}&background=f59e0b&color=fff`,
              availability: 'user',
              skills: ['Submitted Query']
            });
          }
        });

        activeUsers = Array.from(usersMap.values());
      } catch (err) {
        // Safe fail
      }

      const systemAdmin = {
        id: 'sys-admin',
        name: 'System Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff',
        availability: 'available',
        skills: ['System Support', 'Coordination']
      };

      // Enforce isolation constraint: Users only chat with Volunteers, Volunteers only chat with Users. Admins chat with all.
      let allowedContacts: any[] = [];
      let includeAdmin = false;
      
      if (user?.role === 'user') {
        allowedContacts = [...allVols];
        // If this exact user opened a query, reveal the admin so they can converse
        const hasQuery = notifications.some(n => n.type === 'query' && n.actionData?.userId === user.id);
        includeAdmin = hasQuery; 
      } else if (user?.role === 'volunteer') {
        allowedContacts = [...activeUsers];
        includeAdmin = true;
      } else {
        allowedContacts = [...activeUsers, ...allVols];
        includeAdmin = true; // Admin sees everyone
      }

      // Filter out self so you don't chat with yourself
      const merged = includeAdmin ? [systemAdmin, ...allowedContacts] : [...allowedContacts];
      const finalContacts = merged.filter(v => v.id !== user?.id).slice(0, 30);
      
      setContacts(finalContacts);
      if (finalContacts.length > 0 && !selectedContact) {
        setSelectedContact(finalContacts[0]);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
      // Fallback aggressively
      const systemAdmin = {
        id: 'sys-admin',
        name: 'System Admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff',
        availability: 'available',
        skills: ['System Support', 'Coordination']
      };
      let fallbackContacts: any[] = [];
      if (user?.role === 'user') {
        fallbackContacts = [...mockVolunteers];
      } else if (user?.role === 'volunteer') {
        // Mock fallback for activeUsers could be extracted here, but let's just supply an empty array or basic mock if network is hard-down
        fallbackContacts = [];
      } else {
        fallbackContacts = [...mockVolunteers];
      }

      const finalContacts = [systemAdmin, ...fallbackContacts].filter(v => v.id !== user?.id).slice(0, 15);
      setContacts(finalContacts);
      if (!selectedContact && finalContacts.length > 0) {
        setSelectedContact(finalContacts[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    // Kept for backward compat but superseded by fetchAndMerge + polling above
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact || !user) return;

    const convId = makeConvId(user.id, selectedContact.id);
    const textEntry = newMessage.trim();
    setNewMessage('');

    // 1. Optimistic update — show instantly, persist to cache
    const tempMsg = {
      id: `local-${Date.now()}`,
      conversationId: convId,
      senderId: user.id,
      text: textEntry,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => {
      const next = mergeMessages(prev, [tempMsg]);
      writeCache(convId, next);
      return next;
    });

    try {
      // 2. Persist to backend
      const { message: saved } = await chatApi.sendMessage(convId, user.id, textEntry);
      if (saved) {
        // Replace the temp local message with the server-confirmed version
        setMessages(prev => {
          const without = prev.filter(m => m.id !== tempMsg.id);
          const next = mergeMessages(without, [saved]);
          writeCache(convId, next);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to send message via API — message stays in local cache:', error);
      // tempMsg is already in cache; nothing more to do
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
      {/* Contacts Sidebar */}
      <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user?.role === 'user' && (
            <div className="p-4 border-b border-white/5">
              <button 
                onClick={() => setIsQueryModalOpen(true)}
                className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 text-blue-400 font-medium transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">?</div>
                Contact Administration
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-2">Submit a secure query ticket to Sys Admin</p>
            </div>
          )}

          {contacts.map((volunteer) => (
            <div
              key={volunteer.id}
              onClick={() => setSelectedContact(volunteer)}
              className={`flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-colors border-l-2 ${
                volunteer.id === selectedContact?.id ? 'border-purple-500 bg-white/5' : 'border-transparent'
              }`}
            >
              <div className="relative">
                <img
                  src={volunteer.avatar}
                  alt={volunteer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 ${
                  volunteer.availability === 'available' ? 'bg-green-500' :
                  volunteer.availability === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
                } rounded-full border-2 border-slate-900`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{volunteer.name}</p>
                <p className="text-xs text-gray-400 truncate">{volunteer.skills[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedContact?.avatar}
                alt={selectedContact?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${
                selectedContact?.availability === 'available' ? 'bg-green-500' :
                selectedContact?.availability === 'busy' ? 'bg-orange-500' : 'bg-gray-500'
              } rounded-full border-2 border-slate-900`}></div>
            </div>
            <div>
              <h3 className="font-semibold">{selectedContact?.name}</h3>
              <p className="text-xs text-gray-400 capitalize">{selectedContact?.availability}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">No messages yet. Start a conversation!</p>
            </div>
          )}
          {messages.map((message) => {
            const isCurrentUser = message.senderId === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  {!isCurrentUser && (
                    <p className="text-xs text-gray-400 mb-1 px-4">{selectedContact?.name}</p>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-4">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              onClick={handleSend}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <QueryModal 
        isOpen={isQueryModalOpen} 
        onClose={() => setIsQueryModalOpen(false)} 
      />
    </div>
  );
}