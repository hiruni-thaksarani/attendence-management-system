'use client';
import React, { useState } from 'react';
import Dialog from './Dialog';
import Button from './Button';
import Input from './Input';

const AddAdminPopup = ({ isOpen, onClose, onAdd, selectedOrg }) => {
  const [newAdmin, setNewAdmin] = useState({ name: '', walletAddress: '', email: '', contactNumber: '' });

  const handleChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAdd({
        ...newAdmin,
        role: 'ADMIN',
        user_type: 'ADMIN',
        organizationId: selectedOrg._id,
      });
    setNewAdmin({ name: '', walletAddress: '', email: '', contactNumber: '' });
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Add organization Admin`}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="name">
          Admin Name
        </label>
        <Input id="name" type="text" name="name" value={newAdmin.name} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2" htmlFor="walletAddress">
          Wallet Address
        </label>
        <Input id="walletAddress" type="text" name="walletAddress" value={newAdmin.walletAddress} onChange={handleChange} />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm  mb-2" htmlFor="email">
          Email
        </label>
        <Input id="email" type="email" name="email" value={newAdmin.email} onChange={handleChange} />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm  mb-2" htmlFor="contactNumber">
          Contact Number
        </label>
        <Input id="contactNumber" type="text" name="contactNumber" value={newAdmin.contactNumber} onChange={handleChange} />
      </div>
      <Button onClick={handleSubmit}>ADD ORGANIZATION ADMIN</Button>
    </Dialog>
  );
};

export default AddAdminPopup;