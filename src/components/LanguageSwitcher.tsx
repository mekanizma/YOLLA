import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

interface LanguageSwitcherProps {
  className?: string;
  showFlags?: boolean;
  variant?: 'dropdown' | 'buttons';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  showFlags = true,
  variant = 'dropdown' 
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      flag: (
        <svg className="w-5 h-5 rounded" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 3900 3900">
          <path fill="#b22234" d="M0 0h7410v3900H0z"/>
          <path d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" stroke="#fff" strokeWidth="300"/>
          <path fill="#3c3b6e" d="M0 0h2964v2100H0z"/>
          <g fill="#fff">
            <g id="d">
              <g id="c">
                <g id="e">
                  <g id="b">
                    <path id="a" d="M247 90l70.534 217.082-184.66-134.164h228.253L176.466 307.082z"/>
                    <use xlinkHref="#a" y="420"/>
                    <use xlinkHref="#a" y="840"/>
                    <use xlinkHref="#a" y="1260"/>
                  </g>
                  <use xlinkHref="#a" y="1680"/>
                </g>
                <use xlinkHref="#a" x="247" y="210"/>
              </g>
              <use xlinkHref="#c" x="494"/>
            </g>
            <use xlinkHref="#d" x="988"/>
            <use xlinkHref="#c" x="1976"/>
            <use xlinkHref="#e" x="2470"/>
          </g>
        </svg>
      )
    },
    { 
      code: 'tr', 
      name: 'Türkçe', 
      flag: (
        <svg
          className="w-5 h-5 rounded"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 900 600"
          role="img"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background */}
          <rect width="900" height="600" fill="#E30A17" />

          {/* Crescent: white outer circle minus inner red circle */}
          <circle cx="360" cy="300" r="100" fill="#fff" />
          <circle cx="395" cy="300" r="70" fill="#E30A17" />

          {/* Five-point star positioned to the right of the crescent */}
          {/* star path centered at 0,-50 ... then translated and scaled */}
          <g transform="translate(480 300) scale(0.6)">
            <path
              d="M0,-50 L14.43,-15.45 L47.55,-15.45 L23.56,5.9 L29.39,38.2 L0,20 L-29.39,38.2 L-23.56,5.9 L-47.55,-15.45 L-14.43,-15.45 Z"
              fill="#fff"
            />
          </g>
        </svg>
      )
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    // Persist on first selection (localStorage is already used by i18next)
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem('i18nextLng', langCode);
    } catch {}
    setIsOpen(false);
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              i18n.language === lang.code
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showFlags && <span className="flex-shrink-0">{lang.flag}</span>}
            <span className="truncate">{lang.name}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-200 shadow-sm"
      >
        {showFlags && <span className="flex-shrink-0">{currentLanguage.flag}</span>}
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && createPortal(
        <div 
          ref={portalRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors duration-200 ${
                i18n.language === lang.code
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {showFlags && <span className="flex-shrink-0">{lang.flag}</span>}
              <span className="font-medium">{lang.name}</span>
              {i18n.language === lang.code && (
                <svg
                  className="w-4 h-4 ml-auto text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default LanguageSwitcher;
