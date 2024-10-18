'use client';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import AttendanceMarker from "src/app/components/AttendanceMarker";
import AttendanceVerificationTable from "src/app/components/AttendanceVerificationTable";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from 'lucide-react';
import Button from "src/app/components/Button";

const EmployeeDashboard = ({ employeeId }) => {
  console.log('employeeId-2',employeeId)
  const [attendanceHistory, setAttendanceHistory] = useState([]);
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
    fetchAttendanceHistory();
  }, []);

  const fetchAttendanceHistory = async () => {
    try {
      const employeeId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:4000/attendance/history/${employeeId}`);
      console.log('response',response);
      setAttendanceHistory(response.data);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/user");
  };

  return (
    <div className="w-auto h-screen bg-indigo-50 p-10">
      <div className="w-auto  h-screen bg-white p-10">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold ">
          EMPLOYEE DASHBOARD
          </h1>
          <Button onClick={handleLogout} className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <section className="mb-8 w-[700px]">
          <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
          <AttendanceMarker employeeId={employeeId} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Attendance Verification
          </h2>
          <AttendanceVerificationTable data={attendanceHistory} />
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;