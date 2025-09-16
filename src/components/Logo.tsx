import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Shield */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 48 48"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield outline */}
          <path
            d="M24 2L42 8V24C42 32.5 36 40 24 46C12 40 6 32.5 6 24V8L24 2Z"
            stroke="#1e40af"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Horizontal divider line */}
          <line x1="6" y1="24" x2="42" y2="24" stroke="#1e40af" strokeWidth="2" />
          
          {/* Vertical divider line */}
          <line x1="24" y1="8" x2="24" y2="46" stroke="#1e40af" strokeWidth="2" />
          
          {/* Top-left quadrant - Paper airplane/triangle */}
          <path
            d="M18 16L24 20L18 24L20 20L18 16Z"
            fill="#1e40af"
          />
          <line x1="18" y1="20" x2="24" y2="20" stroke="#1e40af" strokeWidth="1" />
          
          {/* Top-right quadrant - Bar code pattern */}
          <rect x="30" y="12" width="1.5" height="8" fill="#1e40af" />
          <rect x="33" y="12" width="1.5" height="8" fill="#1e40af" />
          <rect x="36" y="12" width="1.5" height="8" fill="#1e40af" />
          <rect x="39" y="12" width="1.5" height="8" fill="#1e40af" />
          
          {/* Bottom-left quadrant - Light blue fill */}
          <rect x="6" y="24" width="18" height="22" fill="#3b82f6" />
          
          {/* Bottom-right quadrant - Light blue fill */}
          <rect x="24" y="24" width="18" height="22" fill="#3b82f6" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
            UNIVERSITY
          </span>
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]} flex items-center`}>
            STARTUPS
            <span className="text-xs ml-1">™</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
