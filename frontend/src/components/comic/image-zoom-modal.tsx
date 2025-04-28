// src/components/comic/image-zoom-modal.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ isOpen, onClose, imageUrl }) => {

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4 transition-opacity duration-300 ease-in-out" // Slightly darker overlay maybe?
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-zoom-title"
    >
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt="Zoomed comic panel"
          width={1200}
          height={1200}
          style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block'
          }}          
        />
        
        <button
          type="button"
          onClick={onClose}          
          className="absolute -top-2 -right-2 z-10 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white shadow-lg"
          aria-label="Close image view"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ImageZoomModal;