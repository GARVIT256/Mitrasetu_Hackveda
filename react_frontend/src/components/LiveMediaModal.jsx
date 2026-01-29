import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, MonitorUp } from 'lucide-react';

export function LiveMediaModal({ open, onClose, dark, videoRef, isMicOn, isCameraOn, isScreenOn, toggleMic, toggleCamera, toggleScreen }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-xl ${dark? 'bg-gray-800 border border-gray-700':'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold">Live Session Media</h3>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4"/></button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 p-4">
          <div className={`aspect-video rounded-lg flex items-center justify-center overflow-hidden ${dark? 'bg-gray-700':'bg-gray-100'}`}>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!isCameraOn && !isScreenOn && <span className="text-xs text-gray-500">Camera / Screen feed</span>}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleMic} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs ${isMicOn? 'bg-green-600 text-white':'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'}`}>{isMicOn? <Mic className="w-3 h-3"/>:<MicOff className="w-3 h-3"/>}{isMicOn? 'Mic On':'Mic Off'}</button>
              <button onClick={toggleCamera} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs ${isCameraOn? 'bg-green-600 text-white':'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'}`}>{isCameraOn? <Video className="w-3 h-3"/>:<VideoOff className="w-3 h-3"/>}{isCameraOn? 'Camera On':'Cam Off'}</button>
              <button onClick={toggleScreen} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs ${isScreenOn? 'bg-green-600 text-white':'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'}`}><MonitorUp className="w-3 h-3"/>{isScreenOn? 'Sharing':'Share Screen'}</button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <p>Media stream preview. Close this window to continue chatting; stream keeps running while live session is active.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMediaModal;