import { router, useSegments } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";

type AuthType = {
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthType>({
  signIn: () => {},
  signOut: () => {},
  session: null,
  isLoading: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

function useProtectedRoute(session: string | null | undefined) {
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, segments]);
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useProtectedRoute(session);

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          setSession("session");
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};