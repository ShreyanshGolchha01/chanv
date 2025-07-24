import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ProfileScreenProps {
  onBack?: () => void;
  onLogout?: () => void;
}

interface UserData {
  id: string;
  name: string;
  fullname: string;
  designation: string;
  department: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfJoining: string;
  bloodGroup: string;
  emergencyContact: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  familyMembers: number;
  hasAbhaId: boolean;
  hasAyushmanCard: boolean;
}

interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  dateOfBirth: string;
  age: number;
  bloodGroup: string;
  gender: string;
  phoneNumber: string;
  healthId: string;
  aadharNumber?: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout }) => {
  const [userData, setUserData] = useState<UserData>({
    id: '',
    name: '',
    fullname: '',
    designation: 'Employee',
    department: '',
    phoneNumber: '',
    email: '',
    address: '',
    dateOfJoining: '',
    bloodGroup: '',
    emergencyContact: '',
    dateOfBirth: '',
    age: 0,
    gender: '',
    familyMembers: 0,
    hasAbhaId: false,
    hasAyushmanCard: false
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    dateOfBirth: '',
    age: '',
    bloodGroup: '',
    gender: '',
    phoneNumber: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://192.168.1.6/chanv/show_Patients.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      
      if (data.posts && data.posts.length > 0) {
        const userData = data.posts[0];
        
        setUserData({
          id: userData.id.toString(),
          name: userData.fullname || userData.name,
          fullname: userData.fullname || userData.name,
          designation: 'Employee',
          department: userData.department,
          phoneNumber: userData.phoneNumber || userData.phone,
          email: userData.email,
          address: userData.address,
          dateOfJoining: '',
          bloodGroup: userData.bloodGroup,
          emergencyContact: '',
          dateOfBirth: userData.dateOfBirth,
          age: userData.age,
          gender: userData.gender,
          familyMembers: userData.familyMembers || userData.familymember,
          hasAbhaId: userData.hasAbhaId,
          hasAyushmanCard: userData.hasAyushmanCard
        });

        // If your API returns family members, you can set them here
        // For now, we'll keep the local family members functionality
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

// // const renderFamilyMember = (member: FamilyMember) => (
//   <LinearGradient
//     key={member.id.toString()}
//     colors={COLORS.gradients.card.colors}
//     start={COLORS.gradients.card.start}
//     end={COLORS.gradients.card.end}
//     style={styles.familyMemberCard}
//   >
//     <View style={styles.memberHeader}>
//       <LinearGradient
//         colors={COLORS.gradients.accent.colors}
//         start={COLORS.gradients.accent.start}
//         end={COLORS.gradients.accent.end}
//         style={styles.memberAvatar}
//       >
//         <MaterialIcons 
//           name="account-circle" 
//           size={24} 
//           color={COLORS.white} 
//         />
//       </LinearGradient>
//       <View style={styles.memberInfo}>
//         <Text style={styles.memberName}>{member.name}</Text>
//         <Text style={styles.memberRelation}>{member.relation}</Text>
//       </View>
//       <View style={styles.memberAge}>
//         <Text style={styles.ageText}>{member.age} वर्ष</Text>
//       </View>
//     </View>

//     <View style={styles.memberDetails}>
//       {member.bloodGroup && (
//         <View style={styles.memberDetailRow}>
//           <MaterialIcons name="opacity" size={14} color={COLORS.error} />
//           <Text style={styles.memberDetailText}>ब्लड ग्रुप: {member.bloodGroup}</Text>
//         </View>
//       )}
      
//       {member.phoneNumber && (
//         <View style={styles.memberDetailRow}>
//           <MaterialIcons name="phone" size={14} color={COLORS.healthBlue} />
//           <Text style={styles.memberDetailText}>फोन: {member.phoneNumber}</Text>
//         </View>
//       )}
      
//       {member.aadharNumber && (
//         <View style={styles.memberDetailRow}>
//           <MaterialIcons name="credit-card" size={14} color={COLORS.primary} />
//           <Text style={styles.memberDetailText}>आधार: {member.aadharNumber}</Text>
//         </View>
//       )}
      
//       <View style={styles.memberDetailRow}>
//         <MaterialIcons name="local-hospital" size={14} color={COLORS.accent} />
//         <Text style={styles.memberDetailText}>हेल्थ ID: {member.healthId}</Text>
//       </View>

//       {member.gender && (
//         <View style={styles.memberDetailRow}>
//           <MaterialIcons name="person" size={14} color={COLORS.accent} />
//           <Text style={styles.memberDetailText}>लिंग: {member.gender}</Text>
//         </View>
//       )}

//       {member.dateOfBirth && (
//         <View style={styles.memberDetailRow}>
//           <MaterialIcons name="cake" size={14} color={COLORS.warning} />
//           <Text style={styles.memberDetailText}>जन्म तारीख: {member.dateOfBirth}</Text>
//         </View>
//       )}
//     </View>

//     <TouchableOpacity 
//       style={styles.editMemberButton}
//       onPress={() => Alert.alert('संपादित करें', `${member.name} की जानकारी संपादित करें`)}
//       activeOpacity={0.8}
//     >
//       <MaterialIcons name="edit" size={16} color={COLORS.primary} />
//       <Text style={styles.editMemberText}>संपादित करें</Text>
//     </TouchableOpacity>
//   </LinearGradient>
// // );
   const handleAddMember = () => {
    if (newMember.name && newMember.relation && newMember.age) {
      const member: FamilyMember = {
        id: familyMembers.length + 1,
        name: newMember.name,
        relation: newMember.relation,
        dateOfBirth: newMember.dateOfBirth,
        age: parseInt(newMember.age),
        bloodGroup: newMember.bloodGroup,
        gender: newMember.gender,
        phoneNumber: newMember.phoneNumber,
        healthId: `FAM00${familyMembers.length + 1}`
      };
      setFamilyMembers([...familyMembers, member]);
      setNewMember({
        name: '',
        relation: '',
        dateOfBirth: '',
        age: '',
        bloodGroup: '',
        gender: '',
        phoneNumber: ''
      });
      setShowAddMemberModal(false);
      Alert.alert('सफलता', 'परिवारिक सदस्य सफलतापूर्वक जोड़ा गया।');
    } else {
      Alert.alert('त्रुटि', 'कृपया सभी आवश्यक फील्ड भरें।');
    }
  };
   const renderEmployeeDetails = () => (
    <LinearGradient
      colors={COLORS.gradients.card.colors}
      start={COLORS.gradients.card.start}
      end={COLORS.gradients.card.end}
      style={styles.employeeCard}
    >
      <View style={styles.employeeHeader}>
        <LinearGradient
          colors={COLORS.gradients.primary.colors}
          start={COLORS.gradients.primary.start}
          end={COLORS.gradients.primary.end}
          style={styles.employeeAvatar}
        >
          <MaterialIcons name="account-circle" size={40} color={COLORS.white} />
        </LinearGradient>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{userData.fullname || userData.name}</Text>
          <Text style={styles.employeeDesignation}>{userData.designation}</Text>
          <Text style={styles.employeeDepartment}>{userData.department}</Text>
        </View>
        <LinearGradient
          colors={['#27ae60', '#2ecc71']}
          style={styles.statusBadge}
        >
          <Text style={styles.statusText}>सक्रिय</Text>
        </LinearGradient>
      </View>

      <View style={styles.employeeDetails}>
        <View style={styles.detailRow}>
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.primary + '10']}
            style={styles.detailIcon}
          >
            <MaterialIcons name="work" size={25} color={COLORS.primary} />
          </LinearGradient>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>विभाग</Text>
            <Text style={styles.detailValue}>{userData.department}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <LinearGradient
            colors={[COLORS.healthBlue + '20', COLORS.healthBlue + '10']}
            style={styles.detailIcon}
          >
            <MaterialIcons name="phone" size={25} color={COLORS.healthBlue} />
          </LinearGradient>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>फोन नंबर</Text>
            <Text style={styles.detailValue}>{userData.phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <LinearGradient
            colors={[COLORS.accent + '20', COLORS.accent + '10']}
            style={styles.detailIcon}
          >
            <MaterialIcons name="mail" size={25} color={COLORS.accent} />
          </LinearGradient>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>ईमेल</Text>
            <Text style={styles.detailValue}>{userData.email}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <LinearGradient
            colors={[COLORS.healthGreen + '20', COLORS.healthGreen + '10']}
            style={styles.detailIcon}
          >
            <MaterialIcons name="place" size={25} color={COLORS.healthGreen} />
          </LinearGradient>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>पता</Text>
            <Text style={styles.detailValue}>{userData.address}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <LinearGradient
            colors={[COLORS.warning + '20', COLORS.warning + '10']}
            style={styles.detailIcon}
          >
            <MaterialIcons name="cake" size={25} color={COLORS.warning} />
          </LinearGradient>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>जन्म तारीख</Text>
            <Text style={styles.detailValue}>{userData.dateOfBirth}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <LinearGradient
            colors={[COLORS.error + '20', COLORS.error + '10']}
            style={styles.detailIcon}
          >
            <MaterialIcons name="opacity" size={25} color={COLORS.error} />
          </LinearGradient>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>ब्लड ग्रुप</Text>
            <Text style={styles.detailValue}>{userData.bloodGroup}</Text>
          </View>
        </View>

        {userData.hasAbhaId && (
          <View style={styles.detailRow}>
            <LinearGradient
              colors={[COLORS.healthBlue + '20', COLORS.healthBlue + '10']}
              style={styles.detailIcon}
            >
              <MaterialIcons name="credit-card" size={25} color={COLORS.healthBlue} />
            </LinearGradient>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>ABHA ID</Text>
              <Text style={styles.detailValue}>Registered</Text>
            </View>
          </View>
        )}

        {userData.hasAyushmanCard && (
          <View style={styles.detailRow}>
            <LinearGradient
              colors={[COLORS.healthGreen + '20', COLORS.healthGreen + '10']}
              style={styles.detailIcon}
            >
              <MaterialIcons name="local-hospital" size={25} color={COLORS.healthGreen} />
            </LinearGradient>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ayushman Card</Text>
              <Text style={styles.detailValue}>Available</Text>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>कर्मचारी विवरण</Text>
          {renderEmployeeDetails()}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>परिवारिक सदस्य</Text>
            <TouchableOpacity 
              style={styles.addIconButton}
              onPress={() => setShowAddMemberModal(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.gradients.primary.colors}
                start={COLORS.gradients.primary.start}
                end={COLORS.gradients.primary.end}
                style={styles.addIconGradient}
              >
                <MaterialIcons name="person-add" size={18} color={COLORS.white} />
                <Text style={styles.addIconText}>नया सदस्य जोड़ें</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {/* {familyMembers.map(renderFamilyMember)} */}
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'लॉगआउट',
                'क्या आप वाकई लॉगआउट करना चाहते हैं?',
                [
                  { text: 'रद्द करें', style: 'cancel' },
                  { text: 'लॉगआउट', style: 'destructive', onPress: onLogout }
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradients.primary.colors}
              start={COLORS.gradients.primary.start}
              end={COLORS.gradients.primary.end}
              style={styles.logoutGradient}
            >
              <MaterialIcons name="logout" size={24} color={COLORS.white} />
              <Text style={styles.logoutText}>लॉगआउट करें</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addIconButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  addIconGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  addIconText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  employeeCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.large,
    elevation: 8,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  employeeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  employeeDesignation: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  employeeDepartment: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  employeeDetails: {
    marginTop: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
  },
  familyMemberCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    elevation: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  memberRelation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
  },
  memberAge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  ageText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  memberDetails: {
    marginBottom: SPACING.md,
  },
  memberDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  memberDetailText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  editMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  editMemberText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  modalForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[400],
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },
  addButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  logoutButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  logoutText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen;
