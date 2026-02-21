import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Save, Trash2 } from 'lucide-react';

interface NotesEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onClear: () => void;
}

const NotesEditor = ({ initialValue, onSave, onClear }: NotesEditorProps) => {
  const [value, setValue] = useState(initialValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const hasInitialized = useRef(false);

  // Only sync initialValue on first mount or when module changes (not on every parent re-render)
  useEffect(() => {
    if (!hasInitialized.current) {
      setValue(initialValue);
      hasInitialized.current = true;
    }
  }, []);

  // Reset when the module actually changes (initialValue will be different)
  const prevInitialRef = useRef(initialValue);
  useEffect(() => {
    if (prevInitialRef.current !== initialValue && !isDirty) {
      setValue(initialValue);
      prevInitialRef.current = initialValue;
    }
  }, [initialValue, isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    setIsDirty(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(val);
    }, 1500); // longer debounce to avoid parent re-render loop
  };

  const handleSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSave(value);
    setIsDirty(false);
  };

  const handleClear = () => {
    setValue('');
    setIsDirty(false);
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-violet-400" />
        <h3 className="font-consciousness text-base font-bold text-white">Personal Notes</h3>
        {isDirty && (
          <span className="font-body text-[10px] uppercase tracking-widest text-white/30 ml-auto">Unsaved</span>
        )}
      </div>
      <textarea
        placeholder="Add your notes about this module... These are private to you."
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          minHeight: '240px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'Inter, sans-serif',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.12)';
          if (isDirty) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            onSave(value);
            setIsDirty(false);
          }
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="font-body bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save Notes
        </button>
        <button
          onClick={handleClear}
          className="font-body border border-white/10 text-white/50 hover:text-white hover:border-white/20 rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-colors bg-transparent"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default NotesEditor;
