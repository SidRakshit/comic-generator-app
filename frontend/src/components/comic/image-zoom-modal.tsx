// src/components/comic/image-zoom-modal.tsx
// PURPOSE: Displays a selected image in a larger centered modal view.
// FIXED: Moved useEffect hook to comply with Rules of Hooks.

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

  // --- MOVED HOOK HERE ---
  // Handle Escape key press to close the modal
  React.useEffect(() => {
    // Function to handle key down event
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Only add the event listener if the modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup listener on component unmount or when modal closes/isOpen changes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]); // Dependencies: run effect if isOpen or onClose changes


  // --- Early return remains the same ---
  // Don't render anything if the modal is not open or there's no image URL
  if (!isOpen || !imageUrl) {
    return null;
  }

  // Handle clicks on the backdrop to close the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  return (
    // Backdrop / Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-zoom-title"
    >
      {/* Modal Content Container */}
      <div className="relative max-w-3xl max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 bg-gray-700 text-white rounded-full hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          aria-label="Close image view"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Image */}
        <div className="relative w-full h-full max-h-[inherit]">
           <Image
             src={imageUrl}
             alt="Zoomed comic panel"
            width={800}
            height={800}
            style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
            }}
           />
        </div>
         {/* <h2 id="image-zoom-title" className="sr-only">Zoomed Image View</h2> */}
      </div>
    </div>
  );
};

export default ImageZoomModal;