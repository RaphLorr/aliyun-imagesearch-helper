
import React, { useRef, useEffect, useState } from 'react';
import { BoundingBox, ImageData } from '../types';

interface ImageCanvasProps {
  image: ImageData | null;
  boxes: BoundingBox[];
  isNormalized: boolean;
  highlightedIndex?: number | null; // 新增：当前高亮的索引
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ image, boxes, isNormalized, highlightedIndex }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0, scale: 1 });

  const updateSize = () => {
    if (!image || !imgRef.current) return;
    const renderedWidth = imgRef.current.clientWidth;
    const renderedHeight = imgRef.current.clientHeight;
    const scale = renderedWidth / image.width;
    
    setDisplaySize({
      width: renderedWidth,
      height: renderedHeight,
      scale
    });
  };

  useEffect(() => {
    if (image) {
      updateSize();
    }
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [image]);

  if (!image) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center text-slate-700 bg-slate-950/50">
        <div className="text-center p-10">
          <p className="text-sm font-medium">请先上传图片以进行可视化</p>
        </div>
      </div>
    );
  }

  const getDisplayRect = (b: BoundingBox) => {
    const w = b.x2 - b.x1;
    const h = b.y2 - b.y1;

    if (isNormalized) {
      return {
        left: (b.x1 / 1000) * displaySize.width,
        top: (b.y1 / 1000) * displaySize.height,
        width: (w / 1000) * displaySize.width,
        height: (h / 1000) * displaySize.height,
      };
    } else {
      return {
        left: b.x1 * displaySize.scale,
        top: b.y1 * displaySize.scale,
        width: w * displaySize.scale,
        height: h * displaySize.scale,
      };
    }
  };

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center bg-black/20">
      <div className="relative inline-block w-full">
        <img 
          ref={imgRef}
          src={image.url} 
          alt="Canvas Source" 
          onLoad={updateSize}
          className="w-full h-auto block select-none pointer-events-none"
        />
        {boxes.map((box, index) => {
          const rect = getDisplayRect(box);
          if (rect.width <= 0 || rect.height <= 0) return null;

          const isHighlighted = highlightedIndex === index;

          return (
            <div
              key={index}
              className={`absolute border-2 pointer-events-none transition-all duration-500 
                ${isHighlighted 
                  ? 'border-yellow-400 bg-yellow-400/20 z-30 animate-pulse-intense scale-[1.01]' 
                  : 'border-red-500 bg-red-500/10 z-10 animate-pulse-subtle opacity-70'}`}
              style={{
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                boxShadow: isHighlighted 
                  ? '0 0 25px rgba(250, 204, 21, 0.6), inset 0 0 15px rgba(250, 204, 21, 0.4)' 
                  : '0 0 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded-sm font-bold shadow-md whitespace-nowrap transition-colors flex items-center gap-1
                ${isHighlighted ? 'bg-yellow-400 text-slate-900 z-40' : 'bg-red-600 text-white text-[9px]'}`}>
                <span className="opacity-70">#</span>{index + 1}
                {isHighlighted && <span className="text-[10px] ml-1 uppercase tracking-tighter">Selected</span>}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse-subtle {
          0% { border-color: rgba(239, 68, 68, 1); background-color: rgba(239, 68, 68, 0.1); }
          50% { border-color: rgba(239, 68, 68, 0.6); background-color: rgba(239, 68, 68, 0.05); }
          100% { border-color: rgba(239, 68, 68, 1); background-color: rgba(239, 68, 68, 0.1); }
        }
        @keyframes pulse-intense {
          0% { border-color: rgba(250, 204, 21, 1); background-color: rgba(250, 204, 21, 0.3); }
          50% { border-color: rgba(250, 204, 21, 0.8); background-color: rgba(250, 204, 21, 0.1); }
          100% { border-color: rgba(250, 204, 21, 1); background-color: rgba(250, 204, 21, 0.3); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        .animate-pulse-intense {
          animation: pulse-intense 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ImageCanvas;
