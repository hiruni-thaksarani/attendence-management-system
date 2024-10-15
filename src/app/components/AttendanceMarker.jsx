import React from 'react';

const AttendanceMarker = ({ date, currentTime, status }) => {
  const getStatusButton = () => {
    switch (status) {
      case 'unmarked':
        return <button className="bg-green-500 text-white rounded-full p-2 w-8 h-8">✓</button>;
      case 'on-time':
        return <button className="bg-green-500 text-white rounded px-4 py-2">Marked on Time</button>;
      case 'late':
        return <button className="bg-orange-500 text-white rounded px-4 py-2">Marked Late</button>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="mb-2">
        <span className="text-gray-500">Date</span>
        <p className="font-semibold">{date}</p>
      </div>
      <div className="mb-2">
        <span className="text-gray-500">Current Time</span>
        <p className="font-semibold">{currentTime}</p>
      </div>
      <div>
        <span className="text-gray-500">Mark</span>
        <div className="mt-1">{getStatusButton()}</div>
      </div>
    </div>
  );
};

export default AttendanceMarker;