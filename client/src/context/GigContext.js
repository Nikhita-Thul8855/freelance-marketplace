import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api';

// Initial state
const initialState = {
  gigs: [],
  myGigs: [],
  currentGig: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_GIGS: 'SET_GIGS',
  SET_MY_GIGS: 'SET_MY_GIGS',
  SET_CURRENT_GIG: 'SET_CURRENT_GIG',
  ADD_GIG: 'ADD_GIG',
  UPDATE_GIG: 'UPDATE_GIG',
  DELETE_GIG: 'DELETE_GIG'
};

// Reducer
const gigReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case actionTypes.SET_GIGS:
      return {
        ...state,
        gigs: action.payload.data,
        totalPages: action.payload.pages,
        currentPage: action.payload.page,
        loading: false,
        error: null // Clear error on successful fetch
      };
    case actionTypes.SET_MY_GIGS:
      return {
        ...state,
        myGigs: action.payload,
        loading: false,
        error: null // Clear error on successful fetch
      };
    case actionTypes.SET_CURRENT_GIG:
      return {
        ...state,
        currentGig: action.payload,
        loading: false,
        error: null // Clear error on successful fetch
      };
    case actionTypes.ADD_GIG:
      return {
        ...state,
        myGigs: [action.payload, ...state.myGigs],
        loading: false,
        error: null // Clear error on successful operation
      };
    case actionTypes.UPDATE_GIG:
      return {
        ...state,
        myGigs: state.myGigs.map(gig => 
          gig._id === action.payload._id ? action.payload : gig
        ),
        currentGig: action.payload,
        loading: false,
        error: null // Clear error on successful operation
      };
    case actionTypes.DELETE_GIG:
      return {
        ...state,
        myGigs: state.myGigs.filter(gig => gig._id !== action.payload),
        loading: false,
        error: null // Clear error on successful operation
      };
    default:
      return state;
  }
};

// Create context
const GigContext = createContext();

// Gig Provider component
export const GigProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gigReducer, initialState);

  // Get all gigs (public)
  const getGigs = useCallback(async (filters = {}) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      console.log('=== FETCHING GIGS ===');
      console.log('Raw filters:', filters);
      
      // Filter out empty values to avoid sending unnecessary query parameters
      const cleanFilters = Object.entries(filters)
        .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      console.log('Clean filters:', cleanFilters);
      
      const query = new URLSearchParams(cleanFilters).toString();
      const url = `/gigs${query ? `?${query}` : ''}`;
      console.log('Request URL:', url);
      
      const res = await api.get(url);
      console.log('Response:', res.data);
      
      dispatch({
        type: actionTypes.SET_GIGS,
        payload: res.data
      });
    } catch (error) {
      console.error('=== GIGS FETCH ERROR ===');
      console.error('Error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch gigs'
      });
    }
  }, []);

  // Get single gig
  const getGig = useCallback(async (id) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      const res = await api.get(`/gigs/${id}`);
      
      dispatch({
        type: actionTypes.SET_CURRENT_GIG,
        payload: res.data.data
      });
    } catch (error) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch gig'
      });
    }
  }, []);

  // Get my gigs (protected)
  const getMyGigs = useCallback(async () => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      const res = await api.get('/gigs/my-gigs');
      
      dispatch({
        type: actionTypes.SET_MY_GIGS,
        payload: res.data.data
      });
    } catch (error) {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch your gigs'
      });
    }
  }, []);

  // Create gig
  const createGig = async (gigData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      console.log('Creating gig with data:', gigData);
      
      const res = await api.post('/gigs', gigData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      dispatch({
        type: actionTypes.ADD_GIG,
        payload: res.data.data
      });
      
      return { success: true, data: res.data.data };
    } catch (error) {
      console.error('Error creating gig:', error);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to create gig';
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update gig
  const updateGig = async (id, gigData) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      const res = await api.put(`/gigs/${id}`, gigData);
      
      dispatch({
        type: actionTypes.UPDATE_GIG,
        payload: res.data.data
      });
      
      return { success: true, data: res.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update gig';
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete gig
  const deleteGig = async (id) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: true });
    
    try {
      await api.delete(`/gigs/${id}`);
      
      dispatch({
        type: actionTypes.DELETE_GIG,
        payload: id
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete gig';
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  return (
    <GigContext.Provider
      value={{
        ...state,
        getGigs,
        getGig,
        getMyGigs,
        createGig,
        updateGig,
        deleteGig,
        clearError
      }}
    >
      {children}
    </GigContext.Provider>
  );
};

// Custom hook to use gig context
export const useGigs = () => {
  const context = useContext(GigContext);
  if (!context) {
    throw new Error('useGigs must be used within a GigProvider');
  }
  return context;
};
