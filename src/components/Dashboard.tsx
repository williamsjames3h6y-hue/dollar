import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project } from '../lib/supabase';
import {
  LogOut,
  Crown,
  Wallet,
  DollarSign,
  Shield,
  Headphones,
  Award,
  HelpCircle,
  Info,
  Home,
  ShoppingCart,
  FileText,
  Menu,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard
} from 'lucide-react';
import { AnnotationWorkspace } from './AnnotationWorkspace';
import { BrandIdentificationTask } from './BrandIdentificationTask';
import { PaymentMethodsPage } from './PaymentMethodsPage';

interface WalletData {
  id: string;
  balance: number;
  total_earnings: number;
  can_withdraw: boolean;
}

interface DailyEarning {
  date: string;
  tasks_completed: number;
  commission_earned: number;
  base_salary: number;
  total_earnings: number;
  can_withdraw: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export const Dashboard = () => {
  const { user, profile, vipTier, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showBrandTasks, setShowBrandTasks] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPreloader, setShowPreloader] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletChoice, setShowWalletChoice] = useState(false);
  const [walletAction, setWalletAction] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);

  const heroImages = [
    '/AI.jpg',
    '/AI2.jpg',
    '/AI3.jpg',
    '/AI4.jpg',
    '/AI5.jpg'
  ];

  useEffect(() => {
    heroImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const initDashboard = async () => {
      try {
        await Promise.all([
          loadProjects(),
          loadWallet(),
          loadDailyEarnings(),
          checkAdminStatus(),
          loadTransactions()
        ]);
      } catch (err) {
        console.error('Error initializing dashboard:', err);
      }
    };

    initDashboard();

    const intervalId = setInterval(() => {
      loadWallet();
      loadDailyEarnings();
      loadTransactions();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(imageInterval);
  }, []);

  const loadProjects = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setProjects(data);
    }
  };

  const loadWallet = async () => {
    if (!user) return;

    let { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 0
        })
        .select()
        .maybeSingle();

      data = newWallet;
    }

    if (data) {
      setWallet(data);
    }
  };

  const loadDailyEarnings = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_earnings')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      setDailyEarnings(data);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const loadTransactions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setTransactions(data);
    }
  };

  const handleCustomerSupport = () => {
    alert('Customer Support\n\nEmail: support@earningsllc.com\nPhone: +1 (555) 123-4567\n\nOur team is available 24/7 to assist you.');
  };

  const handleStartTasks = () => {
    setShowPreloader(true);
    setTimeout(() => {
      setShowPreloader(false);
      setShowBrandTasks(true);
    }, 3000);
  };

  const handleWalletClick = () => {
    setShowWalletChoice(true);
  };

  const handleWithdrawClick = () => {
    if (wallet?.can_withdraw) {
      setShowWalletChoice(false);
      setWalletAction('withdraw');
      setShowWalletModal(true);
    } else {
      alert('Complete your daily tasks to unlock withdrawal privileges.');
    }
  };

  const handleDepositClick = () => {
    setShowWalletChoice(false);
    setWalletAction('deposit');
    setShowWalletModal(true);
  };

  const handleWalletSubmit = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const numAmount = parseFloat(amount);

    if (walletAction === 'withdraw') {
      if (numAmount > (wallet?.total_earnings || 0)) {
        alert('Insufficient balance');
        return;
      }
    }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: walletAction === 'deposit' ? 'deposit' : 'withdrawal',
      amount: numAmount,
      status: 'pending',
      description: walletAction === 'deposit'
        ? `Deposit of $${numAmount.toFixed(2)}`
        : `Withdrawal of $${numAmount.toFixed(2)}`
    });

    if (error) {
      alert('Transaction failed. Please try again.');
      return;
    }

    if (walletAction === 'withdraw') {
      await supabase
        .from('wallets')
        .update({
          total_earnings: (wallet?.total_earnings || 0) - numAmount
        })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('wallets')
        .update({
          total_earnings: (wallet?.total_earnings || 0) + numAmount
        })
        .eq('user_id', user.id);
    }

    setShowWalletModal(false);
    setAmount('');
    setWalletAction(null);
    loadWallet();
    loadTransactions();
    alert(`${walletAction === 'deposit' ? 'Deposit' : 'Withdrawal'} request submitted successfully!`);
  };

  if (showPreloader) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-green-500 rounded-lg animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-lg animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showPaymentMethods) {
    return <PaymentMethodsPage onBack={() => setShowPaymentMethods(false)} />;
  }

  if (showBrandTasks) {
    return (
      <BrandIdentificationTask
        onBack={() => setShowBrandTasks(false)}
      />
    );
  }

  if (selectedProject) {
    return (
      <AnnotationWorkspace
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-white font-semibold">Personal</span>
            </div>

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-white p-2 hover:bg-slate-700 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {showMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute right-0 top-16 bg-slate-800 rounded-lg shadow-2xl m-4 p-4 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowMenu(false);
                signOut();
              }}
              className="w-full flex items-center space-x-2 text-white hover:bg-slate-700 p-3 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  window.location.href = '/admin';
                }}
                className="w-full flex items-center space-x-2 text-white hover:bg-slate-700 p-3 rounded-lg transition-all mt-2"
              >
                <Shield className="w-5 h-5" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-3xl shadow-2xl overflow-hidden mb-6 group">
          <div className="relative h-80 overflow-hidden bg-slate-800">
            {heroImages.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  index === currentImageIndex
                    ? 'opacity-100 translate-x-0 z-10'
                    : index < currentImageIndex
                    ? 'opacity-0 -translate-x-full z-0'
                    : 'opacity-0 translate-x-full z-0'
                }`}
              >
                <img
                  src={image}
                  alt={`AI Automation ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error(`Failed to load image: ${image}`);
                    target.style.backgroundColor = '#1e293b';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              </div>
            ))}

            <button
              onClick={() => setCurrentImageIndex((currentImageIndex - 1 + heroImages.length) % heroImages.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentImageIndex((currentImageIndex + 1) % heroImages.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="flex justify-center space-x-2 mb-4">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white/40 hover:bg-white/60 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-slide-fade">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            Welcome, {profile?.full_name || 'User'}
            <div className="ml-3 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center animate-pulse-glow">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </h2>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-8">
          <button
            onClick={handleCustomerSupport}
            className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 hover:bg-slate-700/50 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-2 group-hover:animate-float">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">Customer Care</span>
          </button>

          <button className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 hover:bg-slate-700/50 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center mb-2">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">Certificate</span>
          </button>

          <button
            onClick={() => setShowPaymentMethods(true)}
            className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 hover:bg-slate-700/50 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '0.25s' }}
          >
            <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center mb-2">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">Payment Method</span>
          </button>

          <button
            onClick={() => setShowFAQ(true)}
            className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 hover:bg-slate-700/50 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mb-2">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">FAQ</span>
          </button>

          <button
            onClick={() => setShowAboutUs(true)}
            className="flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 hover:bg-slate-700/50 hover:scale-105 hover:shadow-xl transition-all duration-300 animate-slide-up"
            style={{ animationDelay: '0.35s' }}
          >
            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center mb-2">
              <Info className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">About Us</span>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Membership Level</h3>
            <button className="text-blue-400 text-sm hover:text-blue-300">View More</button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 min-w-fit">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{vipTier?.name}</h4>
                  <p className="text-gray-400 text-xs">{vipTier?.max_tasks_per_day} Tasks</p>
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs px-3 py-1 rounded-full bg-green-600/20 text-green-400">
                  Active
                </span>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 min-w-fit opacity-50">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">VIP 2</h4>
                  <p className="text-gray-400 text-xs">50 Tasks</p>
                </div>
              </div>
              <button
                onClick={handleCustomerSupport}
                className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
              >
                Unlock
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 min-w-fit opacity-50">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">VIP 3</h4>
                  <p className="text-gray-400 text-xs">75 Tasks</p>
                </div>
              </div>
              <button
                onClick={handleCustomerSupport}
                className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
              >
                Unlock
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 min-w-fit opacity-50">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">VIP 4</h4>
                  <p className="text-gray-400 text-xs">100 Tasks</p>
                </div>
              </div>
              <button
                onClick={handleCustomerSupport}
                className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
              >
                Unlock
              </button>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700 min-w-fit opacity-50">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">VIP 5</h4>
                  <p className="text-gray-400 text-xs">150 Tasks</p>
                </div>
              </div>
              <button
                onClick={handleCustomerSupport}
                className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-all text-xs"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 mb-6 animate-zoom-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-shimmer"></div>
          <div className="text-center relative z-10">
            <h3 className="text-white text-2xl font-bold mb-4 animate-slide-fade">Ready to Start Earning?</h3>
            <p className="text-blue-100 mb-2">Current Balance</p>
            <p className="text-5xl font-bold text-white mb-6 animate-pulse">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-blue-100 text-sm mb-1">Today's Earnings</p>
                <p className="text-2xl font-bold text-white">
                  ${dailyEarnings?.total_earnings?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <p className="text-blue-100 text-sm mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold text-white">
                  {dailyEarnings?.tasks_completed || 0} / {vipTier?.max_tasks_per_day}
                </p>
              </div>
            </div>
            <button
              onClick={handleStartTasks}
              className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              Start Working on Tasks
            </button>

            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 mt-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <p className="text-gray-200 text-sm text-center leading-relaxed">
                Dear user, please note that our platform operates 24/7 with automated task distribution. Complete your daily tasks to unlock withdrawal privileges.
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 py-4 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around items-center">
            <button className="flex flex-col items-center text-blue-400">
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={handleStartTasks}
              className="flex flex-col items-center text-gray-400 hover:text-white transition-all"
            >
              <ShoppingCart className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Start</span>
            </button>
            <button
              onClick={handleWalletClick}
              className="flex flex-col items-center text-gray-400 hover:text-white transition-all"
            >
              <Wallet className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Wallet</span>
            </button>
            <button
              onClick={() => setShowRecords(true)}
              className="flex flex-col items-center text-gray-400 hover:text-white transition-all"
            >
              <FileText className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Record</span>
            </button>
          </div>
        </div>
      </nav>

      {showRecords && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Transaction Records</h2>
              <button
                onClick={() => setShowRecords(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:bg-slate-700/70 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              transaction.type === 'earnings'
                                ? 'bg-green-600'
                                : transaction.type === 'withdrawal'
                                ? 'bg-red-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            {transaction.type === 'earnings' ? (
                              <ArrowDownLeft className="w-5 h-5 text-white" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-sm">
                              {transaction.type === 'earnings'
                                ? 'Earnings'
                                : transaction.type === 'withdrawal'
                                ? 'Withdrawal'
                                : 'Deposit'}
                            </h4>
                            <p className="text-gray-400 text-xs mt-1">
                              {transaction.description}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              transaction.type === 'earnings'
                                ? 'text-green-400'
                                : transaction.type === 'withdrawal'
                                ? 'text-red-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {transaction.type === 'withdrawal' ? '-' : '+'}$
                            {transaction.amount.toFixed(2)}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === 'completed'
                                ? 'bg-green-600/20 text-green-400'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-600/20 text-yellow-400'
                                : 'bg-red-600/20 text-red-400'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {showWalletChoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Wallet Options</h2>
              <p className="text-gray-400">Choose an action</p>
            </div>

            <div className="space-y-4 mb-6">
              <button
                onClick={handleDepositClick}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-between group"
              >
                <span className="text-lg">Deposit Funds</span>
                <ArrowDownLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={handleWithdrawClick}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-between group"
              >
                <span className="text-lg">Withdraw Funds</span>
                <ArrowUpRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setShowWalletChoice(false);
                  setShowPaymentMethods(true);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-between group"
              >
                <span className="text-lg">Payment Method</span>
                <CreditCard className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <button
              onClick={() => setShowWalletChoice(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {walletAction === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
              </h2>
              <p className="text-gray-400">
                {walletAction === 'deposit'
                  ? 'Add funds to your wallet'
                  : 'Withdraw your earnings'}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-12 py-4 text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {walletAction === 'withdraw' && (
                <p className="text-sm text-gray-400 mt-2">
                  Available balance: ${wallet?.total_earnings?.toFixed(2) || '0.00'}
                </p>
              )}
            </div>

            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Transaction Fee</span>
                <span className="text-white font-semibold">$0.00</span>
              </div>
              <div className="border-t border-white/5 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-semibold">Total Amount</span>
                <span className="text-white text-xl font-bold">
                  ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setAmount('');
                  setWalletAction(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleWalletSubmit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
              >
                {walletAction === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFAQ && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-3xl w-full border border-white/10 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-12 h-12 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
              </div>
              <button
                onClick={() => setShowFAQ(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">1</span>
                  Deposit Guide
                </h3>
                <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                  <p>
                    Click the "Online Customer Support" button and provide your username or registered mobile phone number to apply for a deposit address. After deposit using the address provided by customer support, please submit a screenshot of the successful deposit so that we can verify the payment with online customer support.
                  </p>
                  <p>
                    To ensure fast deposit, please ensure that the remittance address and amount match those provided by customer support. If you encounter any problems during the deposit process that you cannot resolve, please contact customer support promptly.
                  </p>
                  <p>
                    Due to the large amount of information, please confirm your deposit wallet address with customer support again before deposit. Our company may change cryptocurrency deposit addresses from time to time.
                  </p>
                  <p>
                    Our company will launch a series of promotional activities from time to time. We remind users to choose the most suitable deposit method according to their own circumstances to avoid serious consequences. If you have any questions, please click on online customer support for consultation!
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 text-sm">2</span>
                  How to Upload Data
                </h3>
                <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                  <p>
                    After recharging, you can begin uploading your application. Go to the "Upload Now" page, click the "Upload Now" button, wait for the system to receive your application, and submit your data when the data submission pop-up appears. You will receive a corresponding rebate for every 100% of the data completed.
                  </p>
                  <p>
                    When users perform application data optimization tasks, the platform will provide real transaction records of the data generated by the system's AI to ensure that the uploaded data after optimization is authentic, valid, and legal.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Ordinary task receive a 0.5% rebate for each completed application.</li>
                    <li>Premium task receive a 10%-20% rebate.</li>
                    <li>All applications cannot be cancelled or redeemed.</li>
                  </ul>
                  <p>
                    After completing the task, your account balance will be fully refunded. You can withdraw your earnings after completing the daily task.
                  </p>
                  <p>
                    The platform will randomly assign application data as daily tasks based on your VIP level and account activity.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFAQ(false)}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAboutUs && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-5xl w-full border border-white/10 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-orange-600 to-red-600 w-12 h-12 rounded-full flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">About Us</h2>
              </div>
              <button
                onClick={() => setShowAboutUs(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-blue-400 mb-4">Job Requirements</h3>
                  <h4 className="text-xl font-bold text-white mb-3">We are all 100% Remote</h4>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    We are a remote-first company, and we want to work with people where working remotely is important to them for some reason. Maybe you want the freedom to build an exciting new career, or be there when your baby takes their first steps, or to move to a sunnier climate where you can surf and hike. We have got your back!
                  </p>
                  <h4 className="text-xl font-bold text-white mb-3">Job Description: Growth Marketing Specialist</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Our company is a leading B2B SaaS provider for the self-storage industry, serving clients in over 40 countries worldwide. Our company helps marketing businesses automate operations, streamline processes, and grow the business. As a fully remote company, our team is spread across multiple continents.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-2xl font-bold text-blue-400 mb-4">Job Salary</h3>
                  <p className="text-gray-300 mb-4 font-semibold">Our salary structure is: daily commission income + base salary</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-emerald-400">A. Daily commission income:</h4>
                      <p className="text-gray-300 leading-relaxed text-sm mb-2">
                        For every set of promotion tasks completed, you will receive corresponding commission income. You must complete 2 sets of 38 app promotion projects [76] every day to withdraw all funds + commission income from your work account
                      </p>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        You need to complete 2 sets of 38 brand rating tasks in your account every day, and then you can withdraw all funds + commission income from your work account.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-lg mb-2 text-emerald-400">B. Basic salary:</h4>
                      <p className="text-gray-300 leading-relaxed text-sm mb-3">
                        Basic salary is paid according to different stages of consecutive work record days. Two sets of rating tasks need to be completed every day to fully record one work record day.
                      </p>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-start">
                          <span className="mr-2 text-emerald-400">•</span>
                          <span>Earn $750 for 5 consecutive days of work</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-emerald-400">•</span>
                          <span>Earn $1550 for 14 consecutive days of work</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 text-emerald-400">•</span>
                          <span>Earn $3000 for 30 consecutive days of work</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Earnings Structure</h3>
                <p className="text-gray-300 mb-4">Earn money by identifying brand names from images</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-700/50 rounded-xl p-5 border border-white/5">
                    <h4 className="font-bold text-xl mb-3 text-emerald-400">A. Brand Identification Tasks</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Complete brand identification tasks daily based on your VIP level. VIP 1 members complete 35 tasks per day and earn approximately $75. Each task pays a variable amount. Complete all tasks to unlock withdrawals.
                    </p>
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-5 border border-white/5">
                    <h4 className="font-bold text-xl mb-3 text-emerald-400">B. Weekly Earnings Limit</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Weekly earning limits increase with VIP level: VIP 1 earns $100+, VIP 2 earns $500+, VIP 3 earns $1000+, VIP 4 earns $2000+, and VIP 5 earns $5000+ per week. Upgrade for higher earnings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAboutUs(false)}
              className="w-full mt-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
