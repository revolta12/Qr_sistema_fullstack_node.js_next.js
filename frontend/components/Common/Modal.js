import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const Modal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  actions,
  maxWidth = 'md',
  fullWidth = true 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="modal-title"
    >
      {title && (
        <DialogTitle id="modal-title" className="bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </DialogTitle>
      )}
      
      <DialogContent className="p-6">
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions className="bg-gray-50 border-t p-4">
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;