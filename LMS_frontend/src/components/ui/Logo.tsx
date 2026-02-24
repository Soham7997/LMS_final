import React from 'react';

const Logo: React.FC = () => {
  return (
    <img
      src="/logo.png"
      alt="URJA Japanese Learning & Consulting"
      className="h-18 w-auto"
      style={{
        height: '60px',
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  );
};

export default Logo;
