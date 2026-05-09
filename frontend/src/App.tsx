import { useState, useMemo } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { Visualizer } from './components/Visualizer';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vizMode, setVizMode] = useState<string>('bars');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const audioSrc = useMemo(() => {
    return audioFile ? URL.createObjectURL(audioFile) : undefined;
  }, [audioFile]);

  const handleFileSelect = (file: File) => {
    setAudioFile(file);
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
          
          {audioFile && (
            <div className="mt-4 flex flex-col gap-4 justify-center items-center">
               <p className="text-sm text-gray-400">{audioFile.name}</p>
               <audio 
                 ref={setAudioElement}
                 controls 
                 src={audioSrc} 
                 onPlay={() => setIsPlaying(true)}
                 onPause={() => setIsPlaying(false)}
                 className="w-full"
                 crossOrigin="anonymous"
               />
            </div>
          )}
        </div>

        {audioFile && (
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
