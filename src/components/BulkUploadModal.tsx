import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileSpreadsheet, FileArchive, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const { logout } = useAuth();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<{
    successCount?: number;
    failureCount?: number;
    errors?: any[];
  } | null>(null);

  const handleDownloadSample = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/bulk-upload/template`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Bulk_Upload_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!excelFile) {
      alert("Please select an Excel/CSV file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append('excelFile', excelFile);
    if (zipFile) {
      formData.append('imagesZip', zipFile);
    }

    try {
      const token = localStorage.getItem('namma_orru_token');
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/products/bulk-upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 90);
          setUploadProgress(10 + percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        const response = JSON.parse(xhr.responseText);
        
        if (xhr.status === 401 && (response.message === 'Session expired' || response.message === 'Token required')) {
          alert('Your session has expired. Please login again.');
          logout();
          window.location.href = '/admin/login'; // default redirect
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          setResult(response);
          if (response.successCount > 0) {
            onSuccess();
          }
        } else {
          setResult({
            failureCount: 1,
            errors: [{ row: 'System', error: response.error || response.message || 'Failed to process upload' }]
          });
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setResult({
          failureCount: 1,
          errors: [{ row: 'System', error: 'Network error occurred during upload' }]
        });
      };

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      setResult({
        failureCount: 1,
        errors: [{ row: 'System', error: 'An unexpected error occurred' }]
      });
    }
  };

  const resetState = () => {
    setExcelFile(null);
    setZipFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  const closeHandler = () => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeHandler}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#0F7A4D] uppercase tracking-tight">Bulk Upload Products</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Upload via Excel & Zip</p>
              </div>
              <button 
                onClick={closeHandler}
                disabled={isUploading}
                className="rounded-full p-2 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {result ? (
              // RESULT VIEW
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${result.successCount && !result.failureCount ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} flex flex-col items-center justify-center text-center`}>
                  {result.successCount && !result.failureCount ? (
                    <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                  ) : (
                    <AlertCircle size={48} className="text-amber-500 mb-4" />
                  )}
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Upload Complete</h3>
                  <div className="flex gap-4 text-sm font-bold tracking-wide">
                    <span className="text-emerald-600 px-3 py-1 bg-emerald-100/50 rounded-full">{result.successCount || 0} Successful</span>
                    <span className="text-red-500 px-3 py-1 bg-red-100/50 rounded-full">{result.failureCount || 0} Failed</span>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="border border-red-100 rounded-2xl overflow-hidden bg-white">
                    <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-800">Error Report</h4>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-4 space-y-2">
                      {result.errors.map((err, i) => (
                        <div key={i} className="flex gap-3 text-sm text-red-600 bg-red-50/50 p-2 rounded-lg">
                          <span className="font-bold shrink-0">Row {err.row}:</span>
                          <span>{err.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    onClick={closeHandler}
                    className="px-6 py-3 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={resetState}
                    className="px-6 py-3 rounded-full bg-[#0F7A4D] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0c623d] transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            ) : (
              // UPLOAD VIEW
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-sm">
                  <p className="font-medium">Need the correct format? Download our template.</p>
                  <button 
                    onClick={handleDownloadSample}
                    className="px-4 py-2 bg-white text-blue-700 text-xs font-black uppercase tracking-widest rounded-full shadow-sm hover:shadow"
                  >
                    Download Sample
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Excel Upload */}
                  <label className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${excelFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}>
                    <FileSpreadsheet className={`mb-3 ${excelFile ? 'text-emerald-500' : 'text-slate-400'}`} size={32} />
                    <span className="text-sm font-bold text-slate-700 text-center uppercase tracking-wide">
                      {excelFile ? excelFile.name : 'Upload Data File'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">.xlsx (Required)</span>
                    <input 
                      type="file" 
                      accept=".xlsx" 
                      className="hidden" 
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                      disabled={isUploading}
                    />
                  </label>

                  {/* ZIP Upload */}
                  <label className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${zipFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'}`}>
                    <FileArchive className={`mb-3 ${zipFile ? 'text-emerald-500' : 'text-slate-400'}`} size={32} />
                    <span className="text-sm font-bold text-slate-700 text-center uppercase tracking-wide">
                      {zipFile ? zipFile.name : 'Upload Images'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">.zip format (Optional)</span>
                    <input 
                      type="file" 
                      accept=".zip" 
                      className="hidden" 
                      onChange={(e) => setZipFile(e.target.files?.[0] || null)}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-emerald-800 uppercase tracking-widest">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={closeHandler}
                    disabled={isUploading}
                    className="px-6 py-3 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading || !excelFile}
                    className="px-6 py-3 flex items-center gap-2 rounded-full bg-[#0F7A4D] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0c623d] transition-colors disabled:opacity-50 disabled:bg-slate-300"
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isUploading ? 'Processing...' : 'Start Upload'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
