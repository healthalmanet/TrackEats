import React, { useEffect, useState } from "react";
import { getAllUsers, assignPatient, searchUsersByName } from "../../../api/nutritionistApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientList = () => {
  const [users, setUsers] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const data = response?.data;

      if (Array.isArray(data?.results)) {
        setUsers(data.results);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      fetchUsers();
      return;
    }

    try {
      const response = await searchUsersByName(value);
      const data = response?.data;
      if (Array.isArray(data?.results)) {
        setUsers(data.results);
      } else {
        console.error("Unexpected search response:", data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAssign = async (patientId) => {
    setAssigning(patientId);
    try {
      await assignPatient(patientId);
      toast.success("Patient assigned successfully!");
    } catch (error) {
      console.error("Failed to assign patient:", error);
      toast.error("Failed to assign patient.");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Patient List</h2>

      <div className="mb-8 flex justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="🔍 Search patients by name..."
          className="w-full md:w-2/3 lg:w-1/2 px-5 py-3 text-sm border border-gray-200 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
        />
      </div>

      {users.length === 0 ? (
        <p className="text-gray-500 text-center">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-5 shadow hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <p className="text-xl font-semibold text-gray-900 mb-1">{user.full_name}</p>
                <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                <p className="text-xs text-gray-500">
                  Joined: {new Date(user.date_joined).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleAssign(user.id)}
                  disabled={assigning === user.id}
                  className={`w-full py-2 text-sm font-medium rounded-xl transition-transform duration-200 shadow-md ${
                    assigning === user.id
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
                  }`}
                >
                  {assigning === user.id ? "Assigning..." : "➕ Assign Patient"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;
