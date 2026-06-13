import { useState } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  saveSession,
  clearSession,
  type User,
} from "@/lib/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
  });

  function setError(error: string) {
    setState((s) => ({ ...s, error, loading: false }));
  }

  function setLoading() {
    setState((s) => ({ ...s, loading: true, error: null }));
  }

  async function login(email: string, password: string): Promise<User | null> {
    setLoading();
    try {
      const { user, token } = await loginUser({ email, password });
      saveSession(token, user);
      setState({ user, token, loading: false, error: null });
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      return null;
    }
  }

  async function register(
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<User | null> {
    setLoading();
    try {
      const { user, token } = await registerUser({ name, username, email, password });
      saveSession(token, user);
      setState({ user, token, loading: false, error: null });
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      return null;
    }
  }

  async function logout() {
    if (state.token) {
      try {
        await logoutUser(state.token);
      } catch {
        // token may already be expired — clear locally regardless
      }
    }
    clearSession();
    setState({ user: null, token: null, loading: false, error: null });
  }

  function clearError() {
    setState((s) => ({ ...s, error: null }));
  }

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!state.token,
  };
}