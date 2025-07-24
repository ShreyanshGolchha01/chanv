import React, { useState, useEffect } from 'react';
import serverUrl from '../services/Server';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';

// Empty medical report data - Connect to your backend
const medicalReportData = {
  campInfo: {
    date: '',
    location: '',
    campType: '',
    doctor: '',
    time: ''
  },
  employeeReport: {
    name: '',
    employeeId: '',
    age: 0,
    bloodGroup: '',
    tests: []
  },
  familyReports: []
};

interface ReportDetailsScreenProps {
  onBack: () => void;
  reportData?: any;
}

const ReportDetailsScreen: React.FC<ReportDetailsScreenProps> = ({ onBack, reportData }) => {
  const [activeTab, setActiveTab] = useState('employee');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<any>(null);
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);

const [id,setId] = useState('');

useEffect(() => {
  const showCid = async () => {
    try {
      const cid = await AsyncStorage.getItem('cid');
      setId(""+cid)
    } catch (e) {
     
    }
  };

  showCid();
}, []);


const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

//=========================
useEffect(() => {
  const fetchReports = async () => {
    try {
      const response = await fetch(serverUrl + "get_report.php?patientId=" + id);
      const data = await response.json();

      if (data.success && Array.isArray(data.reports)) {
        setReportDetails(data.reports);  // ✅ update state here
      } else {
        console.warn("No reports found or response format incorrect.");
        setReportDetails([]); // set empty array if no data
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };
//
  if (id) {
    fetchReports();
  }
}, [id]);


const ReportCard = ({ reports }: { reports: any[] }) => {
  if (!Array.isArray(reports) || reports.length === 0) {
    return <Text style={styles.noReports}>No reports available</Text>;
  }
};
///==============================
//
  // Remove backend integration - data will be loaded locally  
  useEffect(() => {
    // Component initialization without API calls
    setLoading(false);
  }, [reportData]);

  // Use real data if available, fallback to empty structure
  const currentReportData = reportDetails || medicalReportData;
  const sortedFamilyMembers = currentReportData.familyReports || [];

  // When you connect to backend, replace this with actual reports array
  const reportsArray = [currentReportData]; // This will be replaced with backend data

  const handlePreviousReport = () => {
    if (currentReportIndex > 0) {
      setCurrentReportIndex(currentReportIndex - 1);
    }
  };

  const handleNextReport = () => {
    if (currentReportIndex < reportsArray.length - 1) {
      setCurrentReportIndex(currentReportIndex + 1);
    }
  };

  const renderFamilyMemberCard = (member: any) => (
    <TouchableOpacity
      key={member.name}
      style={styles.familyMemberCard}
      onPress={() => setSelectedFamilyMember(member)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={COLORS.gradients.card.colors}
        start={COLORS.gradients.card.start}
        end={COLORS.gradients.card.end}
        style={styles.memberCardGradient}
      >
        <View style={styles.memberCardHeader}>
          <LinearGradient
            colors={COLORS.gradients.accent.colors}
            start={COLORS.gradients.accent.start}
            end={COLORS.gradients.accent.end}
            style={styles.memberCardAvatar}
          >
            <FontAwesome5 
              name={member.relation === 'पत्नी' ? 'female' : 
                    member.relation === 'पुत्र' ? 'male' : 
                    member.relation === 'पुत्री' ? 'female' : 'user'} 
              size={24} 
              color={COLORS.white} 
            />
          </LinearGradient>
          
          <View style={styles.memberCardInfo}>
            <Text style={styles.memberCardName}>{member.name}</Text>
            <Text style={styles.memberCardRelation}>{member.relation}</Text>
            <View style={styles.memberCardDetails}>
              <Text style={styles.memberCardDetailText}>उम्र: {member.age} वर्ष</Text>
              <Text style={styles.memberCardDetailText}>ब्लड ग्रुप: {member.bloodGroup}</Text>
            </View>
          </View>
          
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.primary + '10']}
            style={styles.viewDetailsIcon}
          >
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </LinearGradient>
        </View>
        
        <View style={styles.memberCardFooter}>
          <View style={styles.testsSummary}>
            <LinearGradient
              colors={['#27ae60', '#2ecc71']}
              style={styles.testsCountBadge}
            >
              <Text style={styles.testsCountText}>{member.tests.length} टेस्ट</Text>
            </LinearGradient>
            <Text style={styles.testsSummaryText}>रिपोर्ट देखने के लिए क्लिक करें</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFamilyMembersList = () => (
    <View style={styles.familyListContainer}>
      <View style={styles.familyListHeader}>
        <Text style={styles.familyListTitle}>परिवारिक सदस्य (उम्र के अनुसार)</Text>
        <Text style={styles.familyListSubtitle}>किसी भी सदस्य की विस्तृत रिपोर्ट देखने के लिए उन पर क्लिक करें</Text>
      </View>
      {sortedFamilyMembers.map(renderFamilyMemberCard)}
    </View>
  );

  const renderSelectedMemberDetails = () => {
    if (!selectedFamilyMember) return null;
    
    return (
      <View style={styles.selectedMemberContainer}>
        <TouchableOpacity 
          style={styles.backToListButton}
          onPress={() => setSelectedFamilyMember(null)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.gradients.secondary.colors}
            start={COLORS.gradients.secondary.start}
            end={COLORS.gradients.secondary.end}
            style={styles.backToListGradient}
          >
            <Ionicons name="arrow-back" size={16} color={COLORS.white} />
            <Text style={styles.backToListText}>सभी सदस्य देखें</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {renderPersonCard(selectedFamilyMember, false)}
      </View>
    );
  };

  const renderTestResult = (test: any) => (
    <LinearGradient
      key={test.name}
      colors={COLORS.gradients.card.colors}
      start={COLORS.gradients.card.start}
      end={COLORS.gradients.card.end}
      style={styles.testCard}
    >
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{test.name}</Text>
        <LinearGradient
          colors={test.status === 'सामान्य' ? 
            ['#27ae60', '#2ecc71'] : 
            test.status === 'ध्यान दें' ?
            ['#f39c12', '#e67e22'] :
            ['#e74c3c', '#c0392b']}
          style={styles.statusBadge}
        >
          <Text style={styles.statusText}>{test.status}</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.testDetails}>
        <View style={styles.testRow}>
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.primary + '10']}
            style={styles.testIcon}
          >
            <FontAwesome5 name="chart-line" size={14} color={COLORS.primary} />
          </LinearGradient>
          <View style={styles.testInfo}>
            <Text style={styles.testLabel}>परिणाम</Text>
            <Text style={styles.testValue}>{test.value}</Text>
          </View>
        </View>
        
        <View style={styles.testRow}>
          <LinearGradient
            colors={[COLORS.info + '20', COLORS.info + '10']}
            style={styles.testIcon}
          >
            <MaterialIcons name="info" size={14} color={COLORS.info} />
          </LinearGradient>
          <View style={styles.testInfo}>
            <Text style={styles.testLabel}>सामान्य सीमा</Text>
            <Text style={styles.normalRange}>{test.normalRange}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderPersonCard = (person: any, isEmployee: boolean = false) => (
    <View style={styles.personSection}>
      <LinearGradient
        colors={COLORS.gradients.primary.colors}
        start={COLORS.gradients.primary.start}
        end={COLORS.gradients.primary.end}
        style={styles.personHeader}
      >
        <LinearGradient
          colors={COLORS.gradients.accent.colors}
          start={COLORS.gradients.accent.start}
          end={COLORS.gradients.accent.end}
          style={styles.personAvatar}
        >
          <FontAwesome5 
            name={isEmployee ? 'user-tie' : 
                  person.relation === 'पत्नी' ? 'female' : 
                  person.relation === 'पुत्र' ? 'male' : 
                  person.relation === 'पुत्री' ? 'female' : 'user'} 
            size={28} 
            color={COLORS.white} 
          />
        </LinearGradient>
        
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          {isEmployee ? (
            <Text style={styles.personRole}>कर्मचारी ID: {person.employeeId}</Text>
          ) : (
            <Text style={styles.personRole}>{person.relation}</Text>
          )}
          <View style={styles.personDetails}>
            <Text style={styles.personDetailText}>उम्र: {person.age} वर्ष</Text>
            <Text style={styles.personDetailText}>ब्लड ग्रुप: {person.bloodGroup}</Text>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.testsContainer}>
        {person.tests.map(renderTestResult)}
      </View>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'employee') {
      return renderPersonCard(medicalReportData.employeeReport, true);
    } else {
      if (selectedFamilyMember) {
        return renderSelectedMemberDetails();
      } else {
        return renderFamilyMembersList();
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Camp Info Card with Carousel */}
      <LinearGradient
        colors={COLORS.gradients.card.colors}
        start={COLORS.gradients.card.start}
        end={COLORS.gradients.card.end}
        style={styles.campInfoCard}
      >
        {/* Carousel Navigation */}
        <View style={styles.carouselHeader}>
          <TouchableOpacity 
            style={[styles.carouselButton, currentReportIndex === 0 && styles.disabledButton]}
            onPress={handlePreviousReport}
            disabled={currentReportIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentReportIndex === 0 ? COLORS.gray[400] : COLORS.primary} 
            />
          </TouchableOpacity>
          
          <View style={styles.reportIndicator}>
            <Text style={styles.reportIndicatorText}>
              {currentReportIndex === 0 ? 'नवीनतम रिपोर्ट' : `${currentReportIndex + 1} महीने पहले`}
            </Text>
            <View style={styles.dotsContainer}>
              {reportsArray.map((_, index: number) => (
                <View 
                  key={index}
                  style={[
                    styles.dot, 
                    index === currentReportIndex && styles.activeDot
                  ]} 
                />
              ))}
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.carouselButton, currentReportIndex === reportsArray.length - 1 && styles.disabledButton]}
            onPress={handleNextReport}
            disabled={currentReportIndex === reportsArray.length - 1}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={currentReportIndex === reportsArray.length - 1 ? COLORS.gray[400] : COLORS.primary} 
            />
          </TouchableOpacity>
          
        </View>
 
    <ScrollView
  horizontal={true}
  showsHorizontalScrollIndicator={false}
 contentContainerStyle={{ ...styles.container11, paddingHorizontal: 1 }}
