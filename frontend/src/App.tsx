import { useState, useRef, useEffect } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { Visualizer } from './components/Visualizer';

function App() {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vizMode, setVizMode] = useState<string>('bars');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentFile = audioFiles[currentIndex] || null;
  const [audioSrc, setAudioSrc] = useState<string | undefined>(undefined);
  const objectUrlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (currentFile) {
      const newUrl = URL.createObjectURL(currentFile);
      setAudioSrc(newUrl);
      objectUrlRef.current = newUrl;
    } else {
      setAudioSrc(undefined);
      objectUrlRef.current = undefined;
    }

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, [currentFile]);

  useEffect(() => {
    audioRef.current = audioElement;
  }, [audioElement]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (files: File[]) => {
    const newFiles = [...audioFiles, ...files];
    setAudioFiles(newFiles);
    if (audioFiles.length === 0 && files.length > 0) {
      setCurrentIndex(0);
    }
    setIsPlaying(false);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold my-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        炫酷音频可视化
      </h1>
      
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
          <AudioUploader onFileSelect={handleFileSelect} />
          
          {currentFile && (
            <div className="mt-4 flex flex-col gap-4 justify-center items-center">
               <p className="text-sm text-gray-400">正在播放: {currentFile.name}</p>
               <audio 
                 ref={setAudioElement}
                 controls 
                 src={audioSrc} 
                 onPlay={() => setIsPlaying(true)}
                 onPause={() => setIsPlaying(false)}
                 className="w-full"
                 crossOrigin="anonymous"
                 key={currentIndex}
               />
            </div>
          )}

          {audioFiles.length > 0 && (
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-300">曲目列表</h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {audioFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleTrackSelect(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                      index === currentIndex
                        ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === currentIndex ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {index === currentIndex && isPlaying && (
                      <div className="flex gap-0.5">
                        <span className="w-1 h-4 bg-blue-400 animate-pulse"></span>
                        <span className="w-1 h-4 bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-1 h-4 bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {currentFile && (
          <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800 flex flex-col">
            <div className="flex gap-2 mb-4 justify-center flex-wrap">
              {[
                { id: 'bars', label: '柱状图' },
                { id: 'wave', label: '波形' },
                { id: 'particles', label: '粒子' },
                { id: 'circle', label: '圆环' },
                { id: 'stars', label: '星空' }
              ].map(({ id, label }) => (
                <button 
                  key={id}
                  onClick={() => setVizMode(id)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    vizMode === id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <div className="flex-1 rounded-lg overflow-hidden bg-black relative min-h-[150px]">
              <Visualizer 
                audioElement={audioElement} 
                isPlaying={isPlaying}
                mode={vizMode}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
