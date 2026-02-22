import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, CheckCircle, TrendingUp, Package, UserCheck } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalEarnings: number;
  tasksCompleted: number;
  activeUsers: number;
  totalProducts: number;
  adminUsers: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEarnings: 0,
    tasksCompleted: 0,
    activeUsers: 0,
    totalProducts: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, []);

  const loadStats = async () => {
    setLoading(true);

    const [usersData, walletsData, submissionsData, productsData, adminData] = await Promise.all([
      supabase.rpc('get_all_users'),
      supabase.from('wallets').select('balance'),
      supabase.from('brand_task_submissions').select('id, status'),
      supabase.from('products').select('id'),
      supabase.from('admin_users').select('id')
    ]);

    const totalUsers = usersData.data?.length || 0;
    const totalEarnings = walletsData.data?.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0) || 0;
    const tasksCompleted = submissionsData.data?.filter(s => s.status === 'completed').length || 0;
    const totalProducts = productsData.data?.length || 0;
    const adminUsers = adminData.data?.length || 0;

    const activeUsersCount = usersData.data?.filter((u: any) => {
      const lastSignIn = new Date(u.last_sign_in_at);
      const daysSinceLastSignIn = (Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastSignIn <= 7;
    }).length || 0;

    setStats({
      totalUsers,
      totalEarnings,
      tasksCompleted,
      activeUsers: activeUsersCount,
      totalProducts,
      adminUsers
    });

    setLoading(false);
  };

  const loadRecentActivity = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('id, amount, description, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setRecentActivity(data);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Active Users (7d)',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-cyan-500',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/30'
    },
    {
      title: 'Tasks Completed',
      value: stats.tasksCompleted,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30'
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-500/30'
    }
  ];

  if (loading) {
    return <div className="text-white text-center py-8">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-slate-400">Monitor your platform's key metrics and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-6 hover:scale-105 transition-transform`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{activity.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold">+${activity.amount}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
}
