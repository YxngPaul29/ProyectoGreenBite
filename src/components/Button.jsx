import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', // primary, outline, danger, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '14px' },
    lg: { padding: '16px 32px', fontSize: '16px' },
  };

  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${className}`}
      style={sizeStyles[size]}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
