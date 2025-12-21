import { createSlice } from '@reduxjs/toolkit';
import api from "@/lib/api";
import { BACKEND_API_URL, DEV_MODE } from '../utils';
import axios from 'axios';

export const LoginSlice = createSlice({
  name: 'Login',
  initialState: {},
  reducers: {
    postUserLoginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    postUserLoginSuccess(state, action) {
      state.success = true;
      state.isLoading = false;
      state.error = null;
    },
    postUserLoginFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    postUserLoginReset() {
      return {};
    },
  },
});

export const {
  postUserLoginStart,
  postUserLoginSuccess,
  postUserLoginFailure,
  postUserLoginReset
} = LoginSlice.actions;

export const userLogin = (email, password) => async (dispatch) => {
	dispatch(postUserLoginStart());
	try {
		const apiUrl = DEV_MODE
			? `${BACKEND_API_URL}/api/accounts/token/`
			: `/api/accounts/token/`;
		const response = await axios.post(
			apiUrl,
			{
				email: email,
				password: password,
			}
		);

		localStorage.setItem("access", response.data.access);
		localStorage.setItem("refresh", response.data.refresh);

		dispatch(postUserLoginSuccess(response.data));
		dispatch(authUser());
	} catch (error) {
		dispatch(postUserLoginFailure(error.response.data));
	}
};


export const AuthUserSlice = createSlice({
  name: 'AuthUser',
  initialState: {},
  reducers: {
    getAuthUserStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    getAuthUserSuccess(state, action) {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    getAuthUserFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getAuthUserReset() {
      return {};
    },
  },
});

export const {
  getAuthUserStart,
  getAuthUserSuccess,
  getAuthUserFailure,
  getAuthUserReset
} = AuthUserSlice.actions;

export const authUser = () => async (dispatch) => {
  dispatch(getAuthUserStart());
  const access = localStorage.getItem("access")
  const conf = {
      headers: {
          Accept: "application/json",
          Authorization: `Bearer ${access}`,
      },
  };
  try {
    const apiUrl = DEV_MODE ? `${BACKEND_API_URL}/api/accounts/auth_user/`: `/api/accounts/auth_user/`;
    const response = await api.get(apiUrl, conf);
    dispatch(getAuthUserSuccess(response.data));
  } catch (error) {
    dispatch(getAuthUserFailure(error.response.data));
  }
};


export const ChangePasswordSlice = createSlice({
  name: 'ChangePassword',
  initialState: {},
  reducers: {
    changePasswordStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    changePasswordSuccess(state, action) {
      state.success = true;
      state.isLoading = false;
      state.error = null;
    },
    changePasswordFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    changePasswordReset() {
      return {};
    },
  },
});

export const {
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  changePasswordReset
} = ChangePasswordSlice.actions;

export const changePassword = (putData) => async (dispatch) => {
  dispatch(changePasswordStart());
  const access = localStorage.getItem("access")
  const conf = {
      headers: {
          Accept: "application/json",
          Authorization: `Bearer ${access}`,
      },
  };
  try {
    const apiUrl = DEV_MODE
          ? `${BACKEND_API_URL}/api/accounts/update_password/`
          : `/api/accounts/update_password/`;

    const response = await api.put(apiUrl, putData, conf);
    dispatch(changePasswordSuccess(response.data));
  } catch (error) {
    dispatch(changePasswordFailure(error.response.data));
  }
};