"use client"; 

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useMemo } from "react";
import API from "../api/config";
import { STUDENT_ROLE_ID } from "@/constants/student-data";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isError,
    isLoading,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      try {
        const res = await API.get("/me");
        if (res.status === 200) return res.data;
        else return null;
      } catch (err) {
        return null;
      }
    },
    refetchOnWindowFocus: false,
    retry: false
  });

  const setAuth = (newUser: any) => {
      queryClient.setQueryData(["auth"], newUser);
  };

  const auth = useMemo(() => user, [user]);

  return (
    <AuthContext.Provider
      value={{
        auth,
        authError: isError,
        authLoading: isLoading,
        authPending: isFetching,
        setAuth, // Allow manual update if needed
        refetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
