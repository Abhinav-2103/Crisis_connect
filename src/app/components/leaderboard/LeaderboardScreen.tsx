import { useState, useEffect } from 'react';
import { analyticsApi } from '../../utils/api';
import { Trophy, Award, Medal, Crown } from 'lucide-react';
import { motion } from 'motion/react';

const rankColors = {
  1: 'from-yellow-500 to-amber-600',
  2: 'from-gray-400 to-gray-500',
  3: 'from-orange-500 to-orange-600',
};

const rankIcons = {
  1: Crown,
  2: Trophy,
  3: Medal,
};

export function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const { leaderboard: data } = await analyticsApi.getLeaderboard();
      // Add rank and additional fields to each entry
      const rankedData = data.map((entry: any, index: number) => ({
        ...entry,
        rank: index + 1,
        score: entry.points,
        helpsCompleted: entry.responsesCompleted,
        badges: entry.badge ? [entry.badge] : [],
      }));
      setLeaderboard(rankedData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Volunteer Leaderboard</h2>
        <p className="text-gray-400">Recognizing our top contributors this month</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {leaderboard.slice(0, 3).map((entry, index) => {
          const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons] || Trophy;
          const gradientColor = rankColors[entry.rank as keyof typeof rankColors];
          
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border-2 ${
                entry.rank === 1 ? 'border-yellow-500/50' :
                entry.rank === 2 ? 'border-gray-400/50' :
                'border-orange-500/50'
              } backdrop-blur-sm hover:scale-105 transition-transform duration-300 ${
                entry.rank === 2 ? 'md:order-first md:mt-8' :
                entry.rank === 3 ? 'md:order-last md:mt-8' : ''
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className={`w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center shadow-lg`}>
                  <RankIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="text-center mt-6">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className={`w-24 h-24 rounded-full object-cover border-4 ${
                      entry.rank === 1 ? 'border-yellow-500' :
                      entry.rank === 2 ? 'border-gray-400' :
                      'border-orange-500'
                    }`}
                  />
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r ${gradientColor} rounded-full text-xs font-semibold`}>
                    #{entry.rank}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold mb-2">{entry.name}</h3>

                {/* Score */}
                <div className="mb-4">
                  <p className={`text-3xl font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                    {entry.score}
                  </p>
                  <p className="text-xs text-gray-400">points</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mb-4 py-3 border-y border-white/10">
                  <div>
                    <p className="text-sm font-medium">{entry.helpsCompleted}</p>
                    <p className="text-xs text-gray-400">Helps</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {entry.badges.map((badge) => (
                    <span key={badge} className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded-lg border border-purple-500/20">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 via-purple-900/10 to-slate-900/60 border border-white/10 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4">Full Rankings</h3>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-200"
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg font-semibold ${
                entry.rank <= 3
                  ? `bg-gradient-to-br ${rankColors[entry.rank as keyof typeof rankColors]} text-white`
                  : 'bg-white/5 text-gray-400'
              }`}>
                #{entry.rank}
              </div>

              {/* Avatar */}
              <img
                src={entry.avatar}
                alt={entry.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
              />

              {/* Info */}
              <div className="flex-1">
                <h4 className="font-semibold">{entry.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {entry.badges.slice(0, 2).map((badge) => (
                    <span key={badge} className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded border border-blue-500/20">
                      <Award className="w-3 h-3" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {entry.score}
                </p>
                <p className="text-xs text-gray-400">{entry.helpsCompleted} helps</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Points Earned', value: '12,450', gradient: 'from-purple-500 to-pink-600' },
          { label: 'Active Volunteers', value: '234', gradient: 'from-blue-500 to-cyan-600' },
          { label: 'Total Helps Completed', value: '1,247', gradient: 'from-green-500 to-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
              {stat.value}
            </p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}