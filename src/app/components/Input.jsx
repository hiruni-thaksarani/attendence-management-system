'use client';
import React from 'react';

const Input = ({ name, value, onChange, placeholder }) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

export default Input;