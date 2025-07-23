import React, { useState } from 'react';
import { Users as UsersIcon, Building, Calendar, ChevronDown, ChevronRight, Download } from 'lucide-react';
import type { User, TableColumn } from '../types/interfaces';

const Users: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Empty data arrays - Connect to your backend
  const mockUsers: User[] = [];
  const mockHealthRecords: any[] = [];

  const getUserHealthRecords = (userId: string) => {
    return [];
  };

  const toggleRowExpansion = (userId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  const generatePDF = (user: User) => {
    // Mock PDF generation
    console.log(`Generating PDF for ${user.name}`);
    alert(`PDF report for ${user.name} will be downloaded (Demo)`);
  };

  const HealthTimeline: React.FC<{ userId: string }> = ({ userId }) => {
    const healthRecords = getUserHealthRecords(userId);
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">स्वास्थ्य रिकॉर्ड समयरेखा</h4>
        <p className="text-sm text-gray-500">कोई स्वास्थ्य रिकॉर्ड उपलब्ध नहीं है</p>
      </div>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => toggleRowExpansion(row.id)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {expandedRows.has(row.id) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      key: 'name',
      label: 'कर्मचारी',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="ml-4">
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'विभाग',
      render: (value) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'joiningDate',
      label: 'कार्यग्रहण तिथि',
      render: (value) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-900">
            {value ? new Date(value).toLocaleDateString('en-IN') : 'लागू नहीं'}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'संपर्क',
      render: (value, row) => (
        <div className="space-y-1">
          <p className="text-sm text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => generatePDF(row)}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200"
        >
          <Download className="h-3 w-3" />
          <span>PDF</span>
        </button>
      ),
    },
  ];

  // Enhanced data table that supports expandable rows
  const EnhancedDataTable: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    //yaha se change start hua hai - added filter states (removed role filter)
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
      department: '',
      joiningYear: ''
    });
    //yaha tak
    //yaha se change start hua hai - removed showRegistrationForm state and formData state
    const itemsPerPage = 10;
    //yaha tak

    //yaha se change start hua hai - enhanced filtering with multiple filter options (removed role filter)
    const filteredData = mockUsers.filter((user) => {
      const matchesSearch = Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesDepartment = !filters.department || 
        (user.department && user.department.toLowerCase().includes(filters.department.toLowerCase()));
      
      const matchesJoiningYear = !filters.joiningYear || 
        (user.joiningDate && new Date(user.joiningDate).getFullYear().toString() === filters.joiningYear);
      
      return matchesSearch && matchesDepartment && matchesJoiningYear;
    });
    //yaha tak

    //yaha se change start hua hai - added filter reset function and departments list (updated with government departments)
    const resetFilters = () => {
      setFilters({
        department: '',
        joiningYear: ''
      });
    };

    const departments = [
      'सामान्य प्रशासन विभाग',
      'गृह विभाग',
      'वित्त विभाग',
      'स्वास्थ्य एवं परिवार कल्याण विभाग',
      'स्कूल शिक्षा विभाग',
      'उच्च शिक्षा विभाग',
      'तकनीकी शिक्षा विभाग',
      'वन विभाग',
      'राजस्व एवं आपदा प्रबंधन विभाग',
      'खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग',
      'कृषि विभाग',
      'पंचायत एवं ग्रामीण विकास विभाग',
      'श्रम विभाग',
      'महिला एवं बाल विकास विभाग',
      'जनजातीय कार्य विभाग',
      'अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग',
      'ऊर्जा विभाग',
      'जल संसाधन विभाग',
      'लोक निर्माण विभाग',
      'परिवहन विभाग',
      'नगर प्रशासन विभाग',
      'सूचना प्रौद्योगिकी विभाग',
      'पर्यटन विभाग',
      'खेल एवं युवा कल्याण विभाग',
      'उद्योग विभाग'
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - i);
    //yaha tak

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          {/* yaha se change start hua hai - enhanced search section with filters */}
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

            {/* Filters Section */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    विभाग
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                    className="input-field"
                  >
                    <option value="">सभी विभाग</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    कार्यग्रहण वर्ष
                  </label>
                  <select
                    value={filters.joiningYear}
                    onChange={(e) => setFilters({...filters, joiningYear: e.target.value})}
                    className="input-field"
                  >
                    <option value="">सभी वर्ष</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          {/* yaha tak */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render((row as any)[column.key], row) : (row as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                  {expandedRows.has(row.id) && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-0">
                        <HealthTimeline userId={row.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
            <span className="text-sm text-gray-700">
              {filteredData.length} परिणामों में से {startIndex + 1} से {Math.min(endIndex, filteredData.length)} दिखा रहे हैं
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                पिछला
              </button>
              <span className="px-3 py-1 text-sm">
                पृष्ठ {currentPage} कुल {totalPages} का
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                अगला
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">कुल कर्मचारी</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">विभाग</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">स्वास्थ्य रिकार्ड</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">व्यवस्थापक</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table with Expandable Rows */}
      <EnhancedDataTable />

      {/* Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">स्वास्थ्य स्थिति अवलोकन</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">सामान्य बी.पी</span>
              <span className="text-sm font-medium text-gray-400">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">हाई बी.पी</span>
              <span className="text-sm font-medium text-gray-400">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">बहुत हाई बीपी</span>
              <span className="text-sm font-medium text-gray-400">0%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">शुगर लेवल की स्थिति</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">सामान्य</span>
              <span className="text-sm font-medium text-gray-400">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">पूर्व मधुमेह</span>
              <span className="text-sm font-medium text-gray-400">0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">मधुमेह</span>
              <span className="text-sm font-medium text-gray-400">0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
