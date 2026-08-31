import React from 'react';

export default function Input({ label, error, type = 'text', ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input 
        type={type} 
        className={`form-control ${error ? 'error' : ''}`}
        {...props} 
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
