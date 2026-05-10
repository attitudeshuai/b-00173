import React, { useEffect, useRef } from 'react';

interface Props {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  mode: string;
}

export const Visualizer: React.FC<Props> = ({ audioElement, isPlaying, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!audioElement || initializedRef.current) return;
    initializedRef.current = true;

    // Initialize Audio Context singleton
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    // Initialize Analyser
    if (!analyserRef.current) {
      analyserRef.current = audioCtx.createAnalyser();
      analyserRef.current.fftSize = 2048; 
      analyserRef.current.smoothingTimeConstant = 0.8;
    }

    const analyser = analyserRef.current;

    // Connect source (only once, bound to the audio element, not src)
    if (!sourceRef.current) {
       try {
         sourceRef.current = audioCtx.createMediaElementSource(audioElement);
         sourceRef.current.connect(analyser);
         analyser.connect(audioCtx.destination);
       } catch (e) {
         console.warn("Audio source already connected", e);
       }
    }
  }, [audioElement]);

  useEffect(() => {
    if (!audioContextRef.current) return;
    
    if (isPlaying && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
        if(requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Starfield particles state
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width - canvas.width/2,
      y: Math.random() * canvas.height - canvas.height/2,
      z: Math.random() * canvas.width,
    }));

    // Particle system state for 'particles' mode
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 5 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));

    const render = () => {
      requestRef.current = requestAnimationFrame(render);
      
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Get audio data
      if (mode === 'wave') {
        analyser.getByteTimeDomainData(dataArray);
      } else {
        analyser.getByteFrequencyData(dataArray);
      }

      // Calculate average volume for effects
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      // Clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Trail effect
      if (mode === 'wave' || mode === 'bars') ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw based on mode
      switch (mode) {
        case 'bars': {
          const barWidth = (width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * (height / 255);
            
            const r = barHeight + 25 * (i / bufferLength);
            const g = 250 * (i / bufferLength);
            const b = 50;

            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
          }
          break;
        }

        case 'wave': {
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#00ffcc';
          ctx.beginPath();

          const sliceWidth = width * 1.0 / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();
          break;
        }

        case 'circle': {
          // Circular bars
          const radius = Math.min(width, height) / 3;
          const bars = 100; // Limit bars for circle
          const step = Math.floor(bufferLength / bars);
          
          ctx.translate(centerX, centerY);
          
          for (let i = 0; i < bars; i++) {
             const value = dataArray[i * step];
             const barHeight = value * 0.8;
             const angle = (i / bars) * Math.PI * 2;
             
             ctx.save();
             ctx.rotate(angle);
             
             const hue = i * 4;
             ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
             
             ctx.fillRect(0, radius, 4, barHeight);
             
             // Mirror
             // ctx.fillRect(0, -radius, 4, -barHeight);
             
             ctx.restore();
          }
          
          // Inner pulsing circle
          ctx.beginPath();
          ctx.arc(0, 0, radius * 0.9 + (average / 5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, 0.1)`;
          ctx.fill();
          
          ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
          break;
        }

        case 'particles': {
          // Particles that react to bass/beat
          const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
          const scale = 1 + bass / 256;
          
          particles.forEach((p, i) => {
             // Move
             p.x += p.vx * scale;
             p.y += p.vy * scale;
             
             // Bounce
             if (p.x < 0 || p.x > width) p.vx *= -1;
             if (p.y < 0 || p.y > height) p.vy *= -1;
             
             ctx.beginPath();
             const size = p.size * (dataArray[i % 50] / 100);
             ctx.arc(p.x, p.y, Math.max(2, size), 0, Math.PI * 2);
             ctx.fillStyle = p.color;
             ctx.fill();
          });
          
          // Connect nearby particles
          ctx.strokeStyle = `rgba(255, 255, 255, ${average/500})`;
          ctx.beginPath();
          for(let i=0; i<particles.length; i++) {
             for(let j=i+1; j<particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 100) {
                   ctx.moveTo(particles[i].x, particles[i].y);
                   ctx.lineTo(particles[j].x, particles[j].y);
                }
             }
          }
          ctx.stroke();
          break;
        }

        case 'stars': {
           // Starfield warp speed
           const speed = (average / 20) + 0.5;
           
           ctx.translate(centerX, centerY);
           
           stars.forEach(star => {
              star.z -= speed;
              if (star.z <= 0) {
                 star.z = width;
                 star.x = Math.random() * width - width/2;
                 star.y = Math.random() * height - height/2;
              }
              
              const sx = (star.x / star.z) * width;
              const sy = (star.y / star.z) * height;
              
              const size = (1 - star.z / width) * 5;
              const px = (star.x / (star.z + speed)) * width;
              const py = (star.y / (star.z + speed)) * height;
              
              ctx.beginPath();
              ctx.lineWidth = size;
              ctx.strokeStyle = 'white';
              ctx.moveTo(px, py);
              ctx.lineTo(sx, sy);
              ctx.stroke();
           });
           
           ctx.setTransform(1, 0, 0, 1, 0, 0);
           break;
        }
      }
    };

    render();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, mode]);

  return <canvas ref={canvasRef} className="w-full max-h-[150px]" />;
};
