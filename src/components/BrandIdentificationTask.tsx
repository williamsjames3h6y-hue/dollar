import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface AdminTask {
  id: string;
  task_order: number;
  vip_level_required: number;
  image_url: string;
  brand_name: string;
  earning_amount: number;
}

interface ProductImage {
  id: string;
  image_url: string;
  brand_name: string;
  product_name: string | null;
  price: number | null;
}

interface UserSubmission {
  id: string;
  task_id: string;
  status: string;
  completed_at: string;
}

interface BrandIdentificationTaskProps {
  onBack: () => void;
}

export const BrandIdentificationTask = ({ onBack }: BrandIdentificationTaskProps) => {
  const { user, vipTier } = useAuth();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState({ completed: 0, total: 0, earnings: 0 });
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [user, vipTier]);

  useEffect(() => {
    if (currentTaskIndex > 0) {
      setShowPreloader(true);
      setTimeout(() => {
        setShowPreloader(false);
      }, 3000);
    }
  }, [currentTaskIndex]);

  const loadTasks = async () => {
    if (!user || !vipTier) return;

    setIsLoading(true);

    const { data: productImagesData } = await supabase
      .from('product_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    const { data: tasksData } = await supabase
      .from('admin_tasks')
      .select('*')
      .eq('vip_level_required', vipTier.level)
      .order('task_order', { ascending: true });

    if (tasksData && productImagesData) {
      setProductImages(productImagesData);
      const updatedTasks = tasksData.map((task, index) => {
        const productImage = productImagesData[index % productImagesData.length];
        return {
          ...task,
          image_url: productImage?.image_url || task.image_url,
          brand_name: productImage?.brand_name || task.brand_name
        };
      });

      setTasks(updatedTasks);
      setDailyStats(prev => ({ ...prev, total: updatedTasks.length }));

      const today = new Date().toISOString().split('T')[0];
      const { data: submissionsData } = await supabase
        .from('user_task_submissions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today);

      if (submissionsData) {
        setSubmissions(submissionsData);
        const completed = submissionsData.filter(s => s.status === 'completed').length;
        const totalEarnings = submissionsData.reduce((sum, s) => {
          const task = updatedTasks.find(t => t.id === s.task_id);
          return sum + (task?.earning_amount || 0);
        }, 0);

        setDailyStats(prev => ({ ...prev, completed, earnings: totalEarnings }));

        const nextIncompleteIndex = updatedTasks.findIndex(
          task => !submissionsData.some(sub => sub.task_id === task.id)
        );
        if (nextIncompleteIndex !== -1) {
          setCurrentTaskIndex(nextIncompleteIndex);
        }
      }
    }

    setIsLoading(false);
  };

  const handleSubmitTask = async () => {
    if (!user || !currentTask) return;

    setIsSubmitting(true);

    const { data: existingSubmission } = await supabase
      .from('user_task_submissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('task_id', currentTask.id)
      .maybeSingle();

    if (existingSubmission) {
      alert('You have already completed this task');
      setIsSubmitting(false);
      return;
    }

    const { error: submissionError } = await supabase
      .from('user_task_submissions')
      .insert({
        user_id: user.id,
        task_id: currentTask.id,
        user_answer: {},
        status: 'completed',
        completed_at: new Date().toISOString()
      });

    if (!submissionError) {
      let { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!walletData) {
        const { data: newWallet } = await supabase
          .from('wallets')
          .insert({
            user_id: user.id,
            balance: 0
          })
          .select()
          .single();

        walletData = newWallet;
      }

      if (walletData) {
        await supabase
          .from('wallets')
          .update({
            balance: walletData.balance + currentTask.earning_amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', walletData.id);

        await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: walletData.id,
          type: 'earnings',
          amount: currentTask.earning_amount,
          status: 'completed',
          description: `Brand identification task #${currentTask.task_order} completed`
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: dailyEarning } = await supabase
        .from('daily_earnings')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (dailyEarning) {
        const newTasksCompleted = dailyEarning.tasks_completed + 1;
        const newCommissionEarned = dailyEarning.commission_earned + currentTask.earning_amount;
        const newTotalEarnings = dailyEarning.total_earnings + currentTask.earning_amount;

        await supabase
          .from('daily_earnings')
          .update({
            tasks_completed: newTasksCompleted,
            commission_earned: newCommissionEarned,
            total_earnings: newTotalEarnings,
            can_withdraw: newTasksCompleted >= 35
          })
          .eq('id', dailyEarning.id);
      } else {
        await supabase.from('daily_earnings').insert({
          user_id: user.id,
          date: today,
          tasks_completed: 1,
          commission_earned: currentTask.earning_amount,
          total_earnings: currentTask.earning_amount,
          can_withdraw: false
        });
      }

      loadTasks();

      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
      } else {
        alert('Congratulations! You have completed all tasks for today. Contact support to continue.');
      }
    } else {
      alert('Failed to submit task. Please try again.');
    }

    setIsSubmitting(false);
  };

  const currentTask = tasks[currentTaskIndex];
  const currentProduct = productImages[currentTaskIndex % productImages.length];
  const isTaskCompleted = currentTask && submissions.some(s => s.task_id === currentTask.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-white text-xl font-semibold">Loading Tasks...</p>
        </div>
      </div>
    );
  }

  if (!vipTier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (dailyStats.completed >= dailyStats.total && dailyStats.total > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-sm shadow-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-blue-400"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-4">All Tasks Completed!</h2>
          <p className="text-xl text-gray-300 mb-4">
            You've completed all {dailyStats.total} tasks for today
          </p>
          <p className="text-lg text-gray-200 mb-8">
            Total Earnings: <span className="font-bold text-green-400">${dailyStats.earnings.toFixed(2)}</span>
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-slate-800/50 backdrop-blur-sm shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-blue-400"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Tasks Completed</p>
                <p className="text-xl font-bold text-white">
                  {dailyStats.completed} / {dailyStats.total}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Earnings Today</p>
                <p className="text-xl font-bold text-green-400">
                  ${dailyStats.earnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showPreloader ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-slate-700 min-h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-white text-2xl font-bold mb-2">Loading Next Task</p>
              <p className="text-gray-400">Preparing your next product...</p>
            </div>
          </div>
        ) : currentTask ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Task {currentTask.task_order}
              </h2>
            </div>

            <div className="mb-8">
              <div className="bg-white rounded-2xl p-6 flex items-center justify-center min-h-[280px]">
                <img
                  src={currentTask.image_url}
                  alt={currentTask.brand_name}
                  className="max-w-full max-h-[250px] object-contain rounded-lg"
                />
              </div>

              {currentProduct && (
                <div className="mt-6 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{currentProduct.brand_name}</h3>
                  {currentProduct.product_name && (
                    <p className="text-gray-400 mb-3">{currentProduct.product_name}</p>
                  )}
                  <div className="flex justify-center gap-8 text-lg">
                    {currentProduct.price && (
                      <div>
                        <span className="text-gray-400">Amount: </span>
                        <span className="text-white font-bold">USD {currentProduct.price.toFixed(2)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">Profit: </span>
                      <span className="text-green-400 font-bold">USD {currentTask.earning_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 text-center">
              <p className="text-gray-300 text-lg">
                Click submit to complete this task and earn your reward
              </p>
              <p className="text-green-400 font-bold text-xl mt-2">
                Earn ${currentTask.earning_amount.toFixed(2)} for this task
              </p>
            </div>

            {!isTaskCompleted && (
              <button
                onClick={handleSubmitTask}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Task'
                )}
              </button>
            )}

            {isTaskCompleted && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-400 font-semibold text-lg">
                  Task Completed Successfully!
                </p>
                <button
                  onClick={() => {
                    if (currentTaskIndex < tasks.length - 1) {
                      setCurrentTaskIndex(currentTaskIndex + 1);
                    }
                  }}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Next Task
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-slate-700">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No tasks available
            </h3>
            <p className="text-gray-500">
              Please check back later or contact support
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
