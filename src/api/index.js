const isProd = process.env.NODE_ENV !== "development";

const dns = isProd ? "https://api.admix.in" : "http://localhost:3000";
!isProd && console.warn("dns: ", dns);

// TODO return error!

const cloudinayImgUpload = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/cloudinary/upload", {
      method: "POST",
      headers: new Headers({
        "x-access-token": accessToken,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ cloudinayImgUpload: ", error);
  }
};

const cloudinayImgURL = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/cloudinary/imgurl", {
      method: "POST",
      headers: new Headers({
        "x-access-token": accessToken,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ cloudinayImgURL: ", error);
  }
};

const login = async data => {
  try {
    const res = fetch(dns + "/api/v2/auth/login", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.log("API ERROR @ login: ", error);
  }
};

const signup = data => {
  return fetch(dns + "/api/v2/user/signup", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const resendSignUpEmail = data => {
  return fetch(dns + "/api/v2/user/resendSignUpEmail", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const updateUser = (accessToken, data) =>
  fetch(`${dns}/api/v2/user/update`, {
    method: "PUT",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());

const forgotPass = data => {
  return fetch(dns + "/api/v2/user/forgot", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const changeEmail = (accessToken, data) => {
  return fetch(dns + "/api/v2/user/changeEmail", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const setNewPass = data => {
  return fetch(dns + "/api/v2/user/setNewPassword", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const setNewEmail = data => {
  return fetch(dns + "/api/v2/user/setNewEmail", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const getAppsAll = (accessToken, data) => {
  return fetch(dns + "/api/v2/user/getApps", {
    method: "GET",
    headers: new Headers({
      "x-access-token": accessToken,
    }),
  }).then(response => response.json());
};

const getApps = (accessToken, data) => {
  return fetch(dns + "/api/v2/user/getApps", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const updateApp = (accessToken, data) => {
  return fetch(dns + "/api/v2/user/setApps", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const getAppsAdmin = (accessToken, adminToken, data) => {
  return fetch(dns + "/api/v2/user/getAppsAdmin", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "x-admin-token": adminToken,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());
};

const getUserData = accessToken =>
  fetch(`${dns}/api/v2/user/getPrefs`, {
    method: "GET",
    headers: new Headers({
      "x-access-token": accessToken,
    }),
  }).then(response => response.json());

const toggleAppStatus = (accessToken, data) =>
  fetch(`${dns}/api/v2/user/setApps`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());

const getScenes = (accessToken, data) =>
  fetch(`${dns}/api/v2/user/getScenes`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());

const getPlacements = (accessToken, data) =>
  fetch(`${dns}/api/v2/user/getPlacements`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());

const updatePlacements = (accessToken, data) =>
  fetch(`${dns}/api/v2/user/updatePlacements`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken,
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());

// const getReportData = (accessToken, data) => reportData;

const getReportData = (accessToken, data) =>
  fetch(`https://report.admix.in/report/placement/daily`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-auth-token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmU0NDc5MTIxMDBjMTMxZjJhNDQwYzEiLCJuYW1lIjoiQWRtaW4gUGxhdGZvcm0iLCJlbWFpbCI6ImFkbWluQGFkbWl4LmluIiwicm9sZSI6MCwiaWF0IjoxNTQxNjg3MTg1fQ.HcV0VUmfIHdHUHvH-EjWx35VKHj1H_IrSrBvW8Dz4lQ",
    }),
    body: JSON.stringify(data),
  }).then(response => response.json());

export default {
  cloudinayImgUpload,
  cloudinayImgURL,
  login,
  signup,
  resendSignUpEmail,
  updateUser,
  forgotPass,
  changeEmail,
  setNewPass,
  setNewEmail,
  getAppsAll,
  getApps,
  updateApp,
  getAppsAdmin,
  getUserData,
  toggleAppStatus,
  getScenes,
  getPlacements,
  updatePlacements,
  getReportData,
};
