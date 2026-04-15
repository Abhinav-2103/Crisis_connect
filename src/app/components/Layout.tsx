import { Link, Outlet, useLocation } from 'react-router';
import { Map, AlertCircle, Users, LayoutDashboard, MessageCircle, Trophy, Plus, Bell, User, LogOut, FileText, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PostNeedModal } from './modals/PostNeedModal';
import { NotificationDropdown } from './notifications/NotificationDropdown';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';

// Navigation items with role-based access
const getNavigationForRole = (role: string) => {
  const allNavigation = [
    { name: 'Map', path: '/', icon: Map, roles: ['admin', 'volunteer', 'user'] },
    { name: 'Needs', path: '/needs', icon: AlertCircle, roles: ['admin', 'volunteer'] },
    { name: 'My Needs', path: '/my-needs', icon: FileText, roles: ['user'] },
    { name: 'Volunteers', path: '/volunteers', icon: Users, roles: ['admin', 'volunteer', 'user'] },
    { name: 'NGOs', path: '/ngos', icon: Building2, roles: ['admin'] },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'My Stats', path: '/my-stats', icon: LayoutDashboard, roles: ['volunteer'] },
    { name: 'Chat', path: '/chat', icon: MessageCircle, roles: ['admin', 'volunteer', 'user'] },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, roles: ['admin', 'volunteer'] },
  ];

  return allNavigation.filter(item => item.roles.includes(role));
};

export function Layout() {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsRefreshKey, setNeedsRefreshKey] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  const navigation = getNavigationForRole(user?.role || 'user');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNeedPosted = () => {
    // Trigger refresh of needs data
    setNeedsRefreshKey(prev => prev + 1);
  };

  // Only users can post needs
  const canPostNeed = user?.role === 'user' || user?.role === 'admin';

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-white/20 backdrop-blur-xl bg-slate-900/80 z-10 flex flex-col">
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">CrisisConnect</h1>
              <p className="text-xs text-purple-300">Emergency Response</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-2 min-h-0">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/40 to-blue-500/40 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 flex-shrink-0 space-y-3">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-white/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>

          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40">
            <p className="text-sm text-gray-300 mb-2">
              {user?.role === 'volunteer' ? 'Help people in need' : 
               user?.role === 'user' ? 'Get help quickly' : 
               'Coordinate emergency response'}
            </p>
            <p className="text-xs text-gray-400">Connect with {user?.role === 'user' ? 'volunteers' : 'people'} in your area instantly.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-20 border-b border-white/20 backdrop-blur-xl bg-slate-900/80">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                {location.pathname === '/ngos' ? 'NGO Management' : navigation.find((item) => item.path === location.pathname)?.name || 'CrisisConnect'}
              </h2>
              <p className="text-sm text-gray-400">
                {location.pathname === '/ngos' ? 'Organisations operating across India' :
                 user?.role === 'admin' ? 'Real-time emergency coordination' :
                 user?.role === 'volunteer' ? 'Help people in your community' :
                 'Request help during emergencies'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {canPostNeed && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Post a Need
                </button>
              )}

              <NotificationDropdown />

              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <span className="px-2 py-0.5 text-xs bg-purple-500/30 text-purple-300 rounded-full border border-purple-500/50 capitalize">
                      {user?.role || 'User'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>

      <PostNeedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleNeedPosted} />
    </div>
  );
}