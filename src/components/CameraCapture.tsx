'use client';

import React, { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  photoType: string;
}

export default function CameraCapture({ onCapture, photoType }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setError('Could not access camera. Please allow permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg');
        onCapture(imageSrc);
        stopCamera();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold">Capture {photoType}</h3>
      
      {error && <div className="text-red-500">{error}</div>}
      
      <div className="relative w-full max-w-md aspect-video bg-black rounded overflow-hidden flex items-center justify-center">
        {!stream ? (
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Start Camera
          </button>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {stream && (
        <button 
          onClick={capturePhoto}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition"
        >
          Capture Photo
        </button>
      )}

      {/* Hidden canvas for capturing the image frame */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
