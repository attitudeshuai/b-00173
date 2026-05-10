import { useState, useMemo, useRef, useEffect } from 'react';
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

  const audioSrc = useMemo(() => {
    return currentFile ? URL.createObjectURL(currentFile) : undefined;
  }, [currentFile]);

  useEffect(() => {
    if (audioElement && audioSrc) {
      audioElement.load();
    }
  }, [audioSrc, audioElement]);

  const handleFileSelect = (files: File[]) => {
    setAudioFiles(prev => [...prev, ...files]);
    if (audioFiles.length === 0) {
      setCurrentIndex(0);
    }
    setIsPlaying(false);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const handleRemoveTrack = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = audioFiles.filter((_, i) => i !== index);
    setAudioFiles(newFiles);
    if (index === currentIndex && newFiles.length > 0) {
      setCurrentIndex(0);
    } else if (index < currentIndex) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
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
                 ref={(el) => {
                   setAudioElement(el);
                   audioRef.current = el;
                 }}
                 controls 
                 src={audioSrc} 
                 onPlay={() => setIsPlaying(true)}
                 onPause={() => setIsPlaying(false)}
                 className="w-full"
                 crossOrigin="anonymous"
               />
            </div>
          )}

          {audioFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">曲目列表</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {audioFiles.map((file, index) => (
                  <div
                    key={index}
                    onClick={() => handleTrackSelect(index)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      index === currentIndex
                        ? 'bg-blue-600/20 border border-blue-500'
                        : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium ${
                        index === currentIndex ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-300 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => handleRemoveTrack(index, e)}
                      className="ml-2 p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                      title="删除曲目"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
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
