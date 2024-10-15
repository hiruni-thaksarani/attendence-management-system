'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'src/app/components/Button';
import AddOrganizationPopup from 'src/app/components/AddOrganizationPopup';
import AddAdminPopup from 'src/app/components/AddAdminPopup';

const OrganizationManagementDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isAddOrgPopupOpen, setIsAddOrgPopupOpen] = useState(false);
  const [isAddAdminPopupOpen, setIsAddAdminPopupOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [actionMenuOpenIndex, setActionMenuOpenIndex] = useState(null);

  useEffect(() => {
    handleFetchOrganizations();
  }, []);

  const handleFetchOrganizations = async () => {
    try {
      const response = await axios.get("http://localhost:4000/organizations");
      setOrganizations(response.data);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  };

  const handleAddOrganization = async (newOrg) => {
    try {
      const response = await axios.post("http://localhost:4000/organizations", {
        name: newOrg.name,
        contactNumber: newOrg.contact,
        address: newOrg.address,
        registrationNumber: newOrg.registration,
      });
      setOrganizations([...organizations, response.data]);
    } catch (error) {
      console.error("Failed to add organization:", error);
    }
  };

  const handleAddAdmin = async (newAdmin) => {
    try {
      const response = await axios.post("http://localhost:4000/user/admin", newAdmin);
      console.log('New admin added:', response.data);
      // Optionally, you can update the organizations state or refetch organizations
      handleFetchOrganizations();
      setIsAddAdminPopupOpen(false);
      setActionMenuOpenIndex(null);
    } catch (error) {
      console.error("Failed to add admin:", error);
    }
  };

  const toggleActionMenu = (index, org) => {
    setActionMenuOpenIndex(prevIndex => prevIndex === index ? null : index);
    setSelectedOrg(org);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ORGANIZATION MANAGEMENT DASHBOARD</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Organizations</h2>
        <Button onClick={() => setIsAddOrgPopupOpen(true)}>
          ADD NEW ORGANIZATION
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-gray-600 uppercase text-sm leading-normal border-b-2">
              <th className="py-3 px-6 text-left">Organization Name</th>
              <th className="py-3 px-6 text-left">Address</th>
              <th className="py-3 px-6 text-left">Contact</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {organizations.map((org, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">{org.name}</td>
                <td className="py-3 px-6 text-left">{org.address}</td>
                <td className="py-3 px-6 text-left">{org.contactNumber}</td>
                <td className="py-3 px-6 text-center">
                  <div className="relative">
                    <button 
                      onClick={() => toggleActionMenu(index, org)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      •••
                    </button>
                    {actionMenuOpenIndex === index && (
                      <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg z-20 divide-y divide-black-900 p-2">
                       
                          <div className="p-2 hover:bg-gray-100 cursor-pointer text-black" 
                              onClick={() => {
                                setIsAddAdminPopupOpen(true);
                                setActionMenuOpenIndex(null);
                              }}>
                            Add Admin
                          </div>
                          <div className="p-2 hover:bg-gray-100 cursor-pointer text-black">View Organization</div>
                       
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddOrganizationPopup
        isOpen={isAddOrgPopupOpen}
        onClose={() => setIsAddOrgPopupOpen(false)}
        onAdd={handleAddOrganization}
      />
      
      <AddAdminPopup
        isOpen={isAddAdminPopupOpen}
        onClose={() => setIsAddAdminPopupOpen(false)}
        onAdd={handleAddAdmin}
        selectedOrg={selectedOrg}
      />
    </div>
  );
};

export default OrganizationManagementDashboard;