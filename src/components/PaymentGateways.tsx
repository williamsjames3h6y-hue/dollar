import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, CreditCard, Wallet, Building, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  config: any;
  fees: any;
  min_amount: number;
  max_amount: number;
  supported_currencies: string[];
  instructions: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentGateways() {
  const { user } = useAuth();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'card',
    is_active: true,
    config: {},
    fees: { fixed: 0, percentage: 0 },
    min_amount: 10,
    max_amount: 10000,
    supported_currencies: ['USD'],
    instructions: ''
  });

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setGateways(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingGateway) {
      const { error } = await supabase
        .from('payment_gateways')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', editingGateway.id);

      if (!error) {
        alert('Payment gateway updated successfully');
        resetForm();
        loadGateways();
      } else {
        alert('Failed to update payment gateway');
      }
    } else {
      const { error } = await supabase
        .from('payment_gateways')
        .insert({
          ...formData,
          updated_by: user?.id
        });

      if (!error) {
        alert('Payment gateway created successfully');
        resetForm();
        loadGateways();
      } else {
        alert('Failed to create payment gateway');
      }
    }
  };

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    setFormData({
      name: gateway.name,
      type: gateway.type,
      is_active: gateway.is_active,
      config: gateway.config,
      fees: gateway.fees,
      min_amount: gateway.min_amount,
      max_amount: gateway.max_amount,
      supported_currencies: gateway.supported_currencies,
      instructions: gateway.instructions
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return;

    const { error } = await supabase
      .from('payment_gateways')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Payment gateway deleted successfully');
      loadGateways();
    } else {
      alert('Failed to delete payment gateway');
    }
  };

  const toggleActive = async (gateway: PaymentGateway) => {
    const { error } = await supabase
      .from('payment_gateways')
      .update({
        is_active: !gateway.is_active,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      })
      .eq('id', gateway.id);

    if (!error) {
      loadGateways();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'card',
      is_active: true,
      config: {},
      fees: { fixed: 0, percentage: 0 },
      min_amount: 10,
      max_amount: 10000,
      supported_currencies: ['USD'],
      instructions: ''
    });
    setEditingGateway(null);
    setShowModal(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'crypto': return Wallet;
      case 'bank': return Building;
      case 'mobile_money': return Smartphone;
      case 'card': return CreditCard;
      default: return CreditCard;
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading payment gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payment Gateways</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Gateway</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gateways.map((gateway) => {
          const Icon = getIcon(gateway.type);
          return (
            <div
              key={gateway.id}
              className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${gateway.is_active ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-600/50 border border-slate-500/30'}`}>
                    <Icon className={`w-6 h-6 ${gateway.is_active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{gateway.name}</h3>
                    <span className="text-xs text-slate-400 uppercase">{gateway.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(gateway)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all ${
                    gateway.is_active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-600/50 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {gateway.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span className="text-sm font-semibold">{gateway.is_active ? 'Active' : 'Inactive'}</span>
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Fees:</span>
                  <span className="text-white font-semibold">
                    ${gateway.fees.fixed} + {gateway.fees.percentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Limits:</span>
                  <span className="text-white font-semibold">
                    ${gateway.min_amount} - ${gateway.max_amount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Currencies:</span>
                  <span className="text-emerald-400 font-semibold">
                    {gateway.supported_currencies.join(', ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{gateway.instructions}</p>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(gateway)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 py-2 rounded-lg transition-colors border border-blue-500/30"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="font-semibold">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(gateway.id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 py-2 rounded-lg transition-colors border border-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-semibold">Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {gateways.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No payment gateways configured yet.</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingGateway ? 'Edit Payment Gateway' : 'Add New Payment Gateway'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Gateway Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="card">Card Payment</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Fixed Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees.fixed}
                    onChange={(e) => setFormData({ ...formData, fees: { ...formData.fees, fixed: parseFloat(e.target.value) }})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Percentage Fee (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fees.percentage}
                    onChange={(e) => setFormData({ ...formData, fees: { ...formData.fees, percentage: parseFloat(e.target.value) }})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Min Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Max Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Enter instructions for users..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-300">
                  Gateway is active and available
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingGateway ? 'Update Gateway' : 'Create Gateway'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
