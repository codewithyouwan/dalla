'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

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

  const handleProceed = (idNumber) => {
    if (idNumber) {
      // Encrypt the id_number
      const secretKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET;
      if(!secretKey) {
        console.error('Encryption secret key is not set in environment variables.');
      }
      const encryptedId = CryptoJS.AES.encrypt(idNumber, secretKey).toString();
      const encodedId = encodeURIComponent(encryptedId);
      router.push(`/makeResume?encrypted_id=${encodedId}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Employee List</h1>
      {isLoading && <p className="text-gray-500">Loading employees...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {employees.length === 0 && !isLoading && !error && (
        <p className="text-gray-500">No employees found.</p>
      )}
      <ul className="space-y-2">
        {employees.map((employee) => (
          <li
            key={employee.id_number}
            onClick={() => handleSelectEmployee(employee)}
            className={`p-4 border rounded-md cursor-pointer transition-all ${
              selectedEmployee?.id_number === employee.id_number
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-900 font-medium">{employee.full_name_english}</p>
                <p className="text-sm text-gray-600">{employee.full_name_katakana}</p>
                <p className="text-sm text-gray-400">ID: {employee.id_number}</p>
              </div>
              {selectedEmployee?.id_number === employee.id_number && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-semibold">Selected</span>
                  <button
                    onClick={() => handleProceed(employee.id_number)}
                    className="px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Proceed
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}