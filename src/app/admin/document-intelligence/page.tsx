'use client';

import React, { useState } from 'react';

type OcrStatus = 'IDLE' | 'QUEUED' | 'PROCESSING' | 'EXTRACTING' | 'COMPLETED' | 'FAILED';

export default function DocumentIntelligencePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<OcrStatus>('IDLE');
  const [progress, setProgress] = useState(0);

  const [extractedData, setExtractedData] = useState<any | null>(null);

  // Mock upload & process
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      simulateProcessing();
    }
  };

  const simulateProcessing = () => {
    setStatus('QUEUED');
    setProgress(10);
    
    setTimeout(() => {
      setStatus('PROCESSING');
      setProgress(40);
    }, 1000);

    setTimeout(() => {
      setStatus('EXTRACTING');
      setProgress(70);
    }, 2500);

    setTimeout(() => {
      setStatus('COMPLETED');
      setProgress(100);
      setExtractedData({
        documentType: 'AADHAAR CARD',
        overallConfidence: 98,
        fields: [
          { name: 'Name', value: 'BALAMURUGAN S', confidence: 98 },
          { name: 'DOB', value: '11-06-1999', confidence: 95 },
          { name: 'Gender', value: 'Male', confidence: 99 },
          { name: 'Aadhaar', value: 'XXXX XXXX 1234', confidence: 99 },
          { name: 'Address', value: 'Madurai', confidence: 85 }, // Amber
          { name: 'Phone', value: '+91 9876543210', confidence: 75 } // Red
        ]
      });
    }, 4000);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 80) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      simulateProcessing();
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Document Intelligence Engine</h1>
        <p className="text-gray-500 mt-2">AI-powered OCR Document Processing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">1. Upload Document</h2>
          
          <div 
            className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="text-4xl mb-4">📄</div>
            <p className="text-blue-800 font-medium mb-2">Drag & Drop your document here</p>
            <p className="text-blue-600 text-sm">or click to browse files</p>
            <p className="text-gray-400 text-xs mt-4">Supported: PDF, JPG, PNG, TIFF up to 20MB</p>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.heic"
              onChange={handleFileUpload}
            />
          </div>

          {file && (
            <div className="mt-6">
              <p className="font-medium text-gray-700">Selected File: {file.name}</p>
              
              {status !== 'IDLE' && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-blue-800">Status: {status}</span>
                    <span className="text-blue-800">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">2. OCR Results & Review</h2>
          
          {!extractedData ? (
            <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
              Upload a document to see extracted fields
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Detected Type</p>
                  <p className="text-lg font-bold text-blue-900">{extractedData.documentType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 font-semibold">Overall Confidence</p>
                  <p className={`text-lg font-bold ${extractedData.overallConfidence >= 95 ? 'text-green-600' : 'text-amber-600'}`}>
                    {extractedData.overallConfidence}%
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {extractedData.fields.map((field: any, idx: number) => (
                  <div key={idx} className="flex flex-col p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">{field.name}</label>
                      <span className={`text-xs px-2 py-1 rounded border font-semibold ${getConfidenceColor(field.confidence)}`}>
                        {field.confidence}%
                      </span>
                    </div>
                    <input 
                      type="text" 
                      defaultValue={field.value} 
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3 border-t pt-6">
                <button className="flex-1 bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition">
                  Approve & Save
                </button>
                <button className="flex-1 bg-red-100 text-red-700 font-semibold py-2 rounded border border-red-200 hover:bg-red-200 transition">
                  Reject
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded border border-gray-300 hover:bg-gray-200 transition">
                  Reprocess
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
