'use client';

import React, { useState, useEffect } from 'react';
import CameraCapture from '@/components/CameraCapture';

export default function AddressVerificationPage() {
  const [candidateId, setCandidateId] = useState('123'); // Hardcoded for demo
  const [submittedAddress, setSubmittedAddress] = useState('No.7, 2nd Street, Madurai');
  const [verificationId, setVerificationId] = useState<number | null>(null);
  
  const [location, setLocation] = useState<{lat: number, lng: number, acc: number} | null>(null);
  const [locError, setLocError] = useState('');
  
  const [photos, setPhotos] = useState<{type: string, url: string}[]>([]);
  const requiredPhotos = ['Front House Photo', 'Street View', 'Door Number', 'Candidate Selfie'];

  // 1. Start Verification
  const startVerification = async () => {
    try {
      const res = await fetch('/api/address-verification/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: Number(candidateId), submittedAddress })
      });
      const data = await res.json();
      if (data.success) {
        setVerificationId(data.data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Capture GPS
  const captureGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            acc: position.coords.accuracy
          };
          setLocation(coords);
          
          if (verificationId) {
            await fetch(`/api/address-verification/capture-location/${verificationId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: coords.lat,
                longitude: coords.lng,
                accuracy: coords.acc,
                capturedAddress: 'Reverse Geocoded Address' // Mock
              })
            });
          }
        },
        (error) => setLocError(error.message),
        { enableHighAccuracy: true }
      );
    } else {
      setLocError('Geolocation not supported');
    }
  };

  // 3. Photo Capture Handler
  const handlePhotoCaptured = async (type: string, imageSrc: string) => {
    setPhotos(prev => [...prev, { type, url: imageSrc }]);
    
    if (verificationId) {
      await fetch(`/api/address-verification/upload-photo/${verificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageSrc, // In a real app, upload to S3 first and send URL
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          photoType: type,
          watermarkText: `${new Date().toLocaleString()} - Lat: ${location?.lat}, Lng: ${location?.lng}`
        })
      });
    }
  };

  const nextPhotoToCapture = requiredPhotos.find(req => !photos.find(p => p.type === req));

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Digital Address Verification</h1>
      
      {!verificationId ? (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">Case Details</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Candidate ID</label>
            <input 
              type="text" 
              value={candidateId} 
              onChange={e => setCandidateId(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Submitted Address</label>
            <textarea 
              value={submittedAddress} 
              onChange={e => setSubmittedAddress(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button 
            onClick={startVerification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
          >
            Start Verification Visit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* GPS Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
              1. Location Capture
              {location && <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded">Captured ✓</span>}
            </h2>
            
            {!location ? (
              <div>
                <button 
                  onClick={captureGPS}
                  className="bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded border border-blue-300 hover:bg-blue-200"
                >
                  📍 Capture Live GPS
                </button>
                {locError && <p className="text-red-500 mt-2">{locError}</p>}
              </div>
            ) : (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Lat:</strong> {location.lat}</p>
                <p><strong>Lng:</strong> {location.lng}</p>
                <p><strong>Accuracy:</strong> {location.acc} meters</p>
              </div>
            )}
          </div>

          {/* Photo Section */}
          {location && (
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h2 className="text-xl font-semibold mb-4">2. Geo-Tagged Photos</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {requiredPhotos.map(req => {
                  const captured = photos.find(p => p.type === req);
                  return (
                    <div key={req} className={`p-2 border rounded text-center text-sm ${captured ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      {req} {captured && '✓'}
                    </div>
                  );
                })}
              </div>

              {nextPhotoToCapture ? (
                <CameraCapture 
                  photoType={nextPhotoToCapture} 
                  onCapture={(src) => handlePhotoCaptured(nextPhotoToCapture, src)} 
                />
              ) : (
                <div className="bg-green-100 text-green-800 p-4 rounded text-center font-bold border border-green-200">
                  All mandatory photos captured!
                </div>
              )}
            </div>
          )}

          {/* Final Submit */}
          {location && !nextPhotoToCapture && (
            <div className="bg-white p-6 rounded-lg shadow-md border text-center">
              <h2 className="text-xl font-semibold mb-4">3. Finalize Report</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg">
                Submit Verification Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
