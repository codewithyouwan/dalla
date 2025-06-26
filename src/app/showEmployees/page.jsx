'use client';

import { useState, useEffect } from 'react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/fetchEmployees');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch employees');
        setEmployees(data.employees || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-black mb-6">Employee List</h1>
      {isLoading && <p className="text-gray-600">Loading employees...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {employees.length === 0 && !isLoading && !error && (
        <p className="text-gray-600">No employees found.</p>
      )}
      <ul className="space-y-2">
        {employees.map((employee) => (
          <li
            key={employee.id_number}
            onClick={() => handleSelectEmployee(employee)}
            className={`p-4 border rounded-md cursor-pointer transition-all ${
              selectedEmployee?.id_number === employee.id_number
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-black font-medium">{employee.full_name_english}</p>
                <p className="text-sm text-gray-600">{employee.full_name_katakana}</p>
                <p className="text-sm text-gray-500">ID: {employee.id_number}</p>
              </div>
              {selectedEmployee?.id_number === employee.id_number && (
                <span className="text-blue-500 font-semibold">Selected</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}