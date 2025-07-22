/**
 * Government Health App - Login Screen (Expo Version)
 * @format
 */

import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import serverUrl from '../services/Server';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: (userData: { userName: string }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ phoneNumber: '', password: '' });

  const validateForm = () => {
    const newErrors = { phoneNumber: '', password: '' };
    let isValid = true;

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'फोन नंबर आवश्यक है';
      isValid = false;
    } else if (!phoneRegex.test(phoneNumber)) {
      newErrors.phoneNumber = 'कृपया 10 अंकों का वैध फोन नंबर दर्ज करें';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'पासवर्ड आवश्यक है';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // PHP backend API call
      const response = await fetch(serverUrl + '/chkusr.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          t1: phoneNumber,
          t2: password
        })
      });

      const responseJson = await response.json();
      
      if (responseJson == 0) {
        Alert.alert('लॉगिन असफल', 'अमान्य फोन नंबर या पासवर्ड');
        setIsLoading(false);
        return;
      }

      const s = responseJson.split(",");
      console.log('User type:', s[2]);
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('cid', s[0]);
      await AsyncStorage.setItem('mobile', s[1]);
      await AsyncStorage.setItem('usertype', s[2]);
      
      // Call success callback with user data
      onLoginSuccess({ 
        userName: phoneNumber // You can modify this based on your user data structure
      });
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('त्रुटि', 'लॉगिन करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.staticContainer}>
          {/* Header Section */}
          <LinearGradient
            colors={COLORS.gradients.primary.colors}
            start={COLORS.gradients.primary.start}
            end={COLORS.gradients.primary.end}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={COLORS.gradients.card.colors}
                start={COLORS.gradients.card.start}
                end={COLORS.gradients.card.end}
                style={styles.logo}
              >
                <Text style={styles.logoText}>🏥</Text>
              </LinearGradient>
            </View>
            <Text style={styles.appTitle}>सरकारी स्वास्थ्य पोर्टल</Text>
            <Text style={styles.subtitle}>स्वास्थ्य सेवाओं तक सुरक्षित पहुंच</Text>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>स्वागत है</Text>
              <Text style={styles.welcomeSubtitle}>
                कृपया अपना पंजीकृत फोन नंबर से साइन इन करें
              </Text>
            </View>

            <CustomInput
              label="फोन नंबर"
              placeholder="अपना फोन नंबर दर्ज करें (10 अंक)"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text.replace(/[^0-9]/g, '')); // Only allow numbers
                if (errors.phoneNumber) {
                  setErrors(prev => ({ ...prev, phoneNumber: '' }));
                }
              }}
              keyboardType="numeric"
              autoComplete="tel"
              maxLength={10}
              error={errors.phoneNumber}
            />

            <CustomInput
              label="पासवर्ड"
              placeholder="अपना पासवर्ड दर्ज करें"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              secureTextEntry
              autoComplete="password"
              error={errors.password}
            />

            <CustomButton
              title="साइन इन करें"
              loadingText="साइन इन हो रहा है..."
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              स्वास्थ्य और परिवार कल्याण मंत्रालय
            </Text>
            <Text style={styles.footerSubtext}>
              छत्तीसगढ़ सरकार की पहल
            </Text>
            <Text style={styles.versionText}>संस्करण 1.0.0</Text>
            <Text style={styles.poweredByText}>Powered by SSIPMT, RAIPUR</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  staticContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: (StatusBar.currentHeight || 0) + SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
    elevation: 8,
  },
  logoText: {
    fontSize: 24,
  },
  appTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[200],
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  welcomeContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  footerText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    width: '100%',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  versionText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    width: '100%',
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  poweredByText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: FONTS.weights.semibold,
  },
});
