import { useAuth } from '../../contexts/AuthContext';
import { Award, TrendingUp, Clock, Star, Target, Heart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

const weeklyActivity = [
  { day: 'Mon', helps: 3 },
  { day: 'Tue', helps: 5 },
  { day: 'Wed', helps: 2 },
  { day: 'Thu', helps: 7 },
  { day: 'Fri', helps: 4 },
  { day: 'Sat', helps: 6 },
  { day: 'Sun', helps: 8 },
];

const categoryBreakdown = [
  { category: 'Medical', count: 15 },
  { category: 'Food', count: 12 },
  { category: 'Water', count: 8 },
  { category: 'Shelter', count: 6 },
  { category: 'Transport', count: 10 },
  { category: 'Rescue', count: 5 },
];

export function MyStatsScreen() {
  const { user } = useAuth();

  const volunteerStats = {
    totalHelps: 127,
    thisWeek: 35,
    rating: 4.9,
    rank: 5,
    badges: ['Top Responder', 'Medical Professional', 'Quick Helper'],
    responseTime: '12 min',
    totalHours: 245,
  };

  const stats = [
    {
      title: 'Total Helps',
      value: volunteerStats.totalHelps,
      icon: Heart,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'This Week',
      value: volunteerStats.thisWeek,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/20 to-cyan-600/20',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Average Rating',
      value: volunteerStats.rating,
      icon: Star,
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-500/20 to-orange-600/20',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Leaderboard Rank',
      value: `#${volunteerStats.rank}`,
      icon: Target,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/40">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Welcome back, {user?.name}! 👋</h2>
            <p className="text-gray-300">
              You're making a real difference in your community. Keep up the amazing work!
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 rounded-xl">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm">Avg Response: {volunteerStats.responseTime}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} backdrop-blur-sm relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300`}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm text-gray-400 mb-2">{stat.title}</h3>
              <p className={`text-3xl font-semibold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-white/20 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Your Badges
        </h3>
        <div className="flex flex-wrap gap-3">
          {volunteerStats.badges.map((badge) => (
            <div
              key={badge}
              className="px-4 py-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/50 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">{badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-white/20 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                }}
              />
              <Line
                type="monotone"
                dataKey="helps"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-white/20 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Help by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-white/20 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Helps</h3>
        <div className="space-y-3">
          {[
            { title: 'Medical Emergency - Insulin', date: '2 hours ago', status: 'Completed', category: 'Medical' },
            { title: 'Family Needs Drinking Water', date: '5 hours ago', status: 'Completed', category: 'Water' },
            { title: 'Transport to Hospital', date: '1 day ago', status: 'Completed', category: 'Transport' },
            { title: 'Food Supplies for Camp', date: '2 days ago', status: 'Completed', category: 'Food' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/40">
                  {activity.category}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/40">
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-2">
            {volunteerStats.totalHours}
          </p>
          <p className="text-sm text-gray-400">Total Volunteer Hours</p>
        </div>
        <div className="p-6 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent mb-2">
            89%
          </p>
          <p className="text-sm text-gray-400">Success Rate</p>
        </div>
        <div className="p-6 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
            156
          </p>
          <p className="text-sm text-gray-400">People Helped</p>
        </div>
      </div>
    </div>
  );
}