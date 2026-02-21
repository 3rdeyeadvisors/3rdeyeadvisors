import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, Volume2, VolumeX, X, ChevronUp, ChevronDown } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
  title: string;
  onClose: () => void;
}

// Emoji unicode ranges to strip
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{1F004}\u{1F0CF}\u{FE0F}\u{20E3}]/gu;

// Transform raw content into natural spoken audio script
const prepareForSpeech = (text: string): string => {
  let result = text;

  // 1. Strip emojis completely
  result = result.replace(EMOJI_REGEX, '');

  // 2. Remove custom component tags like [COMPONENT:KEY_TAKEAWAY] { ... }
  result = result.replace(/\[COMPONENT:[^\]]+\][\s\S]*?\}/g, '');

  // 3. Transform markdown headers into spoken transitions
  result = result.replace(/^#{1}\s+(.+)$/gm, 'Section: $1.');
  result = result.replace(/^#{2}\s+(.+)$/gm, '$1.');
  result = result.replace(/^#{3,6}\s+(.+)$/gm, '$1.');

  // 4. Transform bold text - read naturally without asterisks
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/\*([^*]+)\*/g, '$1');

  // 5. Transform bullet point lists into natural sentences
  result = result.replace(/^[\s]*[-*+•]\s+(.+)$/gm, '$1.');

  // 6. Transform numbered lists
  result = result.replace(/^[\s]*(\d+)\.\s+(.+)$/gm, 'Point $1: $2.');

  // 7. Strip inline code and code blocks
  result = result.replace(/```[\s\S]*?```/g, '');
  result = result.replace(/`([^`]+)`/g, '$1');

  // 8. Strip markdown links but keep the text
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 9. Strip blockquotes
  result = result.replace(/^>\s+/gm, '');

  // 10. Strip horizontal rules
  result = result.replace(/^[-*_]{3,}$/gm, '');

  // 11. Strip HTML tags if any
  result = result.replace(/<[^>]+>/g, '');

  // 12. Strip special characters that don't belong in speech
  result = result.replace(/[#*_~|\\]/g, '');

  // 13. Fix common abbreviations that TTS reads awkwardly
  result = result.replace(/\bDeFi\b/g, 'De-Fi');
  result = result.replace(/\bAPY\b/g, 'A.P.Y.');
  result = result.replace(/\bAPR\b/g, 'A.P.R.');
  result = result.replace(/\bTVL\b/g, 'T.V.L.');
  result = result.replace(/\bDAO\b/g, 'D.A.O.');
  result = result.replace(/\bNFT\b/g, 'N.F.T.');
  result = result.replace(/\bDEX\b/g, 'D.E.X.');
  result = result.replace(/\bCEX\b/g, 'C.E.X.');
  result = result.replace(/\bRWA\b/g, 'R.W.A.');
  result = result.replace(/\bAML\b/g, 'A.M.L.');
  result = result.replace(/\bKYC\b/g, 'K.Y.C.');

  // 14. Convert % to "percent" for natural reading
  result = result.replace(/(\d+)%/g, '$1 percent');

  // 15. Convert $ amounts
  result = result.replace(/\$(\d[\d,]*)/g, '$1 dollars');

  // 16. Clean up excessive whitespace and blank lines
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/[ \t]{2,}/g, ' ');

  // 17. Trim
  return result.trim();
};

// Split into natural spoken paragraphs and sentences
const splitIntoSpeechChunks = (text: string): string[] => {
  // Split on paragraph breaks first
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    const clean = paragraph.trim();
    if (!clean) continue;

    // If paragraph is short enough, keep it as one chunk
    if (clean.length <= 300) {
      chunks.push(clean);
      continue;
    }

    // Otherwise split on sentence boundaries
    const sentences = clean.match(/[^.!?]+[.!?]+[\s]*/g) || [clean];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length > 300) {
        if (current.trim()) chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current.trim()) chunks.push(current.trim());
  }

  return chunks.filter(c => c.trim().length > 5);
};

const AudioPlayer = ({ text, title, onClose }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chunksRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('');

  const cleanText = prepareForSpeech(text);

  // Select best available voice on mount
  useEffect(() => {
    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Priority order: prefer natural/neural English voices
      const preferred = [
        'Google US English',
        'Google UK English Female',
        'Microsoft Aria Online (Natural)',
        'Microsoft Guy Online (Natural)',
        'Samantha',
        'Karen',
        'Daniel',
      ];

      for (const name of preferred) {
        const match = voices.find(v => v.name === name);
        if (match) {
          voiceRef.current = match;
          return;
        }
      }

      // Fallback: pick first English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) voiceRef.current = englishVoice;
    };

    selectVoice();
    // voices may not be loaded yet on first render
    window.speechSynthesis.onvoiceschanged = selectVoice;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Keepalive fix for iOS/Chrome speechSynthesis cutoff bug
  useEffect(() => {
    let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying) {
      keepAliveInterval = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000); // every 10 seconds
    }

    return () => {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
    };
  }, [isPlaying]);

  useEffect(() => {
    chunksRef.current = splitIntoSpeechChunks(cleanText);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [cleanText]);

  const speakChunk = useCallback((index: number) => {
    if (index >= chunksRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      isPlayingRef.current = false;
      return;
    }
    const chunk = chunksRef.current[index];
    if (chunk.startsWith('Section:')) {
      setCurrentSection(chunk.replace('Section:', '').replace('.', '').trim());
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = speed;
    utterance.volume = isMuted ? 0 : 1;
    utterance.pitch = 1;
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.onend = () => {
      if (isPlayingRef.current) {
        const next = index + 1;
        setCurrentChunk(next);
        setProgress(Math.round((next / chunksRef.current.length) * 100));
        speakChunk(next);
      }
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speed, isMuted]);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      speakChunk(currentChunk);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunk(0);
    setProgress(0);
    isPlayingRef.current = false;
  };

  const handleSkip = () => {
    window.speechSynthesis.cancel();
    const next = Math.min(currentChunk + 5, chunksRef.current.length - 1);
    setCurrentChunk(next);
    setProgress(Math.round((next / chunksRef.current.length) * 100));
    if (isPlaying) {
      setTimeout(() => speakChunk(next), 100);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
    setSpeed(next);
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setTimeout(() => speakChunk(currentChunk), 100);
    }
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? 1 : 0;
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[100] transition-all duration-300 ${isMinimized ? 'translate-y-[calc(100%-48px)]' : 'translate-y-0'}`}>
      <div className="bg-black/95 border-t border-violet-500/30 backdrop-blur-xl shadow-2xl shadow-violet-950/50">
        {/* Drag handle / minimize bar */}
        <div
          className="flex items-center justify-between px-4 h-12 cursor-pointer border-b border-white/5"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <span className="font-body text-xs text-white/60 truncate max-w-[200px] sm:max-w-xs">
              {currentSection ? `${title} — ${currentSection}` : title}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="text-white/40 hover:text-white/70 transition-colors p-1"
              aria-label="Close audio player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Player controls */}
        <div className="px-4 py-4">
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mute */}
              <button
                onClick={toggleMute}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Stop"
              >
                <Square className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-all shadow-lg shadow-violet-900/40 active:scale-95"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white fill-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                )}
              </button>

              {/* Skip forward */}
              <button
                onClick={handleSkip}
                className="p-2 text-white/50 hover:text-white transition-colors"
                aria-label="Skip forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed + progress text */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSpeedChange}
                className="font-body text-xs text-white/50 hover:text-violet-400 transition-colors bg-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/10"
              >
                {speed}x
              </button>
              <span className="font-body text-xs text-white/30 tabular-nums">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
