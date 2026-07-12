import React, { useRef, useState, useEffect } from "react";
import { PenTool, Trash2, CheckCircle } from "lucide-react";

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  placeholder?: string;
  height?: number;
  initialValue?: string | null;
}

export default function SignaturePad({
  onSave,
  onClear,
  placeholder = "Tulis tanda tangan Anda di sini menggunakan mouse atau jari...",
  height = 150,
  initialValue
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas resolution for high-DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = height * 2;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.strokeStyle = "#1e3a8a"; // Dark blue signature ink
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    
    // Clear canvas internally without triggering state reset callback
    clearCanvas(false);

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0, rect.width, height);
          setIsEmpty(false);
        }
      };
      img.src = initialValue;
    }
  }, [height, initialValue]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent scrolling on touch devices
    if ("touches" in e) {
      e.preventDefault();
    }
    
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setIsEmpty(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    if ("touches" in e) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    }
  };

  const clearCanvas = (triggerCallback = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Re-draw background lines to make it look like an official signature card
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, height - 25);
      ctx.lineTo(canvas.width / 2 - 10, height - 25);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Reset ink
      ctx.strokeStyle = "#1e3a8a"; 
      ctx.lineWidth = 2.5;
    }

    setIsEmpty(true);
    if (triggerCallback && onClear) onClear();
  };

  return (
    <div className="w-full">
      <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-inner">
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none text-slate-400 text-xs sm:text-sm text-center">
            <PenTool className="w-4 h-4 mr-2 stroke-1" />
            {placeholder}
          </div>
        )}
        
        <canvas
          id="signature-canvas"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ height: `${height}px` }}
          className="w-full block bg-white touch-none cursor-crosshair"
        />
        
        <div className="absolute right-2 bottom-2 flex gap-1">
          <button
            type="button"
            onClick={clearCanvas}
            id="clear-signature-btn"
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 text-xs font-semibold rounded-md transition shadow-sm border border-slate-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>
      {!isEmpty && (
        <p className="text-[11px] text-emerald-600 mt-1 flex items-center font-medium">
          <CheckCircle className="w-3 h-3 mr-1" /> Tanda tangan elektronik direkam secara aman.
        </p>
      )}
    </div>
  );
}
