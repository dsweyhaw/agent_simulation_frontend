import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt, imageName }) => {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const imageRef = React.useRef(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === "Escape") {
      onClose();
    }
    // Zoom với keyboard
    if (e.key === "+") {
      setScale(prev => Math.min(prev + 0.2, 5));
    }
    if (e.key === "-") {
      setScale(prev => Math.max(prev - 0.2, 0.5));
    }
    // Reset zoom
    if (e.key === "0" || e.key === "r") {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [onClose]);

  // Handle mouse wheel zoom
  const handleWheel = React.useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  // Handle drag functionality
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = React.useCallback((e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset states when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Zoom controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 5))}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
            title="Zoom In (+)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
            title="Zoom Out (-)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors w-10 h-10 flex items-center justify-center"
            title="Reset Zoom (R)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Zoom level indicator */}
          <div className="bg-white/10 text-white px-2 py-1 rounded text-xs text-center">
            {Math.round(scale * 100)}%
          </div>
        </div>

        {/* Image container */}
        <div 
          className="relative bg-white rounded-lg shadow-2xl max-w-full max-h-full overflow-hidden cursor-grab"
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onWheel={handleWheel}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full max-h-[90vh] object-contain transition-transform duration-150"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center'
            }}
            onMouseDown={handleMouseDown}
            draggable={false}
          />
          
          {/* Image title */}
          {imageName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
              <h3 className="text-white text-lg font-semibold text-center">
                {imageName}
              </h3>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm text-center">
          <div>Scroll to zoom • Click and drag to pan • ESC or click outside to close</div>
          <div className="text-xs mt-1">Keyboard: +/- to zoom • R to reset • ESC to close</div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
