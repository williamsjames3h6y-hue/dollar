import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Project, Dataset, Annotation } from '../lib/supabase';
import {
  ArrowLeft,
  Plus,
  Save,
  Tag,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AnnotationWorkspaceProps {
  project: Project;
  onBack: () => void;
}

export const AnnotationWorkspace = ({ project, onBack }: AnnotationWorkspaceProps) => {
  const { user, profile, vipTier, refreshProfile } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationText, setAnnotationText] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [confidence, setConfidence] = useState(0.8);
  const [showAddData, setShowAddData] = useState(false);
  const [newDataUrl, setNewDataUrl] = useState('');

  useEffect(() => {
    loadDatasets();
  }, [project]);

  useEffect(() => {
    if (selectedDataset) {
      loadAnnotations(selectedDataset.id);
    }
  }, [selectedDataset]);

  const loadDatasets = async () => {
    const { data } = await supabase
      .from('datasets')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    if (data) {
      setDatasets(data);
      if (data.length > 0 && !selectedDataset) {
        setSelectedDataset(data[0]);
      }
    }
  };

  const loadAnnotations = async (datasetId: string) => {
    const { data } = await supabase
      .from('annotations')
      .select('*')
      .eq('dataset_id', datasetId)
      .order('created_at', { ascending: false });

    if (data) {
      setAnnotations(data);
    }
  };

  const addDataset = async () => {
    if (!newDataUrl.trim()) return;

    const { error } = await supabase.from('datasets').insert({
      project_id: project.id,
      data_type: project.project_type,
      data_url: newDataUrl,
      status: 'pending',
    });

    if (!error) {
      setNewDataUrl('');
      setShowAddData(false);
      loadDatasets();
    }
  };

  const saveAnnotation = async () => {
    if (!selectedDataset || !user) return;

    if (vipTier && profile) {
      if (profile.annotations_this_month >= vipTier.max_annotations_per_month) {
        alert(`You've reached your ${vipTier.name} plan limit of ${vipTier.max_annotations_per_month} annotations this month. Please upgrade to continue.`);
        return;
      }
    }

    const annotationData = {
      text: annotationText,
      labels: labels,
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from('annotations').insert({
      dataset_id: selectedDataset.id,
      user_id: user.id,
      annotation_data: annotationData,
      confidence_score: confidence,
    });

    if (!error) {
      await supabase
        .from('datasets')
        .update({ status: 'annotated' })
        .eq('id', selectedDataset.id);

      await supabase
        .from('user_profiles')
        .update({
          annotations_this_month: (profile?.annotations_this_month || 0) + 1,
        })
        .eq('id', user.id);

      setAnnotationText('');
      setLabels([]);
      setConfidence(0.8);
      loadAnnotations(selectedDataset.id);
      loadDatasets();
      refreshProfile();
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter((l) => l !== label));
  };

  const getDataIcon = () => {
    switch (project.project_type) {
      case 'text':
        return FileText;
      case 'image':
        return ImageIcon;
      case 'audio':
        return Music;
      case 'video':
        return Video;
      default:
        return FileText;
    }
  };

  const DataIcon = getDataIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-sm text-gray-600 capitalize">{project.project_type} Annotation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Data Items</h2>
              <button
                onClick={() => setShowAddData(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {datasets.length === 0 ? (
              <div className="text-center py-8">
                <DataIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No data items yet</p>
                <button
                  onClick={() => setShowAddData(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Add your first item
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    onClick={() => setSelectedDataset(dataset)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedDataset?.id === dataset.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <DataIcon className={`w-5 h-5 ${selectedDataset?.id === dataset.id ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {dataset.data_url.split('/').pop() || 'Data item'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {dataset.status === 'annotated' ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">{dataset.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
              {selectedDataset ? (
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border-2 border-gray-200">
                  {project.project_type === 'text' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{selectedDataset.data_url}</p>
                    </div>
                  )}
                  {project.project_type === 'image' && (
                    <img
                      src={selectedDataset.data_url}
                      alt="Dataset"
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                  {(project.project_type === 'audio' || project.project_type === 'video') && (
                    <div className="text-center">
                      <DataIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">Media preview coming soon</p>
                      <a
                        href={selectedDataset.data_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 inline-block"
                      >
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Select a data item to start annotating</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Annotation</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annotation Notes
                  </label>
                  <textarea
                    value={annotationText}
                    onChange={(e) => setAnnotationText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Add your annotation notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Labels
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add label..."
                    />
                    <button
                      onClick={addLabel}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <Tag className="w-5 h-5" />
                    </button>
                  </div>
                  {labels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          <span>{label}</span>
                          <button
                            onClick={() => removeLabel(label)}
                            className="hover:text-blue-900"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Score: {confidence.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={confidence}
                    onChange={(e) => setConfidence(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <button
                  onClick={saveAnnotation}
                  disabled={!selectedDataset || !annotationText.trim()}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Annotation</span>
                </button>
              </div>
            </div>

            {annotations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Previous Annotations</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {annotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Confidence: {annotation.confidence_score}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(annotation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {annotation.annotation_data.text}
                      </p>
                      {annotation.annotation_data.labels?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {annotation.annotation_data.labels.map((label: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Data Item</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {project.project_type === 'text' ? 'Text Content' : 'URL or Content'}
                </label>
                <textarea
                  value={newDataUrl}
                  onChange={(e) => setNewDataUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder={
                    project.project_type === 'text'
                      ? 'Enter the text to annotate...'
                      : 'Enter URL or content...'
                  }
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowAddData(false);
                  setNewDataUrl('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addDataset}
                disabled={!newDataUrl.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
