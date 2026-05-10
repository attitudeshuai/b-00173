import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { Visualizer } from './components/Visualizer';

function App() {
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vizMode, setVizMode] = useState<string>('bars');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const prevSrcRef = useRef<string | undefined>();

  const currentFile = audioFiles[currentIndex] ?? null;

  const audioSrc = useMemo(() => {
    return currentFile ? URL.createObjectURL(currentFile) : undefined;
  }, [currentFile]);

  useEffect(() => {
    if (prevSrcRef.current) {
      URL.revokeObjectURL(prevSrcRef.current);
    }
    prevSrcRef.current = audioSrc;
  }, [audioSrc]);

  const handleFilesSelect = useCallback((files: File[]) => {
    setAudioFiles(prev => [...prev, ...files]);
    if (audioRef.current && audioRef.current.paused && audioFiles.length === 0) {
      setCurrentIndex(0);
    }
  }, [audioFiles.length]);

  const handleTrackSwitch = useCallback((index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setIsPlaying(false);
  }, [currentIndex]);

  const handleAudioEnded = useCallback(() => {
    if (currentIndex < audioFiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, audioFiles.length]);

  const handleRemoveTrack = useCallback((index: number) => {
    setAudioFiles(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(false);
      } else if (index < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (index === currentIndex) {
        const newIdx = Math.min(currentIndex, next.length - 1);
        setCurrentIndex(newIdx);
        setIsPlaying(false);
      }
      return next;
    });
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold my-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
        炫酷音频可视化
      </h1>
      
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-gray-900 rounded-xl p-6 shadow-2xl border border-gray-800">
          <AudioUploader onFilesSelect={handleFilesSelect} />
          
          {currentFile && (
            <div className="mt-4 flex flex-col gap-4 justify-center items-center">
               <p className="text-sm text-gray-400">{currentFile.name}</p>
               <audio 
                 ref={(el) => { audioRef.current = el; setAudioElement(el); }}
                 controls 
                 src={audioSrc} 
                 onPlay={() => setIsPlaying(true)}
                 onPause={() => setIsPlaying(false)}
                 onEnded={handleAudioEnded}
                 className="w-full"
                 crossOrigin="anonymous"
               />
            </div>
          )}
        </div>

        {audioFiles.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-4 shadow-2xl border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-400">曲目列表</h3>
              <span className="text-xs text-gray-500">{audioFiles.length} 首</span>
            </div>
            <ul className="max-h-48 overflow-y-auto space-y-1">
              {audioFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="group flex items-center gap-2">
                  <button
                    onClick={() => handleTrackSwitch(index)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                      index === currentIndex
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                    }`}
                  >
                    <span className={`mr-2 text-xs ${index === currentIndex ? 'text-blue-400' : 'text-gray-600'}`}>
                      {index + 1}.
                    </span>
                    {file.name}
                  </button>
                  <button
                    onClick={() => handleRemoveTrack(index)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all px-1 shrink-0"
                    title="移除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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
