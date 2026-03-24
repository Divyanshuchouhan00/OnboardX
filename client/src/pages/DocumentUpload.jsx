import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileUp, Upload } from 'lucide-react';
import api from '../services/api.js';
import DashboardCard from '../components/ui/DashboardCard.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import PrimaryButton from '../components/ui/PrimaryButton.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TYPES = [
  { value: 'id_proof', label: 'ID proof' },
  { value: 'contract', label: 'Contract' },
  { value: 'tax_form', label: 'Tax form' },
  { value: 'other', label: 'Other' },
];

const selectClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';

export default function DocumentUpload() {
  const { showToast } = useToast();
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [type, setType] = useState('id_proof');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get('/api/documents/me');
    setDocs(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setError('Choose a file');
      return;
    }
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    try {
      await api.post('/api/documents/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      await load();
      showToast('Document uploaded successfully');
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <LoadingSpinner label="Loading documents…" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 transition hover:text-violet-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Documents</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Upload PDFs or images for HR verification.</p>
      </motion.div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}

      <DashboardCard className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Upload a file</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Max 10MB — PDF, images, or Word</p>
          </div>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Document type</label>
            <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">File</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <PrimaryButton type="submit" disabled={uploading} variant="dark" className="!w-auto inline-flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Upload'}
          </PrimaryButton>
        </form>
      </DashboardCard>

      <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Your uploads</h2>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:divide-slate-700 dark:border-slate-600 dark:bg-slate-800/40">
        {docs.length === 0 && (
          <li className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">No documents yet.</li>
        )}
        {docs.map((d, i) => (
          <motion.li
            key={d._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <span className="font-medium capitalize text-slate-900 dark:text-white">{d.type.replace('_', ' ')}</span>
              <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">{d.fileName}</span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                d.verificationStatus === 'approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : d.verificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
              }`}
            >
              {d.verificationStatus}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
