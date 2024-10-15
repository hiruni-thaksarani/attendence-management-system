'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Custom Dialog component (unchanged)
const Dialog = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

// Custom Button component (unchanged)
const Button = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
  >
    {children}
  </button>
);

// Custom Input component (unchanged)
const Input = ({ id, name, value, onChange, placeholder, label }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const AddEmployeePopup = ({ isOpen, onClose, onAdd }) => {
  const [newEmployee, setNewEmployee] = useState({ name: '', walletAddress: '', employeeNumber: '', email: '', contactNumber: '' });

  const handleChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:4000/user/employee', newEmployee);
      onAdd(response.data);
      setNewEmployee({ name: '', walletAddress: '', employeeNumber: '', email: '', contactNumber: '' });
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error);
      // Here you might want to show an error message to the user
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Employee">
      <Input id="name" name="name" value={newEmployee.name} onChange={handleChange} label="Name" />
      <Input id="walletAddress" name="walletAddress" value={newEmployee.walletAddress} onChange={handleChange} label="Wallet Address" />
      <Input id="employeeNumber" name="employeeNumber" value={newEmployee.employeeNumber} onChange={handleChange} label="Employee Number" />
      <Input id="email" name="email" value={newEmployee.email} onChange={handleChange} label="Email" />
      <Input id="contactNumber" name="contactNumber" value={newEmployee.contactNumber} onChange={handleChange} label="Contact Number" />
      <Button onClick={handleSubmit} className="w-full mt-4">
        ADD EMPLOYEE
      </Button>
    </Dialog>
  );
};

const EmployeeManagementDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [isAddEmployeePopupOpen, setIsAddEmployeePopupOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:4000/user/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Here you might want to show an error message to the user
    }
  };

  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  return (
    <div className="p-10 bg-indigo-50 h-screen">

    <div className="container mx-auto px-4 py-8 bg-white  h-screen">
      <h1 className="text-3xl font-semibold mb-6">EMPLOYEE MANAGEMENT DASHBOARD</h1>
      
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsAddEmployeePopupOpen(true)}>
          ADD NEW EMPLOYEE
        </Button>
      </div>
      
      <div className="overflow-x-auto mt-16">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-gray-600 uppercase text-sm leading-normal border-b-2">
              <th className="py-3 px-6 text-left">Employee Number</th>
              <th className="py-3 px-6 text-left">Employee Name</th>
              <th className="py-3 px-6 text-left">Contact</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Wallet Address</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {employees.map((employee, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{employee.employeeNumber}</td>
                <td className="py-3 px-6 text-left">{employee.name}</td>
                <td className="py-3 px-6 text-left">{employee.contactNumber}</td>
                <td className="py-3 px-6 text-left">{employee.email}</td>
                <td className="py-3 px-6 text-left">{employee.walletAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddEmployeePopup
        isOpen={isAddEmployeePopupOpen}
        onClose={() => setIsAddEmployeePopupOpen(false)}
        onAdd={handleAddEmployee}
      />
    </div>
    </div>
  );
};

export default EmployeeManagementDashboard;