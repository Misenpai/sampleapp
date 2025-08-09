import { useAuthStore } from "@/store/authStore";
import { colors } from "@/constants/colors";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

export default function LoginScreen() {
  const { signIn, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    await signIn(username.trim().toLowerCase(), password);
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert("Coming Soon", `${provider} login will be available soon!`);
  };

  const handleForgotPassword = () => {
    Alert.alert("Password Reset", "Password reset functionality coming soon!");
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
          {/* Logo/Brand Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).springify()}
            style={styles.logoContainer}
          >
            <View style={styles.logoCircle}>
              <FontAwesome6 name="fingerprint" size={50} color={colors.primary[500]} />
            </View>
            <Text style={styles.brandName}>AttendEase</Text>
            <Text style={styles.tagline}>Smart Attendance Management</Text>
          </Animated.View>

          {/* Login Form Card */}
          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.formCard}
          >
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="user" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username or Email"
                placeholderTextColor={colors.gray[400]}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <FontAwesome6 
                name="lock" 
                size={20} 
                color={colors.gray[400]} 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
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

            {/* Remember Me & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && (
                    <FontAwesome6 name="check" size={12} color={colors.white} />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary[500], colors.primary[600]]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Google")}
              >
                <FontAwesome6 name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Apple")}
              >
                <FontAwesome6 name="apple" size={24} color={colors.black} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => handleSocialLogin("Microsoft")}
              >
                <FontAwesome6 name="microsoft" size={24} color="#00A4EF" />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  tagline: {
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
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.gray[800],
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.gray[500],
    marginBottom: 24,
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  rememberText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  forgotText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: "600",
  },
  loginButton: {
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
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
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
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  signupLink: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: "600",
  },
});