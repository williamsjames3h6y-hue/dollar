import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, UserCog, Crown, Shield, Trash2, Ban, CheckCircle, DollarSign, Plus, Minus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

interface VIPTier {
  id: string;
  user_id: string;
  level: number;
  name: string;
  commission_rate: number;
}

interface Wallet {
  id: string;
  balance: number;
}

interface AdminUser {
  user_id: string;
  role: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [vipTiers, setVipTiers] = useState<Record<string, VIPTier>>({});
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});
  const [adminUsers, setAdminUsers] = useState<Record<string, AdminUser>>({});
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'super_admin' | 'moderator'>('admin');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    const { data: usersData, error } = await supabase.rpc('get_all_users');

    if (!error && usersData) {
      setUsers(usersData);

      const userIds = usersData.map((u: User) => u.id);

      const { data: vipData } = await supabase
        .from('vip_tiers')
        .select('*')
        .in('user_id', userIds);

      if (vipData) {
        const vipMap: Record<string, VIPTier> = {};
        vipData.forEach((vip) => {
          vipMap[vip.user_id] = vip;
        });
        setVipTiers(vipMap);
      }

      const { data: walletData } = await supabase
        .from('wallets')
        .select('id, user_id, balance')
        .in('user_id', userIds);

      if (walletData) {
        const walletMap: Record<string, Wallet> = {};
        walletData.forEach((wallet) => {
          walletMap[wallet.user_id] = { id: wallet.id, balance: wallet.balance };
        });
        setWallets(walletMap);
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('user_id, role')
        .in('user_id', userIds);

      if (adminData) {
        const adminMap: Record<string, AdminUser> = {};
        adminData.forEach((admin) => {
          adminMap[admin.user_id] = admin;
        });
        setAdminUsers(adminMap);
      }
    }

    setLoading(false);
  };

  const handleMakeAdmin = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: selectedUser.id,
        role: selectedRole,
        permissions: []
      });

    if (!error) {
      alert(`User has been granted ${selectedRole} privileges`);
      setShowAdminModal(false);
      setSelectedUser(null);
      loadUsers();
    } else {
      alert('Failed to grant admin privileges');
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) return;

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (!error) {
      alert('Admin privileges removed');
      loadUsers();
    } else {
      alert('Failed to remove admin privileges');
    }
  };

  const handleBalanceChange = async () => {
    if (!selectedUser || !balanceAmount) return;

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const wallet = wallets[selectedUser.id];
    if (!wallet) {
      alert('User wallet not found');
      return;
    }

    let newBalance = wallet.balance;
    if (balanceAction === 'add') {
      newBalance += amount;
    } else {
      newBalance -= amount;
      if (newBalance < 0) {
        alert('Insufficient balance');
        return;
      }
    }

    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (!walletError) {
      await supabase.from('transactions').insert({
        user_id: selectedUser.id,
        wallet_id: wallet.id,
        type: balanceAction === 'add' ? 'deposit' : 'withdraw',
        amount: amount,
        status: 'completed',
        description: `Admin ${balanceAction === 'add' ? 'added' : 'deducted'} balance`
      });

      alert(`Balance ${balanceAction === 'add' ? 'added' : 'deducted'} successfully`);
      setShowBalanceModal(false);
      setSelectedUser(null);
      setBalanceAmount('');
      loadUsers();
    } else {
      alert('Failed to update balance');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-white text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="text-sm text-slate-400">
          Total Users: <span className="text-emerald-400 font-semibold">{users.length}</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="bg-slate-700/30 rounded-lg overflow-hidden border border-slate-600">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">VIP Tier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-white">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {vipTiers[user.id] ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {vipTiers[user.id].name}
                      </span>
                    ) : (
                      <span className="text-slate-400">No Tier</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                    ${wallets[user.id]?.balance?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {adminUsers[user.id] ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {adminUsers[user.id].role === 'super_admin' && <Crown className="w-3 h-3" />}
                        {adminUsers[user.id].role === 'admin' && <Shield className="w-3 h-3" />}
                        {adminUsers[user.id].role === 'moderator' && <UserCog className="w-3 h-3" />}
                        <span>{adminUsers[user.id].role.replace('_', ' ')}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBalanceModal(true);
                        }}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                        title="Manage Balance"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      {adminUsers[user.id] ? (
                        <button
                          onClick={() => handleRemoveAdmin(user.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/30"
                          title="Remove Admin"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAdminModal(true);
                          }}
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/30"
                          title="Make Admin"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Grant Admin Privileges</h3>
            <p className="text-slate-300 mb-4">
              Grant admin privileges to: <span className="text-emerald-400 font-semibold">{selectedUser?.email}</span>
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="text-emerald-500"
                />
                <div>
                  <div className="text-white font-semibold">Admin</div>
                  <div className="text-xs text-slate-400">Can manage users and products</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="moderator"
                  checked={selectedRole === 'moderator'}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="text-emerald-500"
                />
                <div>
                  <div className="text-white font-semibold">Moderator</div>
                  <div className="text-xs text-slate-400">Can view and moderate content</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="role"
                  value="super_admin"
                  checked={selectedRole === 'super_admin'}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="text-emerald-500"
                />
                <div>
                  <div className="text-white font-semibold">Super Admin</div>
                  <div className="text-xs text-slate-400">Full access to all features</div>
                </div>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleMakeAdmin}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all"
              >
                Grant Access
              </button>
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Manage User Balance</h3>
            <p className="text-slate-300 mb-4">
              User: <span className="text-emerald-400 font-semibold">{selectedUser?.email}</span>
            </p>
            <p className="text-slate-300 mb-6">
              Current Balance: <span className="text-emerald-400 font-bold text-lg">${wallets[selectedUser?.id || '']?.balance?.toFixed(2) || '0.00'}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Action</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setBalanceAction('add')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-all ${
                      balanceAction === 'add'
                        ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Balance</span>
                  </button>
                  <button
                    onClick={() => setBalanceAction('subtract')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-all ${
                      balanceAction === 'subtract'
                        ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    <Minus className="w-5 h-5" />
                    <span>Subtract Balance</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBalanceChange}
                className={`flex-1 font-semibold py-3 rounded-lg transition-all ${
                  balanceAction === 'add'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
              >
                {balanceAction === 'add' ? 'Add Balance' : 'Subtract Balance'}
              </button>
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedUser(null);
                  setBalanceAmount('');
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
