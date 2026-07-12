import React, { useRef, useState, useEffect } from "react";
import { PenTool, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  const [showSavedAlert, setShowSavedAlert] = useState(false);
  const lastGeneratedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (showSavedAlert) {
      const timer = setTimeout(() => setShowSavedAlert(false), 900);
      return () => clearTimeout(timer);
    }
  }, [showSavedAlert]);
  
  // Persistent stroke history to redraw synchronously on resize/re-render
  const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);

  // Redraw all strokes from history synchronously
  const redrawStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background dashed baseline
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(10, height - 25);
    ctx.lineTo(canvas.width / 2 - 10, height - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Restore signature ink settings
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw each stroke
    strokesRef.current.forEach((stroke) => {
      if (stroke.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    });
  };

  // Add passive: false touch event listener to prevent mobile page scrolling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventScroll = (e: TouchEvent) => {
      if (e.target === canvas) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  // Sync canvas size and handle redraw on resize or initial value updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const targetWidth = Math.round(rect.width * 2);
    const targetHeight = Math.round(height * 2);
    
    let resized = false;
    // Only adjust size and scale context if the dimensions actually changed
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      resized = true;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.strokeStyle = "#1e3a8a"; // Dark blue signature ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
    
    // If initialValue matches our last generated signature and we didn't resize, do nothing
    if (initialValue && initialValue === lastGeneratedSignatureRef.current && !resized) {
      return;
    }

    // If initialValue is cleared, reset strokes and canvas
    if (!initialValue) {
      strokesRef.current = [];
      clearCanvas(false);
      return;
    }

    // If we have stroke history, redraw synchronously
    if (strokesRef.current.length > 0) {
      redrawStrokes();
      setIsEmpty(false);
      return;
    }

    // Otherwise load external image (e.g. from localStorage/database on mount)
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw baseline
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(10, height - 25);
        ctx.lineTo(rect.width - 10, height - 25);
        ctx.stroke();
        ctx.setLineDash([]);

        // Reset ink settings for future drawing
        ctx.strokeStyle = "#1e3a8a";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Draw image
        ctx.drawImage(img, 0, 0, rect.width, height);
        setIsEmpty(false);
      }
    };
    img.src = initialValue;
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
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setIsEmpty(false);
      
      // Save start point to stroke history
      strokesRef.current.push([{ x, y }]);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Save point to current stroke
      const currentStroke = strokesRef.current[strokesRef.current.length - 1];
      if (currentStroke) {
        currentStroke.push({ x, y });
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      lastGeneratedSignatureRef.current = dataUrl;
      onSave(dataUrl);
      setShowSavedAlert(true);
    }
  };

  const clearCanvas = (triggerCallback = true) => {
    strokesRef.current = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Re-draw background baseline
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, height - 25);
      ctx.lineTo(canvas.width / 2 - 10, height - 25);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Reset ink settings
      ctx.strokeStyle = "#1e3a8a"; 
      ctx.lineWidth = 2.5;
    }

    setIsEmpty(true);
    lastGeneratedSignatureRef.current = null;
    if (triggerCallback && onClear) onClear();
  };

  return (
    <div className="w-full">
      <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-inner">
        <AnimatePresence>
          {showSavedAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10"
            >
              <div className="bg-white/95 shadow-md border border-emerald-200/60 px-4 py-2 rounded-full flex items-center gap-2">
                <motion.div
                  initial={{ rotate: -45, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
                <span className="text-xs font-black text-emerald-700 tracking-wide">Tanda Tangan Tersimpan!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            onClick={() => clearCanvas(true)}
            id="clear-signature-btn"
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 text-xs font-semibold rounded-md transition shadow-sm border border-slate-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>
      {!isEmpty && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] text-emerald-600 mt-1 flex items-center font-medium"
        >
          <CheckCircle className="w-3 h-3 mr-1" /> Tanda tangan elektronik direkam secara aman.
        </motion.p>
      )}
    </div>
  );
}
