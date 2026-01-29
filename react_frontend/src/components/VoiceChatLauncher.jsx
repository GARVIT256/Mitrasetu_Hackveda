import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import VoiceConversationModal from './VoiceConversationModal';

export default function VoiceChatLauncher({ dark=false }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=> setOpen(true)} className={`fixed bottom-24 right-6 z-[80] shadow-lg rounded-full p-4 ${dark? 'bg-blue-600 hover:bg-blue-500 text-white':'bg-blue-500 hover:bg-blue-600 text-white'} transition`}> <Mic className="w-6 h-6"/> </button>
      <VoiceConversationModal open={open} onClose={()=> setOpen(false)} dark={dark} />
    </>
  );
}
