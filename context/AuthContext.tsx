import { loginUser, signupUser } from "../services/authService";
import { clearUserData, getUserData, storeUserData } from "../services/UserId";
import { router, useRootNavigationState, useSegments } from "expo-router";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

type AuthType = {
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (empId: string, name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session?: string | null;
  isLoading: boolean;
  userName?: string | null;
  userId?: string | null;
};

const AuthContext = createContext<AuthType>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: true,
  userName: null,
  userId: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

function useProtectedRoute(session: string | null | undefined, isLoading: boolean) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, segments, navigationState?.key, isLoading]);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.isLoggedIn) {
          setSession(userData.userId);
          setUserName(userData.name);
          setUserId(userData.userId);
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  useProtectedRoute(session, isLoading);

  return (
    <AuthContext.Provider
      value={{
        signIn: async (username: string, password: string) => {
          setIsLoading(true);
          try {
            console.log('Starting sign in process...');
            const result = await loginUser(username, password);
            console.log('Login result:', result);
            
            if (result.success && result.user) {
              const userData = {
                userId: result.user.id,
                name: result.user.username,
                email: result.user.email,
                isLoggedIn: true
              };
              
              await storeUserData(userData);
              setSession(result.user.id);
              setUserName(result.user.username);
              setUserId(result.user.id);
              
              Alert.alert("Success", "Logged in successfully!");
            } else {
              Alert.alert("Login Failed", result.error || "Unknown error occurred");
            }
          } catch (error) {
            console.error("Sign in error:", error);
            Alert.alert("Error", "An unexpected error occurred during login");
          } finally {
            setIsLoading(false);
          }
        },
        signUp: async (empId: string, name: string, email: string, password: string) => {
          setIsLoading(true);
          try {
            console.log('Starting sign up process...');
            const result = await signupUser(empId, name, email, password);
            console.log('Signup result:', result);
            
            if (result.success && result.user) {
              const userData = {
                userId: result.user.id,
                name: result.user.username,
                email: result.user.email,
                isLoggedIn: true
              };
              
              await storeUserData(userData);
              setSession(result.user.id);
              setUserName(result.user.username);
              setUserId(result.user.id);
              
              Alert.alert("Success", "Account created successfully!");
            } else {
              Alert.alert("Signup Failed", result.error || "Unknown error occurred");
            }
          } catch (error) {
            console.error("Sign up error:", error);
            Alert.alert("Error", "An unexpected error occurred during signup");
          } finally {
            setIsLoading(false);
          }
        },
        signOut: async () => {
          try {
            await clearUserData();
            setSession(null);
            setUserName(null);
            setUserId(null);
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
        session,
        isLoading,
        userName,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};