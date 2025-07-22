import React, { useState, useEffect } from 'react';
// UPDATED: Added Search, X, Save icons for new dialog functionality
import { Plus, Calendar, MapPin, Users, Edit, Trash2, Eye, Search, X, Save } from 'lucide-react';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { mockCamps, mockDoctors, getDoctorById } from '../data/mockData';
import type { Camp, TableColumn } from '../types/interfaces';
import serverUrl from './Server';
import axios from 'axios';
const Camps: React.FC = () => {
  const [camps, setCamps] = useState(mockCamps);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [deletingCamp, setDeletingCamp] = useState<Camp | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // UPDATED: Changed form structure to match NewCamp.tsx layout
  const [formData, setFormData] = useState({
    id:'0',
    campName: '', // NEW: Added camp name field
    location: '',
    address: '',
    date: '',
    startTime: '', // UPDATED: Changed from timeFrom to startTime
    endTime: '', // UPDATED: Changed from timeTo to endTime
    expectedPatients: '', // UPDATED: Changed from expectedBeneficiaries to expectedPatients
    description: '', // NEW: Added description field
    services: [] as string[], // NEW: Added services array
    assignedDoctors: [] as string[] // UPDATED: Changed from doctors to assignedDoctors
  });

  // NEW: Added state variables for enhanced form functionality
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // NEW: Added available services list matching NewCamp.tsx
  const availableServices = [
    'सामान्य स्वास्थ्य जांच',
    'रक्तचाप जांच',
    'मधुमेह जांच',
    'आंखों की जांच',
    'दांतों की जांच',
    'टीकाकरण',
    'गर्भवती महिलाओं की जांच',
    'बच्चों की जांच'
  ];

  // NEW: Added doctor search filtering functionality
  const filteredDoctors = mockDoctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Array.isArray(doctor.qualification)
      ? doctor.qualification.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
      : String(doctor.qualification).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDoctorDialog) {
        setShowDoctorDialog(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDoctorDialog]);

  // NEW: Added generic form input handler from NewCamp.tsx
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // NEW: Added service selection toggle function
  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  // NEW: Added doctor selection toggle function from NewCamp.tsx
  const handleDoctorToggle = (doctorId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedDoctors: prev.assignedDoctors.includes(doctorId)
        ? prev.assignedDoctors.filter(d => d !== doctorId)
        : [...prev.assignedDoctors, doctorId]
    }));
    // Clear error when user selects doctors
    if (errors.assignedDoctors) {
      setErrors(prev => ({
        ...prev,
        assignedDoctors: ''
      }));
    }
  };

  // NEW: Added comprehensive form validation from NewCamp.tsx
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.campName.trim()) {
      newErrors.campName = 'शिविर का नाम आवश्यक है';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'स्थान आवश्यक है';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'पूरा पता आवश्यक है';
    }
    if (!formData.date) {
      newErrors.date = 'तारीख आवश्यक है';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'शुरुआती समय आवश्यक है';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'समाप्ति समय आवश्यक है';
    }
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'समाप्ति समय शुरुआती समय से बाद होना चाहिए';
    }
    if (!formData.expectedPatients || parseInt(formData.expectedPatients) < 1) {
      newErrors.expectedPatients = 'अपेक्षित मरीजों की संख्या आवश्यक है';
    }
    if (formData.services.length === 0) {
      newErrors.services = 'कम से कम एक सेवा चुनें';
    }
    if (formData.assignedDoctors.length === 0) {
      newErrors.assignedDoctors = 'कम से कम एक डॉक्टर का चयन आवश्यक है';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //=================use effect to load data
useEffect(() => {
    const fetchCamps = async () => {
      try {
        const endpoint = `${serverUrl}show_camp.php`;
        const response = await axios.post(endpoint, {});
        const data = response.data;
        
        const newCamps: Camp[] = data.posts.map((post: any) => ({
          id: post.id,
          location: post.location,
          date: post.DATE,
          time: `${post.startTime} - ${post.endTime}`,
          address: post.address,
          coordinator: post.coordinator,
          expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
          doctors: formData.assignedDoctors,
          status: 'scheduled',
          beneficiaries: 0,
        }));

        setCamps((prevCamps) => [...prevCamps, ...newCamps]);
      } catch (error) {
        console.error("Error fetching camps:", error);
      }
    };

    fetchCamps();
  }, []); // Run only on component mount

  //////end of use effect
  const handleAddCamp = async() => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
   
    const endpoint =`${serverUrl}save_camp.php`

    const response = await axios.post(endpoint, {
      id: Date.now().toString(),
      campName: formData.campName,
      location: formData.location,
      date: formData.date,
      d1: formData.startTime,
      d2: formData.endTime,
      address: formData.address,
      expectedBeneficiaries: parseInt(formData.expectedPatients),
      doctors: formData.assignedDoctors,
      services: formData.services,
      description: formData.description,
      status: 'scheduled',
      beneficiaries: 0,
    });
    alert('Data has been added!!')
   const data = response.data;

const newCamps: Camp[] = data.posts.map((post: any) => ({
  id: post.id,
  location: post.location,
  date: post.DATE,
  time: `${post.startTime} - ${post.endTime}`,
  address: post.address,
  coordinator: post.coordinator,
  expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
  doctors: formData.assignedDoctors,
  status: 'scheduled',
  beneficiaries: 0,
}));

setCamps([...camps, ...newCamps]);

    setShowAddModal(false);
    setIsLoading(false);
    resetForm();
  };

  const handleEditCamp = async() => {
    if (!editingCamp) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
  
   
    
 const endpoint =`${serverUrl}update_camp.php`

    const response = await axios.post(endpoint, {
      id: formData.id,
      campName: formData.campName,
      location: formData.location,
      date: formData.date,
      d1: formData.startTime,
      d2: formData.endTime,
      address: formData.address,
      expectedBeneficiaries: parseInt(formData.expectedPatients),
      doctors: formData.assignedDoctors,
      services: formData.services,
      description: formData.description,
      status: 'scheduled',
      beneficiaries: 0,
    });
   alert('Data has been Updated!!')
   const data = response.data;


const newCamps: Camp[] = data.posts.map((post: any) => ({
  id: post.id,
  location: post.location,
  date: post.DATE,
  time: `${post.startTime} - ${post.endTime}`,
  address: post.address,
  coordinator: post.coordinator,
  expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
  doctors: formData.assignedDoctors,
  status: 'scheduled',
  beneficiaries: 0,
}));

setCamps([...camps, ...newCamps]);

   
    setEditingCamp(null);
    setIsLoading(false);
    resetForm();
  };

  const handleDeleteCamp = async() => {
       const endpoint =`${serverUrl}delete_camp.php`
    if (!deletingCamp) return;
  
    const response = await axios.post(endpoint, {
      id: deletingCamp.id,
  
    });
    alert('Data has been deleted!!')
   const data = response.data;

const newCamps: Camp[] = data.posts.map((post: any) => ({
  id: post.id,
  location: post.location,
  date: post.DATE,
  time: `${post.startTime} - ${post.endTime}`,
  address: post.address,
  coordinator: post.coordinator,
  expectedBeneficiaries: parseInt(post.expectedBeneficiaries, 10),
  doctors: formData.assignedDoctors,
  status: 'scheduled',
  beneficiaries: 0,
}));

setCamps([...camps, ...newCamps]);
 // setDeletingCamp(null);
   resetForm();
  };

  const resetForm = () => {
    setFormData({
      id:'0',
      campName: '',
      location: '',
      address: '',
      date: '',
      startTime: '',
      endTime: '',
      expectedPatients: '',
      description: '',
      services: [],
      assignedDoctors: []
    });
  };

  const openEditModal = (camp: Camp) => {
 
    setEditingCamp(camp);
    setFormData({
      id: camp.id,
      campName: camp.location, // Map location to campName for now
      location: camp.location,
      startTime: camp.time.split(' - ')[0] || '',
      endTime: camp.time.split(' - ')[1] || '',
      address: camp.address,
      date: camp.date,
      expectedPatients: camp.expectedBeneficiaries.toString(),
      assignedDoctors: camp.doctors,
      description: '',
      services: []
    });
    setShowAddModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const statusLabels = {
      scheduled: 'निर्धारित',
      ongoing: 'चल रहा',
      completed: 'पूर्ण',
      cancelled: 'रद्द',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'location',
      label: 'स्थान',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.address}</p>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'तारीख और समय',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{new Date(value).toLocaleDateString('en-IN')}</p>
          <p className="text-sm text-gray-500">{row.time}</p>
        </div>
      ),
    },
    {
      key: 'doctors',
      label: 'डॉक्टर',
      sortable: false,
      render: (value: string[]) => (
        <div className="space-y-1">
          {value.slice(0, 2).map(doctorId => {
            const doctor = getDoctorById(doctorId);
            return doctor ? (
              <p key={doctorId} className="text-sm text-gray-900">{doctor.name}</p>
            ) : null;
          })}
          {value.length > 2 && (
            <p className="text-xs text-gray-500">+{value.length - 2} और</p>
          )}
        </div>
      ),
    },
    {
      key: 'coordinator',
      label: 'समन्वयक',
    },
    {
      key: 'status',
      label: 'स्थिति',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'beneficiaries',
      label: 'लाभार्थी',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}/{row.expectedBeneficiaries}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-primary-500 h-2 rounded-full"
              style={{ width: `${Math.min((value / row.expectedBeneficiaries) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'कार्य',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => console.log('View camp:', row.id)}
            className="p-1 text-gray-400 hover:text-primary-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-1 text-gray-400 hover:text-primary-600"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setDeletingCamp(row);
              setShowConfirmDialog(true);
            }}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">स्वास्थ्य शिविर</h1>
          <p className="text-gray-600">स्वास्थ्य शिविरों का प्रबंधन और अनुसूची</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingCamp(null);
            resetForm();
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>नया शिविर जोड़ें</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">निर्धारित</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => camp.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">पूर्ण</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => camp.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">कुल लाभार्थी</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.reduce((sum, camp) => sum + camp.beneficiaries, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">इस महीने</p>
              <p className="text-2xl font-bold text-gray-900">
                {camps.filter(camp => 
                  new Date(camp.date).getMonth() === new Date().getMonth() &&
                  new Date(camp.date).getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camps Table */}
      <DataTable data={camps} columns={columns} />

      {/* Add/Edit Camp Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                 onClick={() => {
                   setShowAddModal(false);
                   setEditingCamp(null);
                   resetForm();
                 }} />
            
            <div className="inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* Modal Header - UPDATED: Changed to admin portal theme colors */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-8 w-8" />
                    <div>
                      <h1 className="text-2xl font-bold">
                        {editingCamp ? 'स्वास्थ्य शिविर संपादित करें' : 'नया स्वास्थ्य शिविर बनाएं'}
                      </h1>
                      <p className="text-primary-100 mt-1">
                        {editingCamp ? 'शिविर की जानकारी अपडेट करें' : 'नए स्वास्थ्य शिविर की जानकारी दर्ज करें'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCamp(null);
                      resetForm();
                    }}
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">बुनियादी जानकारी</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="campName" className="block text-sm font-medium text-gray-700 mb-2">
                          शिविर का नाम *
                        </label>
                        <input
                          type="text"
                          id="campName"
                          name="campName"
                          value={formData.campName}
                          onChange={handleInputChange}
                          className={`input-field ${errors.campName ? 'border-red-500' : ''}`}
                          placeholder="उदाहरण: दुर्ग स्वास्थ्य शिविर"
                        />
                        {errors.campName && (
                          <p className="mt-1 text-sm text-red-600">{errors.campName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                          स्थान *
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                          placeholder="उदाहरण: दुर्ग सामुदायिक केंद्र"
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        पूरा पता *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`input-field resize-none ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="शिविर का पूरा पता लिखें..."
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Doctor Assignment */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">डॉक्टर का चयन</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        नियुक्त डॉक्टर * (एक से अधिक डॉक्टर चुन सकते हैं)
                      </label>
                      
                      {/* Button to open doctor selection dialog */}
                      <button
                        type="button"
                        onClick={() => setShowDoctorDialog(true)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full md:w-auto"
                      >
                        <Plus className="h-4 w-4" />
                        <span>डॉक्टर चुनें</span>
                      </button>

                      {errors.assignedDoctors && (
                        <p className="mt-2 text-sm text-red-600">{errors.assignedDoctors}</p>
                      )}

                      {/* Selected doctors display - UPDATED: Changed to admin portal theme colors */}
                      {formData.assignedDoctors.length > 0 && (
                        <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                          <h4 className="text-sm font-medium text-primary-800 mb-3">
                            चयनित डॉक्टर ({formData.assignedDoctors.length}):
                          </h4>
                          <div className="space-y-2">
                            {formData.assignedDoctors.map(doctorId => {
                              const doctor = mockDoctors.find(d => d.id === doctorId);
                              return doctor ? (
                                <div key={doctor.id} className="flex items-center justify-between text-sm bg-white p-3 rounded border shadow-sm">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{doctor.name}</div>
                                    <div className="text-gray-600">{doctor.specialty}</div>
                                    <div className="text-xs text-gray-500">
                                      अनुभव: {doctor.experience} वर्ष | {doctor.qualification}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDoctorToggle(doctor.id)}
                                    className="ml-3 text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
                                  >
                                    हटाएं
                                  </button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">दिनांक और समय</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                          तारीख *
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                          शुरुआती समय *
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className={`input-field ${errors.startTime ? 'border-red-500' : ''}`}
                        />
                        {errors.startTime && (
                          <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                          समाप्ति समय *
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          className={`input-field ${errors.endTime ? 'border-red-500' : ''}`}
                        />
                        {errors.endTime && (
                          <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="expectedPatients" className="block text-sm font-medium text-gray-700 mb-2">
                          अपेक्षित मरीज़ *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="expectedPatients"
                            name="expectedPatients"
                            value={formData.expectedPatients}
                            onChange={handleInputChange}
                            min="1"
                            className={`input-field pr-10 ${errors.expectedPatients ? 'border-red-500' : ''}`}
                            placeholder="50"
                          />
                          <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.expectedPatients && (
                          <p className="mt-1 text-sm text-red-600">{errors.expectedPatients}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services checkbox - UPDATED: Changed to admin portal theme colors */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">उपलब्ध सेवाएं *</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableServices.map((service) => (
                        <label key={service} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{service}</span>
                        </label>
                      ))}
                    </div>
                    {errors.services && (
                      <p className="mt-2 text-sm text-red-600">{errors.services}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      अतिरिक्त विवरण
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input-field resize-none"
                      placeholder="शिविर के बारे में अतिरिक्त जानकारी..."
                    />
                  </div>
                </form>
              </div>

              {/* Modal Footer - UPDATED: Changed save button to admin portal theme colors */}
              <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCamp(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={editingCamp ? handleEditCamp : handleAddCamp}
                  disabled={isLoading}
                  className={`px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>सहेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingCamp ? 'शिविर अपडेट करें' : 'शिविर बनाएं'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Selection Dialog */}
      {showDoctorDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDoctorDialog(false);
              setSearchTerm('');
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">डॉक्टर चुनें</h3>
              <button
                onClick={() => setShowDoctorDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Bar - UPDATED: Changed focus colors to admin portal theme */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="डॉक्टर का नाम, विशेषता या योग्यता खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Doctor List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <label
                      key={doctor.id}
                      className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedDoctors.includes(doctor.id)}
                        onChange={() => handleDoctorToggle(doctor.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-600">{doctor.specialty}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          अनुभव: {doctor.experience} वर्ष | {doctor.qualification}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          📞 {doctor.phone} | 📧 {doctor.email}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">कोई डॉक्टर नहीं मिला</div>
                    <div className="text-xs mt-1">अपना खोज शब्द बदलकर पुनः प्रयास करें</div>
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer - UPDATED: Changed complete button to admin portal theme colors */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {formData.assignedDoctors.length} डॉक्टर चयनित
                </div>
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDoctorDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorDialog(false);
                      setSearchTerm('');
                    }}
                    className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    पूर्ण
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteCamp}
        title="शिविर हटाएं"
        message={`क्या आप वाकई ${deletingCamp?.location} स्थान पर शिविर को हटाना चाहते हैं? यह कार्य वापस नहीं किया जा सकता।`}
        type="danger"
        confirmText="हटाएं"
        cancelText="रद्द करें"
      />
    </div>
  );
};

export default Camps;
