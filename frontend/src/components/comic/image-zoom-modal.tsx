// src/components/comic/image-zoom-modal.tsx
// PURPOSE: Displays a selected image in a lightbox style (centered on overlay).
// UPDATED: Revised structure for lightbox effect.

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

  // useEffect for Escape key remains the same
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

  // Early return if not open or no image
  if (!isOpen || !imageUrl) {
    return null;
  }

  // Handle clicks on the backdrop (outside the image container)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Full screen overlay - uses flex to center the content
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4 transition-opacity duration-300 ease-in-out" // Slightly darker overlay maybe?
      onClick={handleBackdropClick} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-zoom-title" // Still good for accessibility
    >
      {/* --- MODIFIED: Image and Button Wrapper --- */}
      {/* This div wraps the image and button, allowing relative positioning
          and preventing backdrop click from closing when clicking the image itself */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex" // Use flex for centering, limit size
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking wrapper/image
      >
        {/* Image Display */}
        <Image
          src={imageUrl}
          alt="Zoomed comic panel"
          width={1200} // Provide large base width/height hints
          height={1200}
          style={{
              maxWidth: '100%',    // Ensure it fits horizontally
              maxHeight: '100%',   // Ensure it fits vertically within the wrapper's max-h
              width: 'auto',       // Scale width automatically
              height: 'auto',      // Scale height automatically
              objectFit: 'contain', // Ensure entire image is visible
              display: 'block'     // Prevents extra space below image
          }}
          // priority // Consider adding priority if LCP is affected
        />

        {/* Close Button - Positioned relative to the wrapper (which sizes to the image) */}
        <button
          type="button"
          onClick={onClose}
          // Position top-right corner of the wrapper div. Adjust offsets as needed.
          className="absolute -top-2 -right-2 z-10 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white shadow-lg"
          aria-label="Close image view"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Optional: Invisible title for aria-labelledby */}
        {/* <h2 id="image-zoom-title" className="sr-only">Zoomed Image View</h2> */}
      </div>
      {/* --- END MODIFIED SECTION --- */}
    </div>
  );
};

export default ImageZoomModal;