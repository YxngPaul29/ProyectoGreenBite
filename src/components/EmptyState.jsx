import React from 'react';
import Button from './Button';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon, title, description, actionText, actionLink, onAction }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: 'white',
      border: '2px dashed var(--border)',
      borderRadius: 'var(--radius)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>{icon}</div>
      <h2 style={{ fontSize: '20px', color: 'var(--text-dark)', marginBottom: '10px' }}>{title}</h2>
      <p style={{ color: 'var(--text-mid)', maxWidth: '400px', marginBottom: '24px' }}>{description}</p>
      
      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary">{actionText}</Link>
        ) : (
          <Button onClick={onAction}>{actionText}</Button>
        )
      )}
    </div>
  );
}
