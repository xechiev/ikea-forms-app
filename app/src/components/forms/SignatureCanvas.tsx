import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SignatureCanvasProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function SignatureCanvas({ label, value, onChange }: SignatureCanvasProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showModal]);

  const getPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    
    const mouseEvent = e as React.MouseEvent;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
      setShowModal(false);
    }
  };

  const removeSignature = () => {
    onChange(null);
  };

  return (
    <>
      <div>
        <label className="form-label">{label}</label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`w-full h-20 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
            value 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-ikea-blue'
          }`}
        >
          {value ? (
            <img src={value} alt="Signature" className="h-16 object-contain" />
          ) : (
            <span className="text-gray-400">✍️ {t('forms.tapToSign')}</span>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={removeSignature}
            className="text-red-500 text-sm mt-1 hover:underline"
          >
            {t('forms.removeSignature')}
          </button>
        )}
      </div>

      {/* Signature Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md">
            <h3 className="font-semibold text-lg mb-3">{label}</h3>
            
            <canvas
              ref={canvasRef}
              width={400}
              height={180}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg touch-none bg-white"
              style={{ touchAction: 'none' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={clearCanvas}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                {t('forms.clear')}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                {t('forms.cancel')}
              </button>
              <button
                type="button"
                onClick={saveSignature}
                className="flex-1 py-3 bg-ikea-blue text-white rounded-lg font-medium hover:bg-blue-700"
              >
                {t('forms.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SignatureCanvas;
