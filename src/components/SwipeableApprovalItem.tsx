import React from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Check, X, ArrowRightLeft } from "lucide-react";

interface SwipeableApprovalItemProps {
  children: React.ReactNode;
  onSwipeRight: () => void; // Setujui / Approve
  onSwipeLeft: () => void;  // Tolak / Reject
  onTap: () => void;        // View Detail
  id: string;
  key?: string | number;
}

export default function SwipeableApprovalItem({
  children,
  onSwipeRight,
  onSwipeLeft,
  onTap,
  id
}: SwipeableApprovalItemProps) {
  const x = useMotionValue(0);
  
  // Transform x position to background opacity and scale
  const rightBgOpacity = useTransform(x, [0, 80], [0, 1]);
  const leftBgOpacity = useTransform(x, [-80, 0], [1, 0]);
  
  const rightIconScale = useTransform(x, [0, 120], [0.6, 1.2]);
  const leftIconScale = useTransform(x, [-120, 0], [1.2, 0.6]);

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      onSwipeRight();
    } else if (info.offset.x < -swipeThreshold) {
      onSwipeLeft();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-950/40 my-2.5 shadow-xs border border-slate-200/60 dark:border-slate-800/60">
      {/* Background Actions behind the card */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
        {/* Left Action (Swipe Right to Approve) */}
        <motion.div 
          style={{ opacity: rightBgOpacity }}
          className="absolute inset-y-0 left-0 right-1/2 bg-emerald-500 dark:bg-emerald-600 flex items-center pl-6 text-white"
        >
          <motion.div style={{ scale: rightIconScale }} className="flex items-center gap-1.5">
            <Check className="w-5 h-5 stroke-[3]" />
            <span className="text-[10px] font-black tracking-wider uppercase font-mono">Setujui</span>
          </motion.div>
        </motion.div>

        {/* Right Action (Swipe Left to Reject) */}
        <motion.div 
          style={{ opacity: leftBgOpacity }}
          className="absolute inset-y-0 right-0 left-1/2 bg-rose-500 dark:bg-rose-600 flex items-center justify-end pr-6 text-white"
        >
          <motion.div style={{ scale: leftIconScale }} className="flex items-center gap-1.5">
            <span className="text-[10px] font-black tracking-wider uppercase font-mono">Tolak</span>
            <X className="w-5 h-5 stroke-[3]" />
          </motion.div>
        </motion.div>
      </div>

      {/* Draggable Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={() => {
          // If the user tapped without dragging, trigger detail selection
          if (Math.abs(x.get()) < 5) {
            onTap();
          }
        }}
        className="relative bg-white dark:bg-slate-900 cursor-grab active:cursor-grabbing p-4.5 select-none touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
