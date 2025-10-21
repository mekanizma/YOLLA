import React from 'react';
import '../../styles/liquid-buttons.css';

interface LiquidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  active?: boolean;
  dark?: boolean;
  icon?: React.ReactNode;
}

const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  children, 
  onClick, 
  href,
  className = '', 
  active = false,
  dark = false,
  icon
}) => {
  const buttonClass = `liquid-btn ${active ? 'active' : 'liquid'} ${dark ? 'dark' : ''} ${className}`;
  
  const content = (
    <>
      {icon}
      {children}
    </>
  );

  if (href) {
    return (
      <a href={href} className={buttonClass}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={buttonClass}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default LiquidButton;
