import { apiSlice } from './apiSlice';
import { USERS_URL } from '../constants';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    newPasswordRequest: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password/request`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    resetPassword: builder.mutation({
      query: ({ userId, token, password }) => ({
        url: `${USERS_URL}/reset-password/reset/${userId}/${token}`,
        method: 'POST',
        body: { password },
      }),
      invalidatesTags: ['User'],
    }),
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getUserProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: 'GET', // Explicitly specify method
      }),
      providesTags: ['User'],
    }),
    getUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    admins: builder.query({
      query: () => ({
        url: `${USERS_URL}/admins`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `${USERS_URL}/${userId}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Add token to headers for protected routes
export const enhancedUsersApiSlice = usersApiSlice.enhanceEndpoints({
  addTagTypes: ['User'],
  endpoints: {
    profile: {
      invalidatesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
    getUserProfile: {
      providesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
    getUsers: {
      providesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
    admins: {
      providesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
    getUserById: {
      providesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
    deleteUser: {
      invalidatesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
    updateUser: {
      invalidatesTags: ['User'],
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.userInfo?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
      },
    },
  },
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useNewPasswordRequestMutation,
  useResetPasswordMutation,
  useProfileMutation,
  useGetUserProfileQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUserByIdQuery,
  useAdminsQuery,
} = enhancedUsersApiSlice;