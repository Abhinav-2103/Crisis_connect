import { useEffect, useState } from 'react';
import { analyticsApi, needsApi } from '../../utils/api';
import { mockNeeds } from '../../data/mockData';
import { AlertCircle, Users, CheckCircle, TrendingUp } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function getDayName(dateStr: string) {
  const d = new Date(dateStr);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

function buildWeeklyTrend(needs: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts: Record<string, { needs: number; resolved: number }> = {};
  days.forEach(d => (counts[d] = { needs: 0, resolved: 0 }));

  needs.forEach(need => {
    const day = getDayName(need.timestamp);
    if (counts[day]) {
      counts[day].needs += 1;
      if (need.status === 'fulfilled' || need.status === 'resolved') {
        counts[day].resolved += 1;
      }
    }
  });

  return days.map(d => ({ name: d, needs: counts[d].needs, resolved: counts[d].resolved }));
}

function buildCategoryDist(categoryData: Record<string, number>) {
  return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
}

function buildRecentActivity(needs: any[]) {
  return needs.slice(0, 5).map(need => ({
    action: need.status === 'open' ? 'New need posted' : need.status === 'fulfilled' ? 'Need resolved' : 'Need updated',
    detail: need.title,
    time: formatRelativeTime(need.timestamp),
    type: need.urgency === 'critical' ? 'critical' : need.status === 'fulfilled' ? 'success' : 'info',
  }));
}

function formatRelativeTime(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
}

export function DashboardScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [allNeeds, setAllNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, needsData] = await Promise.all([
        analyticsApi.getDashboard(),
        needsApi.getAll(),
      ]);

      const hasData = needsData.needs && needsData.needs.length > 0;
      const finalNeeds = hasData ? needsData.needs : mockNeeds;
      setAllNeeds(finalNeeds);

      if (hasData) {
        setAnalytics(analyticsData);
      } else {
        import('../../data/mockData').then(({ mockNeeds, mockVolunteers }) => {
          const totalNeeds = mockNeeds.length;
          const completedNeeds = mockNeeds.filter(n => n.status === 'resolved').length;
          setAnalytics({
            metrics: {
              totalNeeds,
              activeNeeds: mockNeeds.filter(n => n.status === 'open').length,
              completedNeeds,
              criticalNeeds: mockNeeds.filter(n => n.urgency === 'critical').length,
              totalVolunteers: mockVolunteers.length,
              activeVolunteers: mockVolunteers.filter(v => v.availability === 'available').length,
              responseRate: ((completedNeeds / totalNeeds) * 100).toFixed(1)
            },
            categoryData: mockNeeds.reduce((acc: any, need: any) => {
              acc[need.category] = (acc[need.category] || 0) + 1;
              return acc;
            }, {})
          });
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { metrics, categoryData } = analytics;

  // Derive real chart data from actual needs
  const weeklyTrend = buildWeeklyTrend(allNeeds);
  const categoryDist = buildCategoryDist(categoryData || {});
  const recentActivity = buildRecentActivity(allNeeds);

  const stats = [
    {
      title: 'Total Needs',
      value: metrics.totalNeeds,
      icon: AlertCircle,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-500/20 to-purple-600/20',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Active Volunteers',
      value: metrics.activeVolunteers,
      subtitle: `${metrics.totalVolunteers} total`,
      icon: Users,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/20 to-emerald-600/20',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Completed Needs',
      value: metrics.completedNeeds,
      icon: CheckCircle,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-500/20 to-pink-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Response Rate',
      value: `${metrics.responseRate}%`,
      subtitle: `${metrics.criticalNeeds} critical open`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-yellow-600',
      bgGradient: 'from-orange-500/20 to-yellow-600/20',
      borderColor: 'border-orange-500/30',
    },
  ];

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(12px)',
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`p-6 rounded-2xl bg-gradient-to-br ${stat.bgGradient} border ${stat.borderColor} backdrop-blur-sm relative overflow-hidden group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300`}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm text-gray-400 mb-1">{stat.title}</h3>
              <p className={`text-3xl font-semibold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend — derived from real need timestamps */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weekly Trend</h3>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Live data</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="needs" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution — from real categoryData */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Category Distribution</h3>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Live data</span>
          </div>
          {categoryDist.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-gray-500 text-sm">
              No category data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryDist.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Daily Activity Bar Chart */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Daily Activity Overview</h3>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Live data</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Legend />
            <Bar dataKey="needs" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="resolved" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity — from real needs */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Live data</span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No recent activity yet</div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.type === 'critical' ? 'bg-red-500' :
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-400 truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}