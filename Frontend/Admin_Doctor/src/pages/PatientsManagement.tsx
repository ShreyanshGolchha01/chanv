import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Heart,
  Calendar,
  Phone,
  MapPin,
  UserPlus,
  Edit,
  Eye
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  bloodGroup: string;
  address: string;
  lastVisit: string;
  healthStatus: 'good' | 'fair' | 'poor';
  familyMembers: number;
  // yaha se changes start hue hai
  department: string;
  hasAbhaId: 'yes' | 'no';
  hasAyushmanCard: 'yes' | 'no';
  // niche yaha tak hue hai
}

const PatientsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [newPatient, setNewPatient] = useState({
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bloodGroup: '',
    address: '',
    familyMembers: '',
    department: '',
    hasAbhaId: 'no' as 'yes' | 'no',
    hasAyushmanCard: 'no' as 'yes' | 'no'
  });

  // Function to auto-generate password
  const generatePassword = (name: string, phone: string) => {
    if (name.length >= 4 && phone.length >= 4) {
      const firstFourLetters = name.substring(0, 4);
      const lastFourDigits = phone.slice(-4);
      return firstFourLetters + lastFourDigits;
    }
    return '';
  };

  // Function to format date to DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to parse DD/MM/YYYY back to YYYY-MM-DD for input
  const parseDDMMYYYYToDate = (ddmmyyyy: string) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 10) return '';
    const [day, month, year] = ddmmyyyy.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Empty patients data - Connect to your backend
  const [patients, setPatients] = useState<Patient[]>([]);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'good' && patient.healthStatus === 'good') ||
                         (selectedFilter === 'fair' && patient.healthStatus === 'fair') ||
                         (selectedFilter === 'poor' && patient.healthStatus === 'poor') ||
                         (selectedFilter === 'male' && patient.gender === 'male') ||
                         (selectedFilter === 'female' && patient.gender === 'female') ||
                         (selectedFilter === 'recent' && (() => {
                           const lastVisit = new Date(patient.lastVisit);
                           const today = new Date();
                           const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
                           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                           return diffDays <= 7;
                         })());
    
    return matchesSearch && matchesFilter;
  });
  

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'अच्छी';
      case 'fair':
        return 'सामान्य';
      case 'poor':
        return 'खराब';
      default:
        return 'अज्ञात';
    }
  };

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    
    // yaha se changes start hue hai
    // Validation
    if (!newPatient.name || !newPatient.phone || !newPatient.password || !newPatient.dateOfBirth || !newPatient.address || !newPatient.department) {
      alert('कृपया सभी आवश्यक फ़ील्ड भरें');
      return;
    }
    // Email validation (only if email is provided)
    if (newPatient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.email)) {
      alert('कृपया एक वैध ईमेल पता दर्ज करें');
      return;
    }
    // Phone number must be exactly 10 digits
    if (!/^\d{10}$/.test(newPatient.phone)) {
      alert('फोन नंबर 10 अंकों का होना चाहिए');
      return;
    }
    // Password validation
    if (newPatient.password.length < 6) {
      alert('पासवर्ड कम से कम 6 अक्षर का होना चाहिए');
      return;
    }
    // niche yaha tak hue hai

    // Create new patient object
    const patient: Patient = {
      id: (patients.length + 1).toString(),
      email: newPatient.email,
      phone: newPatient.phone,
      password: newPatient.password,
      dateOfBirth: newPatient.dateOfBirth,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      bloodGroup: newPatient.bloodGroup,
      address: newPatient.address,
      lastVisit: new Date().toISOString().split('T')[0],
      healthStatus: 'fair',
      familyMembers: parseInt(newPatient.familyMembers) || 0,
      department: newPatient.department,
      hasAbhaId: newPatient.hasAbhaId,
      hasAyushmanCard: newPatient.hasAyushmanCard
    };

    // Add patient to list
    setPatients([...patients, patient]);
    
    // Reset form
    setNewPatient({
      email: '',
      phone: '',
      password: '',
      dateOfBirth: '',
      name: '',
      age: '',
      gender: 'male',
      bloodGroup: '',
      address: '',
      familyMembers: '',
      department: '',
      hasAbhaId: 'no',
      hasAyushmanCard: 'no'
    });
    
    // Close modal
    setShowAddPatient(false);
    
    alert('मरीज़ सफलतापूर्वक जोड़ा गया!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>वापस डैशबोर्ड पर जाएं</span>
          </button>
        </div>
      </div> */}

      {/* Page Title */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">मरीज़ प्रबंधन</h1>
              <p className="text-green-100 mt-1">
                सभी मरीजों की जानकारी और स्वास्थ्य रिकॉर्ड देखें
              </p>
            </div>
          </div>
          {/* <div className="text-right">
            <p className="text-2xl font-bold">{patients.length}</p>
            <p className="text-green-100 text-sm">कुल मरीज़</p>
          </div> */}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{patients.length}</div>
            <div className="text-sm text-gray-600">कुल मरीज़</div>
          </div>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => {
                const lastVisit = new Date(p.lastVisit);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </div>
            <div className="text-sm text-gray-600">हाल के मरीज़</div>
          </div>  
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => {
                const lastVisit = new Date(p.lastVisit);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length}
            </div>
            <div className="text-sm text-gray-600">इस सप्ताह मिले</div>
          </div>
        </div>
        
        <div className="card border border-gray-400 text-center">
          <div className="p-6">
            <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {patients.reduce((sum, p) => sum + p.familyMembers, 0)}
            </div>
            <div className="text-sm text-gray-600">कुल पारिवारिक सदस्य</div>
          </div>
        </div>
      </div>

      {/* Search and Add Patient */}
      <div className="card border border-gray-400">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="मरीज़ खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">सभी मरीज़ ({patients.length})</option>
              {/* <option value="good">स्वस्थ मरीज़ ({patients.filter(p => p.healthStatus === 'good').length})</option> */}
              {/* <option value="fair">सामान्य स्वास्थ्य ({patients.filter(p => p.healthStatus === 'fair').length})</option> */}
              {/* <option value="poor">खराब स्वास्थ्य ({patients.filter(p => p.healthStatus === 'poor').length})</option> */}
              <option value="male">पुरुष मरीज़ ({patients.filter(p => p.gender === 'male').length})</option>
              <option value="female">महिला मरीज़ ({patients.filter(p => p.gender === 'female').length})</option>
              <option value="recent">हाल के मरीज़ ({patients.filter(p => {
                const lastVisit = new Date(p.lastVisit);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              }).length})</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                साफ़ करें
              </button>
            )}

            {/* Add Patient Button */}
            <button
              onClick={() => setShowAddPatient(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>नया मरीज़ जोड़ें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="card border border-gray-400">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            मरीजों की सूची ({filteredPatients.length} परिणाम)
          </h3>
        </div>

        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{patient.age} वर्ष • {patient.gender === 'male' ? 'पुरुष' : patient.gender === 'female' ? 'महिला' : 'अन्य'}</span>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{patient.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">अंतिम जांच:</span>
                      <span className="font-medium">
                        {new Date(patient.lastVisit).toLocaleDateString('hi-IN')}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">स्वास्थ्य स्थिति:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(patient.healthStatus)}`}>
                        {getHealthStatusText(patient.healthStatus)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{patient.familyMembers} पारिवारिक सदस्य</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">ABHA:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${patient.hasAbhaId === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {patient.hasAbhaId === 'yes' ? 'हाँ' : 'नहीं'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">आयुष्मान:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${patient.hasAyushmanCard === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {patient.hasAyushmanCard === 'yes' ? 'हाँ' : 'नहीं'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/doctor/health-records?patient=${patient.id}`)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="स्वास्थ्य रिकॉर्ड देखें"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => alert('संपादन सुविधा जल्द आ रही है')}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="संपादित करें"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">कोई मरीज़ नहीं मिला</h3>
              <p className="text-gray-600">
                आपके खोज मापदंड के अनुसार कोई मरीज़ नहीं मिला।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">नया मरीज़ जोड़ें</h3>
              <button
                onClick={() => setShowAddPatient(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मरीज़ का नाम *
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setNewPatient({...newPatient, name: newName});
                    
                    // Auto-generate password when name is entered
                    if (newName.length >= 4 && newPatient.phone.length >= 4) {
                      const autoPassword = generatePassword(newName, newPatient.phone);
                      setNewPatient(prev => ({...prev, name: newName, password: autoPassword}));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="पूरा नाम दर्ज करें"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ईमेल पता
                </label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="example@email.com (वैकल्पिक)"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  फोन नंबर *
                </label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setNewPatient({...newPatient, phone: newPhone});
                    
                    // Auto-generate password when phone number is entered
                    if (newPhone.length >= 4 && newPatient.name.length >= 4) {
                      const autoPassword = generatePassword(newPatient.name, newPhone);
                      setNewPatient(prev => ({...prev, phone: newPhone, password: autoPassword}));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="10 अंकों का मोबाइल नंबर"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पासवर्ड * (स्वचालित जेनरेट)
                </label>
                <input
                  type="text"
                  value={newPatient.password}
                  onChange={(e) => setNewPatient({...newPatient, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                  placeholder="नाम + फोन नंबर से जेनरेट होगा"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">नाम के पहले 4 अक्षर + फोन के अंतिम 4 अंक</p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  जन्म तिथि * (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={newPatient.dateOfBirth ? formatDateToDDMMYYYY(newPatient.dateOfBirth) : ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and /
                    const cleanValue = value.replace(/[^0-9/]/g, '');
                    
                    // Auto-format as DD/MM/YYYY
                    let formattedValue = cleanValue;
                    if (cleanValue.length === 2 && !cleanValue.includes('/')) {
                      formattedValue = cleanValue + '/';
                    } else if (cleanValue.length === 5 && cleanValue.split('/').length === 2) {
                      formattedValue = cleanValue + '/';
                    }
                    
                    // If complete date, convert to YYYY-MM-DD for storage
                    if (formattedValue.length === 10) {
                      const dateValue = parseDDMMYYYYToDate(formattedValue);
                      setNewPatient({...newPatient, dateOfBirth: dateValue});
                      
                      // Auto calculate age from date of birth
                      if (dateValue) {
                        const birthDate = new Date(dateValue);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        setNewPatient(prev => ({...prev, dateOfBirth: dateValue, age: age.toString()}));
                      }
                    } else {
                      // For incomplete dates, just store the formatted value temporarily
                      setNewPatient(prev => ({...prev, dateOfBirth: ''}));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  required
                />
              </div>

              {/* Age (Auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  उम्र (स्वचालित गणना)
                </label>
                <input
                  type="number"
                  value={newPatient.age}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  placeholder="जन्म तिथि से गणना होगी"
                  readOnly
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  लिंग *
                </label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({...newPatient, gender: e.target.value as 'male' | 'female' | 'other'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="male">पुरुष</option>
                  <option value="female">महिला</option>
                  <option value="other">अन्य</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  रक्त समूह
                </label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({...newPatient, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">रक्त समूह चुनें (वैकल्पिक)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  विभाग चुनें *
                </label>
                <select
                  value={newPatient.department}
                  onChange={(e) => setNewPatient({...newPatient, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">विभाग चुनें</option>
                  <option value="सामान्य प्रशासन विभाग">सामान्य प्रशासन विभाग</option>
                  <option value="गृह विभाग">गृह विभाग</option>
                  <option value="वित्त विभाग">वित्त विभाग</option>
                  <option value="स्वास्थ्य एवं परिवार कल्याण विभाग">स्वास्थ्य एवं परिवार कल्याण विभाग</option>
                  <option value="स्कूल शिक्षा विभाग">स्कूल शिक्षा विभाग</option>
                  <option value="उच्च शिक्षा विभाग">उच्च शिक्षा विभाग</option>
                  <option value="तकनीकी शिक्षा विभाग">तकनीकी शिक्षा विभाग</option>
                  <option value="वन विभाग">वन विभाग</option>
                  <option value="राजस्व एवं आपदा प्रबंधन विभाग">राजस्व एवं आपदा प्रबंधन विभाग</option>
                  <option value="खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग">खाद्य, नागरिक आपूर्ति एवं उपभोक्ता संरक्षण विभाग</option>
                  <option value="कृषि विभाग">कृषि विभाग</option>
                  <option value="पंचायत एवं ग्रामीण विकास विभाग">पंचायत एवं ग्रामीण विकास विभाग</option>
                  <option value="श्रम विभाग">श्रम विभाग</option>
                  <option value="महिला एवं बाल विकास विभाग">महिला एवं बाल विकास विभाग</option>
                  <option value="जनजातीय कार्य विभाग">जनजातीय कार्य विभाग</option>
                  <option value="अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग">अनुसूचित जाति एवं अन्य पिछड़ा वर्ग विकास विभाग</option>
                  <option value="ऊर्जा विभाग">ऊर्जा विभाग</option>
                  <option value="जल संसाधन विभाग">जल संसाधन विभाग</option>
                  <option value="लोक निर्माण विभाग">लोक निर्माण विभाग</option>
                  <option value="परिवहन विभाग">परिवहन विभाग</option>
                  <option value="नगर प्रशासन विभाग">नगर प्रशासन विभाग</option>
                  <option value="सूचना प्रौद्योगिकी विभाग">सूचना प्रौद्योगिकी विभाग</option>
                  <option value="पर्यटन विभाग">पर्यटन विभाग</option>
                  <option value="खेल एवं युवा कल्याण विभाग">खेल एवं युवा कल्याण विभाग</option>
                  <option value="उद्योग विभाग">उद्योग विभाग</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पता *
                </label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="पूरा पता दर्ज करें"
                  rows={2}
                  required
                />
              </div>

              {/* Family Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पारिवारिक सदस्यों की संख्या
                </label>
                <input
                  type="number"
                  value={newPatient.familyMembers}
                  onChange={(e) => setNewPatient({...newPatient, familyMembers: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="कुल पारिवारिक सदस्य"
                  min="0"
                  max="20"
                />
              </div>

              {/* ABHA ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  क्या आपका ABHA ID बना है? *
                </label>
                <select
                  value={newPatient.hasAbhaId}
                  onChange={(e) => setNewPatient({...newPatient, hasAbhaId: e.target.value as 'yes' | 'no'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="no">नहीं</option>
                  <option value="yes">हाँ</option>
                </select>
              </div>

              {/* Ayushman Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  क्या आपका आयुष्मान कार्ड बना है? *
                </label>
                <select
                  value={newPatient.hasAyushmanCard}
                  onChange={(e) => setNewPatient({...newPatient, hasAyushmanCard: e.target.value as 'yes' | 'no'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="no">नहीं</option>
                  <option value="yes">हाँ</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  मरीज़ जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsManagement;
