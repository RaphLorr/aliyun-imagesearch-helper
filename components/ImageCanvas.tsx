
import React, { useRef, useEffect, useState } from 'react';
import { BoundingBox, ImageData } from '../types';

interface ImageCanvasProps {
  image: ImageData | null;
  boxes: BoundingBox[];
  isNormalized: boolean;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ image, boxes, isNormalized }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0, scale: 1 });

  const updateSize = () => {
    if (!image || !imgRef.current) return;
    const renderedWidth = imgRef.current.clientWidth;
    const renderedHeight = imgRef.current.clientHeight;
    // Scale factor for absolute pixel mode
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
    // 逻辑修正：
    // b.x1 = Left
    // b.x2 = Right
    // b.y1 = Top
    // b.y2 = Bottom
    const w = b.x2 - b.x1;
    const h = b.y2 - b.y1;

    if (isNormalized) {
      // 归一化模式 (0-1000)
      return {
        left: (b.x1 / 1000) * displaySize.width,
        top: (b.y1 / 1000) * displaySize.height,
        width: (w / 1000) * displaySize.width,
        height: (h / 1000) * displaySize.height,
      };
    } else {
      // 像素模式 (PX)
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
          // Only render if coordinates result in positive area
          if (rect.width <= 0 || rect.height <= 0) return null;

          return (
            <div
              key={index}
              className="absolute border-2 border-red-500 bg-red-500/10 pointer-events-none transition-all duration-300 animate-pulse-subtle"
              style={{
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <div className="absolute -top-5 left-0 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold shadow-md whitespace-nowrap z-20 flex items-center gap-1">
                <span className="opacity-70">#</span>{index + 1}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse-subtle {
          0% { border-color: rgba(239, 68, 68, 1); background-color: rgba(239, 68, 68, 0.1); }
          50% { border-color: rgba(239, 68, 68, 0.8); background-color: rgba(239, 68, 68, 0.15); }
          100% { border-color: rgba(239, 68, 68, 1); background-color: rgba(239, 68, 68, 0.1); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ImageCanvas;
