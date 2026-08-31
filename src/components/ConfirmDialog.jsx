import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', isDanger = true }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title || '¿Estás seguro?'}
      maxWidth="400px"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-mid)' }}>{message}</p>
    </Modal>
  );
}
