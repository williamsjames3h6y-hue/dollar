import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Globe, Mail, Settings as SettingsIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WebsiteSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  updated_at: string;
}

export default function WebsiteSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WebsiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('website_settings')
      .select('*')
      .order('key', { ascending: true });

    if (data) {
      setSettings(data);
      const initialData: Record<string, any> = {};
      data.forEach((setting) => {
        initialData[setting.key] = setting.value.value;
      });
      setFormData(initialData);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    for (const [key, value] of Object.entries(formData)) {
      await supabase
        .from('website_settings')
        .update({
          value: { value },
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('key', key);
    }

    setSaving(false);
    alert('Settings saved successfully');
    loadSettings();
  };

  const renderInput = (setting: WebsiteSetting) => {
    const value = formData[setting.key];

    if (typeof value === 'boolean') {
      return (
        <button
          onClick={() => setFormData({ ...formData, [setting.key]: !value })}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            value
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700/50 text-slate-400 border border-slate-600'
          }`}
        >
          {value ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
          <span className="font-semibold">{value ? 'Enabled' : 'Disabled'}</span>
        </button>
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => setFormData({ ...formData, [setting.key]: parseInt(e.target.value) })}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setFormData({ ...formData, [setting.key]: e.target.value })}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    );
  };

  const getIcon = (key: string) => {
    if (key.includes('email')) return Mail;
    if (key.includes('name') || key.includes('site')) return Globe;
    return SettingsIcon;
  };

  if (loading) {
    return <div className="text-white text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Website Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-2 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid gap-6">
        {settings.map((setting) => {
          const Icon = getIcon(setting.key);
          return (
            <div
              key={setting.id}
              className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg border border-emerald-500/30">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {setting.key.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{setting.description}</p>
                  </div>
                  {renderInput(setting)}
                  <p className="text-xs text-slate-500">
                    Last updated: {new Date(setting.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <SettingsIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Configuration Tips</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Site name appears in the header and browser tab</li>
              <li>• Contact email is used for support inquiries</li>
              <li>• Max daily tasks limits how many tasks users can complete per day</li>
              <li>• Maintenance mode will display a maintenance page to all non-admin users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
