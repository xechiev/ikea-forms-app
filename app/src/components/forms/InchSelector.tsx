import { useState, useEffect, useRef, useCallback } from 'react';

interface InchSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  minInches?: number;
  maxInches?: number;
  showQuickPresets?: boolean;
  quickPresets?: number[];
}

const fractions = [
  { label: '—', display: '', value: 0 },
  { label: '⅛', display: '1/8', value: 0.125 },
  { label: '¼', display: '1/4', value: 0.25 },
  { label: '⅜', display: '3/8', value: 0.375 },
  { label: '½', display: '1/2', value: 0.5 },
  { label: '⅝', display: '5/8', value: 0.625 },
  { label: '¾', display: '3/4', value: 0.75 },
  { label: '⅞', display: '7/8', value: 0.875 },
];

export function InchSelector({ 
  value, 
  onChange, 
  label,
  minInches = 0,
  maxInches = 120,
  showQuickPresets = true,
  quickPresets = [18, 24, 30, 36, 42, 84, 96]
}: InchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inches, setInches] = useState(0);
  const [fractionIndex, setFractionIndex] = useState(0);
  const inchesRef = useRef<HTMLDivElement>(null);
  
  // Parse incoming value when opening
  const openModal = useCallback(() => {
    if (value) {
      const parsed = parseInchString(value);
      setInches(parsed.inches);
      const fracIdx = fractions.findIndex(f => Math.abs(f.value - parsed.fraction) < 0.01);
      setFractionIndex(fracIdx >= 0 ? fracIdx : 0);
    } else {
      setInches(minInches);
      setFractionIndex(0);
    }
    setIsOpen(true);
  }, [value, minInches]);

  // Scroll to selected inch when modal opens
  useEffect(() => {
    if (isOpen && inchesRef.current) {
      const itemHeight = 48; // h-12 = 48px
      const scrollTop = (inches - minInches) * itemHeight - (192 / 2) + (itemHeight / 2);
      inchesRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, [isOpen, inches, minInches]);

  const formatValue = (inc: number, fracIdx: number): string => {
    const frac = fractions[fracIdx];
    if (frac.value === 0) return `${inc}"`;
    return `${inc} ${frac.display}"`;
  };

  const handleConfirm = () => {
    onChange(formatValue(inches, fractionIndex));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayValue = value || '—';

  // Generate inches array once
  const inchesArray = Array.from(
    { length: maxInches - minInches + 1 }, 
    (_, i) => i + minInches
  );

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={openModal}
        className="w-full h-10 px-3 text-left bg-white border border-gray-300 rounded-lg 
                   flex items-center justify-between text-sm
                   active:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {displayValue}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Modal picker - centered vertically */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-2xl animate-slide-up overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 text-sm px-2 py-1"
              >
                Cancel
              </button>
              <span className="font-semibold text-gray-800 text-sm truncate mx-2">{label}</span>
              <button 
                onClick={handleConfirm}
                className="text-blue-600 font-semibold text-sm px-2 py-1"
              >
                Done
              </button>
            </div>

            {/* Preview */}
            <div className="text-center py-4 bg-blue-50">
              <div className="text-4xl font-bold text-blue-600">
                {formatValue(inches, fractionIndex)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ≈ {((inches + fractions[fractionIndex].value) * 2.54).toFixed(1)} cm
              </div>
            </div>

            {/* Quick presets */}
            {showQuickPresets && quickPresets.length > 0 && (
              <div className="p-3 border-b bg-gray-50">
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPresets.map(preset => (
                    <button
                      key={preset}
                      onClick={() => { setInches(preset); setFractionIndex(0); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                ${inches === preset && fractionIndex === 0
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-200'
                                }`}
                    >
                      {preset}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wheel pickers */}
            <div className="flex p-4 gap-4">
              {/* Inches wheel */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 text-center mb-2 font-medium">INCHES</div>
                <div 
                  ref={inchesRef}
                  className="inch-selector-wheel"
                >
                  {inchesArray.map(inc => (
                    <button
                      key={inc}
                      onClick={() => setInches(inc)}
                      className={`inch-selector-item ${inches === inc ? 'selected' : ''}`}
                    >
                      {inc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fraction wheel */}
              <div className="flex-1">
                <div className="text-xs text-gray-500 text-center mb-2 font-medium">FRACTION</div>
                <div className="inch-selector-wheel">
                  {fractions.map((frac, idx) => (
                    <button
                      key={frac.label}
                      onClick={() => setFractionIndex(idx)}
                      className={`inch-selector-item ${fractionIndex === idx ? 'selected' : ''}`}
                    >
                      {frac.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear button */}
            <div className="p-4 pt-0">
              <button
                onClick={handleClear}
                className="w-full py-3 text-red-500 text-sm font-medium border border-red-200 rounded-xl active:bg-red-50"
              >
                Clear Value
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseInchString(str: string): { inches: number; fraction: number } {
  const clean = str.replace(/["']/g, '').trim();
  const parts = clean.split(' ');
  
  const inches = parseInt(parts[0]) || 0;
  let fraction = 0;
  
  if (parts[1]) {
    const fracParts = parts[1].split('/');
    if (fracParts.length === 2) {
      fraction = parseInt(fracParts[0]) / parseInt(fracParts[1]);
    }
  }
  
  return { inches, fraction };
}

export default InchSelector;
