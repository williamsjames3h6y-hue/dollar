import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  wallet_address: string;
  network: string;
  address: string;
  is_verified: boolean;
}

interface PaymentMethodsPageProps {
  onBack: () => void;
}

export const PaymentMethodsPage = ({ onBack }: PaymentMethodsPageProps) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [wallet, setWallet] = useState('');
  const [network, setNetwork] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPaymentMethod();
  }, [user]);

  const loadPaymentMethod = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPaymentMethod(data);
      setWallet(data.wallet_address || '');
      setNetwork(data.network || '');
      setAddress(data.address || '');
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    if (!wallet.trim() || !network.trim() || !address.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('payment_methods')
        .upsert({
          user_id: user.id,
          wallet_address: wallet.trim(),
          network: network.trim(),
          address: address.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Payment method updated successfully!' });
      loadPaymentMethod();
    } catch (error) {
      console.error('Error updating payment method:', error);
      setMessage({ type: 'error', text: 'Failed to update payment method' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-white p-2 hover:bg-slate-700 rounded-lg transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">
              Dear user, please fill in your TRC-20/ERC-20 address. Please do not enter your bank account detail and password.
            </p>
          </div>
        </div>

        {message && (
          <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border mb-6 flex items-center space-x-3 ${
            message.type === 'success'
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-red-500/50 bg-red-500/10'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Wallet
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="Wallet"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Network
              </label>
              <input
                type="text"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="Network"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>

        {paymentMethod && paymentMethod.wallet_address && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Current Payment Method</h3>
                <p className="text-gray-400 text-sm">Configured and ready</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-700/30 rounded-xl p-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">Wallet</p>
                <p className="text-white font-mono text-sm break-all">{paymentMethod.wallet_address}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Network</p>
                <p className="text-white font-mono text-sm">{paymentMethod.network}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">Address</p>
                <p className="text-white font-mono text-sm break-all">{paymentMethod.address}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
