import React from "react";
import AttendanceMarker from "src/app/components/AttendanceMarker";
import AttendanceVerificationTable from "src/app/components/AttendanceVerificationTable";

const EmployeeDashboard = () => {
  const attendanceData = [
    { date: "2024/05/16", currentTime: "07:55 am", status: "unmarked" },
    { date: "2024/05/15", currentTime: "07:55 am", status: "on-time" },
    { date: "2024/05/14", currentTime: "07:55 am", status: "late" },
  ];

  const verificationData = [
    { timestamp: "2024/04/05 07:19am", status: "On-Time" },
    { timestamp: "2024/04/05 07:19am", status: "On-Time" },
    { timestamp: "2024/04/05 07:19am", status: "On-Time" },
    { timestamp: "2024/04/05 07:19am", status: "On-Time" },
    { timestamp: "2024/04/05 07:19am", status: "On-Time" },
  ];

  return (
    <div className="w-auto h-screen bg-indigo-50 p-10">
      <div className="w-auto mx-20 h-auto bg-white p-10">
        <h1 className="text-2xl font-bold mb-6">EMPLOYEE DASHBOARD</h1>

        <section className="mb-8 w-[700px]">
          <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attendanceData.map((data, index) => (
              <AttendanceMarker key={index} {...data} />
            ))}
          </div>
        </section>

        <section >
          <h2 className="text-xl font-semibold mb-4 ">
            Attendance Verification
          </h2>
          <AttendanceVerificationTable data={verificationData} />
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
