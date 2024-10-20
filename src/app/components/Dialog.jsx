'use client';
import React from 'react';

const Dialog = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-xl font-medium	mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Dialog;