>
  {Array.isArray(reportDetails) && reportDetails.length > 0 ? (
    reportDetails.map((report) => (
      <View key={report.id} style={styles.card}>
        <Text style={styles.title}>{report.campname}</Text>
        <Text style={styles.date}>🗓️ {formatDate(report.campdate)}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>👨‍⚕️ Doctor:</Text>
          <Text style={styles.value}>{report.doctorName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>📋 Type:</Text>
          <Text style={styles.value}>{report.reporttype}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🤒 Symptoms:</Text>
          <Text style={styles.value}>{report.symptoms}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🔍 Diagnosis:</Text>
          <Text style={styles.value}>{report.diagnosis}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>💊 Medicines:</Text>
          <Text style={styles.value}>{report.medicines}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>📊 Condition:</Text>
          <Text style={styles.value}>{report.condition}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>📝 Notes:</Text>
          <Text style={styles.value}>{report.notes}</Text>
        </View>
      </View>
    ))
  ) : (
    <Text style={{ textAlign: 'center', marginTop: 20 }}>No reports available</Text>
  )}
</ScrollView>

      </LinearGradient>
              

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'employee' && styles.activeTab]}
          onPress={() => setActiveTab('employee')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={activeTab === 'employee' ? 
              COLORS.gradients.primary.colors : 
              ['transparent', 'transparent']}
            style={styles.tabGradient}
          >
            <FontAwesome5 
              name="user-tie" 
              size={16} 
              color={activeTab === 'employee' ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'employee' && styles.activeTabText
            ]}>
              कर्मचारी
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'family' && styles.activeTab]}
          onPress={() => setActiveTab('family')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={activeTab === 'family' ? 
              COLORS.gradients.primary.colors : 
              ['transparent', 'transparent']}
            style={styles.tabGradient}
          >
            <Ionicons 
              name="people" 
              size={16} 
              color={activeTab === 'family' ? COLORS.white : COLORS.textSecondary} 
            />
            <Text style={[
              styles.tabText, 
              activeTab === 'family' && styles.activeTabText
            ]}>
              परिवार
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  campInfoCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.large,
    elevation: 8,
  },
  campInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  campIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.medium,
  },
  campInfoDetails: {
    flex: 1,
  },
  campTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  campDate: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  campDetails: {
    marginTop: SPACING.sm,
  },
  campDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  campDetailText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    overflow: 'hidden',
  },
  activeTab: {
    // Styling handled by gradient
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  personSection: {
    marginBottom: SPACING.xl,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  personAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  personRole: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginBottom: SPACING.xs,
  },
  personDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  personDetailText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white + 'AA',
  },
  testsContainer: {
    marginBottom: SPACING.lg,
  },
  testCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    elevation: 4,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  testName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  statusText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  testDetails: {
    gap: SPACING.sm,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.small,
  },
  testInfo: {
    flex: 1,
  },
  testLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },
  testValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  normalRange: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  familyMemberCard: {
    marginBottom: SPACING.md,
  },
  memberCardGradient: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    elevation: 6,
  },
  memberCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  memberCardAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.small,
  },
  memberCardInfo: {
    flex: 1,
  },
  memberCardName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  memberCardRelation: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accent,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING.xs,
  },
  memberCardDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  memberCardDetailText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  viewDetailsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  memberCardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    paddingTop: SPACING.md,
  },
  testsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testsCountBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  testsCountText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
  testsSummaryText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  familyListContainer: {
    paddingBottom: SPACING.xl,
  },
  familyListHeader: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  familyListTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  familyListSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  selectedMemberContainer: {
    paddingBottom: SPACING.xl,
  },
  backToListButton: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  backToListGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  backToListText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.xs,
  },
  previousReportsContainer: {
    paddingBottom: SPACING.xl,
  },
  previousReportsHeader: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  previousReportsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  previousReportsSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyStateCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
    elevation: 6,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  emptyStateTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  refreshButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  refreshButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: FONTS.weights.medium,
    marginLeft: SPACING.xs,
  },
  carouselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  carouselButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  disabledButton: {
    backgroundColor: COLORS.gray[50],
    opacity: 0.5,
  },
  reportIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  reportIndicatorText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 12,
  },
  latestBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.small,
  },
  latestBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },

  container: {
    padding: 10,
  },
  noReports: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  card: {
    backgroundColor: '#fefefe',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  section: {
    flexDirection: 'row',
    marginVertical: 2,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
    marginRight: 5,
  },
  value: {
    flex: 1,
    color: '#2c3e50',
  },
  card12: {
  width: 300,               // 🔸 fixed width for horizontal layout
  backgroundColor: '#fefefe',
  borderRadius: 12,
  padding: 15,
  marginRight: 15,          // 🔸 spacing between cards
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

});

export default ReportDetailsScreen;
