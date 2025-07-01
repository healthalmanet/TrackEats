import React, { useEffect, useState } from "react";
import { getAllUsers, assignPatient, searchUsersByName } from "../../../api/nutritionistApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientList = () => {
  const [users, setUsers] = useState([]);
  const [assigning, setAssigning] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load assigned IDs from localStorage
  const getAssignedIds = () => {
    try {
      const ids = JSON.parse(localStorage.getItem("assignedPatients")) || [];
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  };

  const addAssignedId = (id) => {
    const current = getAssignedIds();
    const updated = [...new Set([...current, id])];
    localStorage.setItem("assignedPatients", JSON.stringify(updated));
  };

  const filterAssignedLocally = (userList) => {
    const assignedIds = getAssignedIds();
    return userList.filter((user) => !assignedIds.includes(user.id));
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      const data = response?.data;
      if (Array.isArray(data?.results)) {
        const filtered = filterAssignedLocally(data.results);
        setUsers(filtered);
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
        const filtered = filterAssignedLocally(data.results);
        setUsers(filtered);
      } else {
        console.error("Unexpected search response:", data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleAssign = async (patientId) => {
    const user = users.find((u) => u.id === patientId);
    if (!user) return;

    setAssigning(patientId);
    try {
      await assignPatient(patientId);
      addAssignedId(patientId);
      toast.success("Patient assigned successfully!");
      setUsers((prev) => prev.filter((u) => u.id !== patientId));
    } catch (error) {
      console.error("Failed to assign patient:", error);
      toast.error("Failed to assign patient.");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="pt-23 pl-30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="mt-8 text-3xl font-bold text-gray-800 mb-1">Patient List</h2>
          <p className="text-sm text-gray-500">
            This page shows all app users. As a nutritionist, you can assign patients to yourself from this list.
          </p>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="🔍 Search patients by name..."
          className="w-full sm:w-80 px-5 py-3 bg-white text-sm border border-gray-200 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300"
        />
      </div>

      {/* Patient cards */}
      {users.length === 0 ? (
        <p className="text-gray-500 text-center">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg border border-gray-100 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">{user.full_name}</p>
                  <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(user.date_joined).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleAssign(user.id)}
                  disabled={assigning === user.id}
                  className={`w-full py-2 text-sm font-medium rounded-xl transition-transform duration-200 shadow-md ${
                    assigning === user.id
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-400 hover:bg-green-500 text-white hover:scale-105"
                  }`}
                >
                  {assigning === user.id ? "Assigning..." : "Assign as Patient"}
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
