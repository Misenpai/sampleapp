import { useAuthStore } from "@/store/authStore";
import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Animated, { 
  FadeInDown, 
  FadeInUp 
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function SignupScreen() {
  const { signUp, isLoading } = useAuthStore();
  const [empId, setEmpId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignup = async () => {
    if (!empId.trim()) {
      Alert.alert("Error", "Please enter your employee ID");
      return;
    }
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (!agreedToTerms) {
      Alert.alert("Error", "Please agree to the Terms and Conditions");
      return;
    }

    await signUp(empId.trim(), username.trim(), email.trim().toLowerCase(), password);
  };

  const handleSocialSignup = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} signup will be available soon!`);
  };

  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[700]]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).springify()}
            style={styles.headerContainer}
          >
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join us to get started</Text>
          </Animated.View>

          {/* Signup Form Card */}
          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.formCard}
          >
            {/* Social Signup Options */}
            <View style={styles.socialSignupContainer}>
              <Text style={styles.socialSignupText}>Sign up with</Text>
              <View style={styles.socialButtonsRow}>
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialSignup("Google")}
                >
                  <FontAwesome6 name="google" size={20} color="#DB4437" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.socialButton}
                  onPress={() => handleSocialSignup("Microsoft")}
                >
                  <FontAwesome6 name="microsoft" size={20} color="#00A4EF" />
                  <Text style={styles.socialButtonText}>Microsoft</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Form Inputs */}
            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="id-badge" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Employee ID"
                placeholderTextColor={colors.gray[400]}
                value={empId}
                onChangeText={setEmpId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="user" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.gray[400]}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="envelope" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="lock" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <FontAwesome6 
                  name={showPassword ? "eye" : "eye-slash"} 
                  size={20} 
                  color={colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="lock" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.gray[400]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <FontAwesome6 
                  name={showConfirmPassword ? "eye" : "eye-slash"} 
                  size={20} 
                  color={colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill,
                      {
                        width: `${Math.min((password.length / 12) * 100, 100)}%`,
                        backgroundColor: 
                          password.length < 6 ? colors.error :
                          password.length < 10 ? colors.warning :
                          colors.success
                      }
                    ]}
                  />
                </View>
                <Text style={styles.strengthText}>
                  {password.length < 6 ? "Weak" :
                   password.length < 10 ? "Medium" : "Strong"}
                </Text>
              </View>
            )}

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && (
                  <FontAwesome6 name="check" size={12} color={colors.white} />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.signupButtonText}>
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.gray[200],
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  socialSignupContainer: {
    marginBottom: 20,
  },
  socialSignupText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
    textAlign: "center",
  },
  socialButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[700],
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.gray[400],
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[800],
  },
  eyeIcon: {
    padding: 4,
  },
  passwordStrength: {
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  termsText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  termsLink: {
    color: colors.primary[500],
    fontWeight: "600",
  },
  signupButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: "600",
  },
});