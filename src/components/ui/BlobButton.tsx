import React from 'react';
import '../../styles/blob-buttons.css';

interface BlobButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const BlobButton: React.FC<BlobButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false 
}) => {
  const buttonClass = `blob-btn ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  const style = variant === 'secondary' 
    ? { '--cyan': '#6B7280', '--dark': '#FFFFFF' } as React.CSSProperties
    : { '--cyan': '#0505A9', '--dark': '#FFFFFF' } as React.CSSProperties;

  return (
    <>
      {/* SVG Filter for Gooey Effect */}
      <svg className="svg-filters">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      <button
        className={buttonClass}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={style}
      >
        <span className="blob-btn__inner">
          <span className="blob-btn__blobs">
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
          </span>
        </span>
        {children}
      </button>
    </>
  );
};

export default BlobButton;
