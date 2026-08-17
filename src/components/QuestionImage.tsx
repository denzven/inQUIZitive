import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, ImageOff } from 'lucide-react';

interface QuestionImageProps {
  src?: string;
  alt?: string;
  maxHeight?: string;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const QuestionImage: React.FC<QuestionImageProps> = ({
  src,
  alt = 'Question image',
  maxHeight = '200px',
  maxWidth = '100%',
  className = '',
  style = {}
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src) return null;

  if (hasError) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(231, 76, 60, 0.15)',
        border: '1px solid var(--wrong-red)',
        color: 'var(--wrong-red)',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        margin: '6px 0',
        ...style
      }}>
        <ImageOff size={14} />
        <span>Image Unavailable ({src.startsWith('http') ? 'External URL Failed' : 'Load Error'})</span>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`question-image-container ${className}`}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '8px 0',
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid var(--teal)',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s ease, border-color 0.2s ease',
          maxHeight,
          maxWidth,
          ...style
        }}
        onClick={() => setIsZoomed(true)}
        title="Click to view full screen"
      >
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          style={{
            maxHeight,
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
            borderRadius: '10px'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          color: 'var(--yellow)',
          borderRadius: '6px',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          backdropFilter: 'blur(4px)'
        }}>
          <Maximize2 size={12} />
          <span>Zoom</span>
        </div>
      </div>

      {isZoomed && createPortal(
        <div 
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '24px',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              maxWidth: '44px',
              maxHeight: '44px',
              padding: 0,
              margin: 0,
              borderRadius: '50%',
              aspectRatio: '1 / 1',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(231, 76, 60, 0.9)',
              border: '2px solid var(--white)',
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
              transition: 'transform 0.15s ease, backgroundColor 0.15s ease',
              zIndex: 100000,
              outline: 'none',
              flexShrink: 0
            }}
            title="Close Zoom View"
          >
            <X size={26} strokeWidth={2.5} />
          </button>
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: '92vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '16px',
              border: '3px solid var(--yellow)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
};
