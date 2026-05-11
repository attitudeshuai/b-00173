import React, { useRef } from 'react';

interface Props {
  onFileSelect: (files: File[]) => void;
}

export const AudioUploader: React.FC<Props> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500 transition-colors cursor-pointer group"
         onClick={() => fileInputRef.current?.click()}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/mp3,audio/*"
        multiple
        className="hidden"
      />
      <div className="w-16 h-16 mb-4 text-gray-500 group-hover:text-blue-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      <p className="text-lg font-medium text-gray-300 group-hover:text-blue-400">点击上传音频文件 (可多选)</p>
      <p className="text-sm text-gray-500 mt-2">支持 MP3, WAV, OGG 格式，按住 Ctrl/Cmd 多选</p>
    </div>
  );
};
