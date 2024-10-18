"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "src/app/components/Button";
import AddOrganizationPopup from "src/app/components/AddOrganizationPopup";
import AddAdminPopup from "src/app/components/AddAdminPopup";
import withAuth from "src/app/auth/withAuth";
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const OrganizationManagementDashboard = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isAddOrgPopupOpen, setIsAddOrgPopupOpen] = useState(false);
  const [isAddAdminPopupOpen, setIsAddAdminPopupOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [actionMenuOpenIndex, setActionMenuOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

   useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      router.replace("/po");
    } else {
      
      // Show toast when success parameter is true
      const success = searchParams.get('success');
      
      if (success === 'true') {
        toast.success('PO logged successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        handleFetchOrganizations();
        //Remove the success parameter from the URL to avoid showing the toast on refresh
        // const newUrl = window.location.pathname;
        // router.replace(newUrl, undefined, { shallow: true }); // shallow routing prevents a full page reload
      }
      setLoading(false);
    }
  }, [router,searchParams]);

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
      setOrganizations(prevOrgs => [...prevOrgs, {
        name: newOrg.name,
        address: newOrg.address,
        contactNumber: newOrg.contact,
        registrationNumber: newOrg.registration,
        id: newOrg.id
      }]);
    } catch (error) {
      console.error("Failed to add organization:", error);
    }
  }

  const handleAddAdmin = async (newAdmin) => {
    try {
      setOrganizations([...organizations, newOrg]);
    } catch (error) {
      console.error("Failed to add organization:", error);
    }
  };

  const toggleActionMenu = (index, org) => {
    setActionMenuOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    setSelectedOrg(org);
  };

  const handleLogout = () => {
    localStorage.clear(); 
    router.replace("/po");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-10 bg-indigo-50 h-screen">
      <div className="bg-white h-screen p-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold ml-5">
            ORGANIZATION MANAGEMENT DASHBOARD
          </h1>
          <Button onClick={handleLogout} className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold ml-5">Organizations</h2>
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
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {org.name}
                  </td>
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
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20 divide-y divide-black-900 p-2">
                          <div
                            className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                            onClick={() => {
                              setIsAddAdminPopupOpen(true);
                              setActionMenuOpenIndex(null);
                            }}
                          >
                            Add Admin
                          </div>
                          <div className="p-2 hover:bg-gray-100 cursor-pointer text-black">
                            View Organization
                          </div>
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
    </div>
  );
};

export default OrganizationManagementDashboard;