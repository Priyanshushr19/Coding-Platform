import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../Utils/axiosClient';


// Helper to safely store user data (without token)
// Helper to safely store user data (without token)
const storeUserData = (user) => {
  try {
    if (user && typeof user === 'object') {
      // Create a clean user object without sensitive data
      const userData = {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePic: user.profilePic || user.profilePicture || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      // Remove any undefined fields
      Object.keys(userData).forEach(key => {
        if (userData[key] === undefined) {
          delete userData[key];
        }
      });

      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Stored user data:', userData);
    }
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

// Helper to get user data
// Helper to get user data
const getUserData = () => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    console.log('Retrieved user from localStorage:', user);
    return user;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    localStorage.removeItem('user'); // Clear corrupted data
    return null;
  }
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/register', userData);

      // Store only user data (without token) in localStorage
      if (response.data.user) {
        storeUserData(response.data.user);
      }

      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      console.log('Login response:', response.data);

      // Your login API might return different structure
      // Let's check common structures:
      let userData;

      if (response.data.user) {
        // Structure: { user: {...}, token: '...' }
        userData = response.data.user;
      } else if (response.data) {
        // Structure: { ...userData, token: '...' }
        // Remove token from user object if present
        const { token, ...userWithoutToken } = response.data;
        userData = userWithoutToken;
      }

      if (userData) {
        // Store only user data (without token) in localStorage
        storeUserData(userData);
        return userData;
      } else {
        throw new Error('Invalid response format from login');
      }
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// In your authSlice.js, update the checkAuth function
// Update the checkAuth function in authSlice.js
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');

      console.log('checkAuth response:', data);

      // Your API returns: { user: {...}, message: "Valid User" }
      if (data.user) {
        // Update user data in localStorage
        storeUserData(data.user);
        return data.user; // Return just the user object
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('checkAuth error:', error);

      if (error.response?.status === 401) {
        // Clear user data on unauthorized
        localStorage.removeItem('user');
        return rejectWithValue({
          message: "No active session"
        });
      }

      // Try to use localStorage data as fallback
      const storedUser = getUserData();
      if (storedUser) {
        console.log('Using stored user data from localStorage as fallback');
        return storedUser;
      }

      return rejectWithValue({
        message: error.response?.data?.message || "Server error"
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');

      // Clear user data from localStorage
      localStorage.removeItem('user');

      return null;
    } catch (error) {
      // Still clear localStorage even if API call fails
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  'auth/updateProfilePicture',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put('/user/update-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Raw API response:", response.data);

      // Your backend returns: { imageUrl, user }
      return response.data;

    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(error.response?.data || error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserData(), // Initialize from localStorage (without token)
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
    // Sync actions for immediate state updates
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        storeUserData(state.user);
      }
    },
    updateProfilePic: (state, action) => {
      if (state.user) {
        state.user.profilePic = action.payload;
        storeUserData(state.user);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register User Cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      // Login User Cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      // Check Auth Cases
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout User Cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Update Profile Picture Cases
      .addCase(updateProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.loading = false;

        // Handle your backend response format: { imageUrl, user }
        if (action.payload.user) {
          state.user = action.payload.user;
          storeUserData(action.payload.user);
        } else if (action.payload.imageUrl) {
          // Update profilePic with imageUrl from backend
          state.user.profilePic = action.payload.imageUrl;
          storeUserData(state.user);
        }

        state.error = null;
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile picture';
      });
  }
});

// Export the new actions
export const {
  updateUserProfile,
  updateProfilePic,
  clearError
} = authSlice.actions;

export default authSlice.reducer;