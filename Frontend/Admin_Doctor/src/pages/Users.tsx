import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users as UsersIcon,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  Download,
} from 'lucide-react';
import serverUrl from './Server';
import type { Patient } from '../types/interfaces';
import HealthTimeline from './PatientsManagement';

const Users: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ department: '', joiningYear: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showHealthReportModal, setShowHealthReportModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const openHealthReportPopup = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowHealthReportModal(true);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.post(`${serverUrl}show_Patients.php`, {});
        const data = response.data;

        const loadedPatients = data.posts.map((post: any) => ({
          id: post.id,
          email: post.email,
          phone: post.phone,
          password: post.password,
          dateOfBirth: post.dateOfBirth,
          name: post.name,
          age: parseInt(post.age),
          gender: post.gender,
          bloodGroup: post.bloodGroup,
          address: post.address,
          lastVisit: post.date,
          healthStatus: post.healthStatus,
          familyMembers: parseInt(post.familyMembers) || 0,
          department: post.department,
          hasAbhaId: post.hasAbhaId,
          hasAyushmanCard: post.hasAyushmanCard,
          // reportSummary: post.reportSummary || '', // ✅ Added this
        }));

        setPatients(loadedPatients);
      } catch (error) {
        console.error('Error loading patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const toggleRowExpansion = (userId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  const generatePDF = (user: Patient) => {
    alert(`PDF report for ${user.name} will be downloaded (Demo)`);
  };

  const filteredData = patients.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesDepartment =
      !filters.department || user.department === filters.department;

    const matchesJoiningYear =
      !filters.joiningYear ||
      new Date(user.lastVisit).getFullYear().toString() === filters.joiningYear;

    return matchesSearch && matchesDepartment && matchesJoiningYear;
  });

  const resetFilters = () => {
    setFilters({ department: '', joiningYear: '' });
  };

  const departments = Array.from(new Set(patients.map((p) => p.department).filter(Boolean)));
  const years = Array.from(new Set(patients.map((p) => new Date(p.lastVisit).getFullYear().toString())));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">मरीज़ और स्वास्थ्य रिकॉर्ड</h1>
          <p className="text-gray-600">कर्मचारी स्वास्थ्य रिकॉर्ड और परिवार का डेटा देखें</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export All Data</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="मरीज़ खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md input-field"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>फिल्टर</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {(filters.department || filters.joiningYear) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  फिल्टर साफ़ करें
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">विभाग</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="input-field"
                  >
                    <option value="">सभी विभाग</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">नाम</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">कर्मचारी</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">विभाग</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ब्लड ग्रुप</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">संपर्क</th>
                <th></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
  {currentData.map((row) => (
    <React.Fragment key={row.id}>
      <tr className="hover:bg-gray-50">
        {/* Name + Email */}
        <td className="px-6 py-4">
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </td>

        {/* Department */}
        <td className="px-6 py-4">
          <div className="flex items-center">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-900">{row.department}</span>
          </div>
        </td>

        {/* Blood Group */}
        <td className="px-6 py-4">
          <span className="text-gray-900">{row.bloodGroup}</span>
        </td>

        {/* Phone + Email */}
        <td className="px-6 py-4">
          <p className="text-sm text-gray-900">{row.phone}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </td>

        {/* PDF */}
        <td className="px-6 py-4" colSpan={2}>
          <div className="flex space-x-2">
            <button
              onClick={() => generatePDF(row)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <Download className="h-3 w-3" />
              <span>PDF</span>
            </button>
          </div>
        </td>

        {/* Actions */}
        <td className="px-6 py-4" colSpan={2}>
          <div className="flex space-x-2">
            <button
              onClick={() => openHealthReportPopup(row)}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              <span>रिपोर्ट</span>
            </button>
          </div>
        </td>
      </tr>
    </React.Fragment>
  ))}
</tbody>

          </table>
        </div>

        {/* Health Report Modal */}
        {showHealthReportModal && selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 transition-all duration-300 ease-in-out">
            <div className="relative bg-white shadow-2xl rounded-2xl w-full max-w-3xl p-8 border border-gray-200 animate-fade-in-up">
              <button
                onClick={() => setShowHealthReportModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
              <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">📄 स्वास्थ्य रिपोर्ट</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border border-gray-300 text-sm text-left text-gray-800">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">👤 नाम:</td>
                      <td className="p-2">{selectedPatient.name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">📅 अंतिम जांच:</td>
                      <td className="p-2">{new Date(selectedPatient.lastVisit).toLocaleDateString('hi-IN')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">🩺 स्वास्थ्य स्थिति:</td>
                      <td className="p-2">{selectedPatient.healthStatus}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">📊 रिपोर्ट सारांश:</td>
                      {/* <td className="p-2">{selectedPatient.reportSummary || 'रिपोर्ट उपलब्ध नहीं है'}</td> */}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowHealthReportModal(false)}
                  className="px-6 py-2 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t text-sm text-gray-700">
            <span>
              {filteredData.length} में से {startIndex + 1} - {Math.min(endIndex, filteredData.length)} परिणाम
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                पिछला
              </button>
              <span>पृष्ठ {currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                अगला
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
