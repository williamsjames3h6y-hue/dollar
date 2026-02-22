import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, VIPTier } from '../lib/supabase';
import {
  Database,
  Zap,
  Shield,
  Users,
  Check,
  ArrowRight,
  Target,
  BarChart3,
  Sparkles,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { AuthForm } from './AuthForm';

export const LandingPage = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [tiers, setTiers] = useState<VIPTier[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const images = [
      '/logo.jpg',
      '/5.jpg',
      '/CHATGPT.webp',
      '/GOOGLE_GEMINI.png',
      '/GOOGLE.webp',
      '/SCALE_AI.png',
      '/6.jpg',
      '/7.jpg',
      '/8.jpg',
      '/9.jpg',
      '/2.jpg',
      '/3.jpg',
      '/4.jpg',
      '/1.jpg'
    ];

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    loadTiers();
    setIsVisible(true);
  }, []);

  const loadTiers = async () => {
    const { data } = await supabase
      .from('vip_tiers')
      .select('*')
      .order('level', { ascending: true });

    if (data) {
      setTiers(data);
    }
  };

  const features = [
    {
      icon: Database,
      title: 'Brand Identification Tasks',
      description: 'Identify brand names from images and earn commissions',
    },
    {
      icon: Zap,
      title: 'Quick Payouts',
      description: 'Earn commissions instantly with fast payment processing',
    },
    {
      icon: Users,
      title: 'VIP Membership Levels',
      description: 'Unlock higher weekly earnings and more tasks as you upgrade',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data and earnings are protected with advanced security',
    },
    {
      icon: Target,
      title: 'Daily Task Limits',
      description: 'Complete 35 to unlimited tasks daily based on your VIP level',
    },
    {
      icon: BarChart3,
      title: 'Earnings Dashboard',
      description: 'Track your earnings and performance in real-time',
    },
  ];

  const getTierColor = (level: number) => {
    const colors = [
      'from-gray-500 to-gray-600',
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-amber-500 to-amber-600',
      'from-rose-500 to-rose-600',
    ];
    return colors[level] || colors[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group">
              <img
                src="/logo.jpg"
                alt="EarningsLLC Logo"
                className="w-12 h-12 rounded-lg object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                EarningsLLC
              </span>
            </div>

            {!user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setIsLoginMode(true);
                    setShowAuth(true);
                  }}
                  className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-700 transition-all border border-emerald-500/30 hover:border-emerald-500 hover:scale-105"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setIsLoginMode(false);
                    setShowAuth(true);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
                >
                  Sign up
                </button>
              </div>
            ) : (
              <span className="text-emerald-400 font-medium">Welcome back!</span>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-20 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
              Earn Money With
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent block mt-2">
                Brand Identification Tasks
              </span>
            </h1>
            <p className="text-2xl text-slate-300 mb-12 leading-relaxed">
              Identify brand names from images and earn up to $5000+ per week with VIP 5.
              Start free, upgrade for higher weekly earnings and more tasks.
              Your path to earning starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-10 py-5 rounded-lg font-semibold hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 text-xl flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 group"
              >
                <span>Start Earning Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-slate-800 text-white px-10 py-5 rounded-lg font-semibold hover:bg-slate-700 transition-all duration-300 text-xl border border-emerald-500/30 hover:border-emerald-500 hover:scale-105">
                How It Works
              </button>
            </div>
          </div>
          <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl transform rotate-3 opacity-30 blur-sm"></div>
            <img
              src="/5.jpg"
              alt="AI Data Annotation"
              className="relative rounded-3xl shadow-2xl w-full hover:scale-105 transition-transform duration-500 border border-emerald-500/30"
              loading="eager"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.backgroundColor = '#1e293b';
              }}
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Trusted By Industry Leaders
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
            Partnering with the world's most innovative technology companies
          </p>

          <div className="relative overflow-hidden py-8">
            <div className="flex animate-scroll">
              <div className="flex space-x-12 items-center px-6">
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/CHATGPT.webp" alt="ChatGPT" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/GOOGLE_GEMINI.png" alt="Google Gemini" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/GOOGLE.webp" alt="Google" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/SCALE_AI.png" alt="Scale AI" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
              </div>
              <div className="flex space-x-12 items-center px-6">
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/CHATGPT.webp" alt="ChatGPT" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/GOOGLE_GEMINI.png" alt="Google Gemini" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/GOOGLE.webp" alt="Google" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
                <div className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-110 border border-emerald-500/20">
                  <img src="/SCALE_AI.png" alt="Scale AI" className="max-w-full max-h-full object-contain" loading="eager" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl group transform transition-all duration-1000 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <img
              src="/6.jpg"
              alt="Business Partnership"
              className="w-full h-80 object-cover transform group-hover:scale-110 transition-all duration-700 ease-out"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-white font-bold text-3xl mb-3 drop-shadow-lg">Trusted Partnerships</h3>
              <p className="text-gray-100 text-lg drop-shadow-md">Building lasting relationships with transparency</p>
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              Learn More
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-3xl shadow-2xl group transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <img
              src="/7.jpg"
              alt="Global Network"
              className="w-full h-80 object-cover transform group-hover:scale-110 transition-all duration-700 ease-out"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-white font-bold text-3xl mb-3 drop-shadow-lg">Global Network</h3>
              <p className="text-gray-100 text-lg drop-shadow-md">Connected worldwide for maximum opportunities</p>
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              Explore
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`relative overflow-hidden rounded-3xl shadow-2xl group transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <img
              src="/8.jpg"
              alt="Advanced Technology"
              className="w-full h-80 object-cover transform group-hover:scale-110 transition-all duration-700 ease-out"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-white font-bold text-3xl mb-3 drop-shadow-lg">Cutting-Edge Platform</h3>
              <p className="text-gray-100 text-lg drop-shadow-md">Powered by advanced AI and secure infrastructure</p>
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              View Tech
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-3xl shadow-2xl group transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <img
              src="/9.jpg"
              alt="Data Analytics"
              className="w-full h-80 object-cover transform group-hover:scale-110 transition-all duration-700 ease-out"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-white font-bold text-3xl mb-3 drop-shadow-lg">Smart Analytics</h3>
              <p className="text-gray-100 text-lg drop-shadow-md">Real-time insights and performance tracking</p>
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              See Data
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl group border border-emerald-500/20">
            <img
              src="/2.jpg"
              alt="Professional Workspace"
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">Simple Tasks</h3>
                <p className="text-slate-200 text-base drop-shadow-md">Easy data optimization jobs for everyone</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-2xl group border border-emerald-500/20">
            <img
              src="/3.jpg"
              alt="Data Analysis"
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-cyan-900/40 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">Daily Earnings</h3>
                <p className="text-slate-200 text-base drop-shadow-md">Get paid for completing tasks every day</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl shadow-2xl group border border-emerald-500/20">
            <img
              src="/4.jpg"
              alt="AI Technology"
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
              loading="eager"
              onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/40 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">VIP Levels</h3>
                <p className="text-slate-200 text-base drop-shadow-md">Higher tiers unlock better commissions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-800/50 py-20 relative overflow-hidden border-y border-emerald-500/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="/1.jpg"
                alt="Big Data Processing"
                className="rounded-2xl shadow-2xl w-full hover:shadow-3xl hover:scale-105 transition-all duration-500 border border-emerald-500/30"
                loading="eager"
                onError={(e) => (e.target as HTMLImageElement).style.backgroundColor = '#1e293b'}
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg">
                Start Earning Today
              </h2>
              <p className="text-2xl text-slate-300 mb-8 leading-relaxed">
                Join thousands of members earning daily commissions through brand identification tasks.
                Simple work, reliable income, and flexible schedules.
              </p>
              <ul className="space-y-5">
                <li className="flex items-start group">
                  <Check className="w-7 h-7 text-emerald-400 mr-4 flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-slate-200 text-xl group-hover:text-white transition-colors">Weekly earnings from $100+ to $5000+ based on VIP level</span>
                </li>
                <li className="flex items-start group">
                  <Check className="w-7 h-7 text-emerald-400 mr-4 flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-slate-200 text-xl group-hover:text-white transition-colors">Complete 35 to unlimited brand identification tasks per day</span>
                </li>
                <li className="flex items-start group">
                  <Check className="w-7 h-7 text-emerald-400 mr-4 flex-shrink-0 mt-1 group-hover:scale-125 transition-transform" />
                  <span className="text-slate-200 text-xl group-hover:text-white transition-colors">Fast payouts and secure platform</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Why Choose EarningsLLC
          </h2>
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
            Everything you need to start earning with brand identification tasks
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 border border-emerald-500/30 hover:border-emerald-500 hover:scale-105 group transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-emerald-500/30">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
              <p className="text-lg text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Job Description & Requirements
            </h2>
            <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
              Join our remote team and start earning today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-700/50 backdrop-blur rounded-2xl p-8 border border-slate-600">
              <h3 className="text-3xl font-bold text-blue-400 mb-6">Job Requirements</h3>
              <h4 className="text-2xl font-bold text-white mb-4">We are all 100% Remote</h4>
              <p className="text-slate-200 leading-relaxed text-lg mb-6">
                We are a remote-first company, and we want to work with people where working remotely is important to them for some reason. Maybe you want the freedom to build an exciting new career, or be there when your baby takes their first steps, or to move to a sunnier climate where you can surf and hike. We have got your back!
              </p>
              <h4 className="text-2xl font-bold text-white mb-4">Job Description: Growth Marketing Specialist</h4>
              <p className="text-slate-200 leading-relaxed text-lg">
                Our company is a leading B2B SaaS provider for the self-storage industry, serving clients in over 40 countries worldwide. Our company helps marketing businesses automate operations, streamline processes, and grow the business. As a fully remote company, our team is spread across multiple continents.
              </p>
            </div>

            <div className="bg-slate-700/50 backdrop-blur rounded-2xl p-8 border border-slate-600">
              <h3 className="text-3xl font-bold text-blue-400 mb-6">Job Salary</h3>
              <p className="text-slate-200 mb-6 text-lg font-semibold">Our salary structure is: daily commission income + base salary</p>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xl mb-3 text-emerald-400">A. Daily commission income:</h4>
                  <p className="text-slate-200 leading-relaxed mb-3">
                    For every set of promotion tasks completed, you will receive corresponding commission income. You must complete 2 sets of 38 app promotion projects [76] every day to withdraw all funds + commission income from your work account
                  </p>
                  <p className="text-slate-200 leading-relaxed">
                    You need to complete 2 sets of 38 brand rating tasks in your account every day, and then you can withdraw all funds + commission income from your work account.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xl mb-3 text-emerald-400">B. Basic salary:</h4>
                  <p className="text-slate-200 leading-relaxed mb-4">
                    Basic salary is paid according to different stages of consecutive work record days. Two sets of rating tasks need to be completed every day to fully record one work record day.
                  </p>
                  <ul className="space-y-2 text-slate-200">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Earn $750 for 5 consecutive days of work</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Earn $1550 for 14 consecutive days of work</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Earn $3000 for 30 consecutive days of work</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/50 backdrop-blur rounded-2xl p-8 border border-slate-600">
            <h3 className="text-3xl font-bold text-blue-400 mb-6">Earnings Structure</h3>
            <p className="text-slate-200 mb-6 text-lg">Earn money by identifying brand names from images</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600">
                <h4 className="font-bold text-2xl mb-4 text-emerald-400">A. Brand Identification Tasks</h4>
                <p className="text-slate-200 leading-relaxed">
                  Complete brand identification tasks daily based on your VIP level. VIP 1 members complete 35 tasks per day and earn approximately $75. Each task pays a variable amount. Complete all tasks to unlock withdrawals.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600">
                <h4 className="font-bold text-2xl mb-4 text-emerald-400">B. Weekly Earnings Limit</h4>
                <p className="text-slate-200 leading-relaxed">
                  Weekly earning limits increase with VIP level: VIP 1 earns $100+, VIP 2 earns $500+, VIP 3 earns $1000+, VIP 4 earns $2000+, and VIP 5 earns $5000+ per week. Upgrade for higher earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`text-center mb-16 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Choose Your VIP Level
          </h2>
          <p className="text-2xl text-slate-300 max-w-3xl mx-auto">
            Higher levels unlock better weekly earnings and more daily tasks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 group transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'} ${
                tier.level === 3 ? 'border-emerald-500 relative ring-2 ring-emerald-500/30' : 'border-emerald-500/30 hover:border-emerald-500'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {tier.level === 3 && (
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-3 text-sm font-semibold">
                  POPULAR
                </div>
              )}

              <div className="p-6">
                <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${getTierColor(tier.level)} text-white text-sm font-semibold mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {tier.name}
                </div>


                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {tier.commission_rate}%
                  </div>
                  <div className="text-sm text-slate-400">Commission Rate</div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">
                      {tier.max_tasks_per_day === 999999 ? 'Unlimited' : tier.max_tasks_per_day} tasks/day
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm font-semibold">
                      ${tier.weekly_earning_limit}+ per week
                    </span>
                  </li>
                  {tier.features.slice(0, 1).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setShowAuth(true)}
                  className={`w-full py-3 rounded-lg font-semibold text-base transition-all duration-300 ${
                    tier.level === 3
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105'
                      : 'bg-slate-700 text-white hover:bg-slate-600 border border-emerald-500/30 hover:border-emerald-500'
                  }`}
                >
                  {tier.level === 1 ? 'Start Free' : tier.requires_support_contact ? 'Contact Support' : 'Get Started'}
                </button>

                {tier.requires_support_contact && (
                  <p className="text-xs text-slate-400 text-center mt-2">
                    Requires support approval
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-300 rounded-full filter blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg">
            Ready to Start Earning?
          </h2>
          <p className="text-2xl text-white/90 mb-12 leading-relaxed drop-shadow-md">
            Join thousands of members already earning daily with brand identification tasks
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-white text-emerald-600 px-12 py-5 rounded-lg font-semibold hover:bg-slate-50 transition-all duration-300 text-xl inline-flex items-center space-x-2 hover:shadow-2xl hover:scale-105 group shadow-lg"
          >
            <span>Start Free with VIP 1</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/logo.jpg"
                  alt="EarningsLLC Logo"
                  className="w-14 h-14 rounded-lg object-cover shadow-lg"
                />
                <span className="text-2xl font-bold">EarningsLLC</span>
              </div>
              <p className="text-gray-400 text-base mb-6 leading-relaxed">
                Earn daily commissions through brand identification tasks
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-5">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-5">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">Press Kit</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-5">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Mail className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <a href="mailto:contact@earningsllc.online" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">
                    contact@earningsllc.online
                  </a>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <a href="tel:+1234567890" className="text-gray-400 hover:text-emerald-400 transition-colors text-base">
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-base">
                    123 AI Street, Tech Valley<br />San Francisco, CA 94105
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-500 text-sm">
                © 2025 EarningsLLC. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showAuth && (
        <AuthForm
          onClose={() => setShowAuth(false)}
          initialMode={isLoginMode ? 'login' : 'signup'}
        />
      )}
    </div>
  );
};
