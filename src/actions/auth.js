import api from "../api";
import _a from "../utils/analytics";
import {
  setAsyncError,
  setAsyncLoading,
  setAsyncMessage,
} from "./asyncActions";
import C from "../utils/constants";
import { LOGIN_SUCCESS, REGISTER_SUCCESS } from "./actions";

const login = (username, password) => async dispatch => {
  dispatch(setAsyncLoading(true));

  const data = {
    username,
    password,
  };

  try {
    const loginRes = await api.login(data);
    if (!loginRes.status) throw C.ERRORS.failedLogin;

    const userRes = await api.getUserData(loginRes.data.loginToken);
    if (!userRes.status) throw C.ERRORS.failedLogin;

    const userData = { ...loginRes.data, ...userRes.data };
    const userId = userData._id;
    if (userId && window.analytics) {
      const traits = {
        name: userData.name,
        email: userData.email.value,
        companyName: userData.companyName,
      };
      _a.identify(userId, traits, {}, () => {
        _a.track(_a.events.account.loggedIn);
      });
      dispatch({
        type: LOGIN_SUCCESS,
        data: userData,
      });
    } else {
      window.analytics && _a.track(_a.events.account.failedLogin);
      dispatch({
        type: LOGIN_SUCCESS,
        data: userData,
      });
    }

    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const register = (name, email, password) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    email,
    password,
    name,
  };

  try {
    const res = await api.register(data);
    if (res.status) {
      _a.track(_a.events.account.created);
    } else {
      _a.track(_a.events.account.createdFailed);
      throw res.message;
    }

    dispatch({
      type: REGISTER_SUCCESS,
      data: res,
    });
    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.error("error: ", error);
    const correct =
      typeof error !== "object"
        ? error.indexOf("duplicate") >= 0
          ? C.ERRORS.userExists
          : error
        : error;
    dispatch(setAsyncError(correct));
  }
};

const resendSignUpEmail = ({ userEmail, userName }) => dispatch => {
  // const data = {
  //   userEmail,
  //   userName,
  // };
  // api
  //   .resendSignUpEmail(data)
  //   .then(data => dispatch(doSignup(data)))
  //   .catch(error => dispatch(setAsyncError(error)));
};

const forgotPass = userEmail => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    userEmail,
  };

  try {
    const res = await api.forgotPass(data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const changeEmail = (email, accessToken) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    email,
  };

  try {
    const res = await api.changeEmail(accessToken, data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }
};

const setNewPass = ({ token, userId, newPass }) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    token,
    userId,
    newPass,
  };

  try {
    const res = await api.setNewPass(data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.passChanged));
  } catch (error) {
    console.error("error: ", error);
    dispatch(setAsyncError(error));
  }

  // api
  //   .setNewPass(data)
  //   .then(res => dispatch(doSetPassword(res)))
  //   .catch(error => dispatch(setAsyncError(error)));
};

const setNewEmail = ({ token, userId, newEmail }) => async dispatch => {
  dispatch(setAsyncLoading(true));
  const data = {
    token,
    userId,
    newEmail,
  };

  try {
    const res = await api.setNewEmail(data);
    if (!res.status) throw res.message;

    dispatch(setAsyncMessage(C.SUCCESS.emailSent));
  } catch (error) {
    console.log("error: ", error);
    dispatch(setAsyncError(error));
  }

  // api
  //   .setNewEmail(data)
  //   .then(res => dispatch(doSetEmail(res)))
  //   .catch(error => dispatch(setAsyncError(error)));
};

export default {
  login,
  register,
  resendSignUpEmail,
  forgotPass,
  changeEmail,
  setNewPass,
  setNewEmail,
};
