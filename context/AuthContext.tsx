// context/AuthContext.tsx
import getOrCreateUserId, { clearUserData, getUserData } from "../services/UserId";
import { router, useRootNavigationState, useSegments } from "expo-router";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthType = {
  signIn: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
  session?: string | null;
  isLoading: boolean;
  userName?: string | null;
};

const AuthContext = createContext<AuthType>({
  signIn: async () => {},
  signOut: async () => {},
  session: null,
  isLoading: true,
  userName: null,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

function useProtectedRoute(session: string | null | undefined, isLoading: boolean) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't navigate if navigation isn't ready or still loading
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)"); // or wherever your main app content is
    }
  }, [session, segments, navigationState?.key, isLoading]);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const userData = await getUserData();
        if (userData && userData.isLoggedIn) {
          setSession(userData.userId);
          setUserName(userData.name);
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
        signIn: async (name: string) => {
          try {
            const userId = await getOrCreateUserId(name);
            if (userId) {
              setSession(userId);
              setUserName(name);
            }
          } catch (error) {
            console.error("Error signing in:", error);
          }
        },
        signOut: async () => {
          try {
            await clearUserData();
            setSession(null);
            setUserName(null);
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
        session,
        isLoading,
        userName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};