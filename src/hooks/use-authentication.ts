"use client";

import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { User } from "~/types";

// Using next-auth/react instead of direct auth

interface AuthenticatedState {
  user: User;
  loading: false;
  error: null;
  isAuthenticated: true;
}

interface UnauthenticatedState {
  user: null;
  loading: false;
  error: null;
  isAuthenticated: false;
}

interface LoadingState {
  user: null;
  loading: true;
  error: null;
  isAuthenticated: false;
}

interface ErrorState {
  user: null;
  loading: false;
  error: Error;
  isAuthenticated: false;
}

type AuthState =
  | AuthenticatedState
  | UnauthenticatedState
  | LoadingState
  | ErrorState;

/**
 * Client-side hook to handle authentication state
 * @returns {AuthState} The current authentication state with proper type narrowing
 */
export const useAuthUser = (): AuthState => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getSession();
        const currentUser = session?.user as User | undefined;

        if (currentUser) {
          setState({
            user: currentUser,
            loading: false,
            error: null,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      } catch (err) {
        setState({
          user: null,
          loading: false,
          error: err instanceof Error ? err : new Error("Failed to fetch user"),
          isAuthenticated: false,
        });
      }
    };

    fetchUser();
  }, []);

  return state;
};
