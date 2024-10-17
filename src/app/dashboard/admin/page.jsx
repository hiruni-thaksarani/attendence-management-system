"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AddEmployeePopup from "src/app/components/AddEmployeePopup";
import Button from "src/app/components/Button";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const EmployeeManagementDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [isAddEmployeePopupOpen, setIsAddEmployeePopupOpen] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Add loading state to prevent flash

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/user"); // Use replace to prevent adding to history stack
    } else {
      setLoading(false); // Allow rendering when authenticated
    }
  }, [router]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:4000/user/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      // Here you might want to show an error message to the user
    }
  };

  const handleAddEmployee = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/user");
  };

  return (
    <div className="p-10 bg-indigo-50 h-screen">
      <div className=" p-10 bg-white  h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold ml-5">
            EMPLOYEE MANAGEMENT DASHBOARD
          </h1>
          <Button onClick={handleLogout} className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
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
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {employee.employeeNumber}
                  </td>
                  <td className="py-3 px-6 text-left">{employee.name}</td>
                  <td className="py-3 px-6 text-left">
                    {employee.contactNumber}
                  </td>
                  <td className="py-3 px-6 text-left">{employee.email}</td>
                  <td className="py-3 px-6 text-left">
                    {employee.walletAddress}
                  </td>
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
