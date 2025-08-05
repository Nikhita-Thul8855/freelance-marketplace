import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Action types
const actionTypes = {
  USER_LOADED: 'USER_LOADED',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_LOADING: 'SET_LOADING',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case actionTypes.REGISTER_SUCCESS:
    case actionTypes.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case actionTypes.AUTH_ERROR:
    case actionTypes.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case actionTypes.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case actionTypes.UPDATE_PROFILE:
      return {
        ...state,
        user: action.payload
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Set up axios defaults
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Add token to headers if it exists
if (localStorage.getItem('token')) {
  setAuthToken(localStorage.getItem('token'));
}

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user
  const loadUser = async () => {
    if (localStorage.getItem('token')) {
      setAuthToken(localStorage.getItem('token'));
    }

    try {
      const res = await axios.get('/auth/me');
      dispatch({
        type: actionTypes.USER_LOADED,
        payload: res.data.user
      });
    } catch (error) {
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: error.response?.data?.message || 'Authentication failed'
      });
    }
  };

  // Register user
  const register = async (formData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      const res = await axios.post('/auth/register', formData);
      
      // Store token in localStorage and set auth header
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      dispatch({
        type: actionTypes.REGISTER_SUCCESS,
        payload: res.data
      });
      
      // Load user data
      loadUser();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (formData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      const res = await axios.post('/auth/login', formData);
      
      // Store token in localStorage and set auth header
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      
      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: res.data
      });
      
      // Load user data
      loadUser();
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: actionTypes.AUTH_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update user profile
  const updateUserProfile = (updatedUser) => {
    dispatch({
      type: actionTypes.UPDATE_PROFILE,
      payload: updatedUser
    });
  };

  // Logout
  const logout = () => {
    dispatch({ type: actionTypes.LOGOUT });
    setAuthToken(null);
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: actionTypes.CLEAR_ERRORS });
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        clearErrors,
        loadUser,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
