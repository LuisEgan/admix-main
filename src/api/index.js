// import reportData from "../assets/data/placementDailyReport.json";
// import reportData from "../assets/data/placementDailyReport-total.json";

// const dns = "http://ec2-52-15-223-69.us-east-2.compute.amazonaws.com:3006";
// const dns = "http://ec2-18-188-77-242.us-east-2.compute.amazonaws.com";

const isProd = process.env.NODE_ENV !== "development";

// const dns = isProd ? "https://api.admix.in" : "http://sandbox.api.admix.in";
const dns = isProd ? "https://api.admix.in" : "http://localhost:3000";
console.warn("dns: ", dns);

function async() {
  return fetch("http://date.jsontest.com/").then(response => response.json());
}

function cloudinayImgUpload(accessToken, data) {
  return fetch(dns + "/api/v1/user/cloudinaryUpload", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function cloudinayImgURL(accessToken, data) {
  return fetch(dns + "/api/v1/user/cloudinayImgURL", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function isAdmin(accessToken) {
  return fetch(dns + "/api/v1/user/verify/isAdmin", {
    method: "GET",
    headers: new Headers({
      "x-access-token": accessToken
    })
  }).then(response => response.json());
}

function login(data) {
  return fetch(dns + "/api/v1/user/login", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function signup(data) {
  return fetch(dns + "/api/v2/auth/signup", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function resendSignUpEmail(data) {
  return fetch(dns + "/api/v1/user/resendSignUpEmail", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

const updateUser = (accessToken, data) =>
  fetch(`${dns}/api/v1/user/updateUser`, {
    method: "PUT",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());

function forgotPass(data) {
  return fetch(dns + "/api/v1/user/forgot", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function changeEmail(accessToken, data) {
  return fetch(dns + "/api/v1/user/changeEmail", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function setNewPass(data) {
  return fetch(dns + "/api/v1/user/setNewPassword", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function setNewEmail(data) {
  return fetch(dns + "/api/v1/user/setNewEmail", {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function getAppsAll(accessToken, data) {
  return fetch(dns + "/api/v1/user/getApps", {
    method: "GET",
    headers: new Headers({
      "x-access-token": accessToken
    })
  }).then(response => response.json());
}

function getApps(accessToken, data) {
  return fetch(dns + "/api/v1/user/getApps", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function updateApp(accessToken, data) {
  return fetch(dns + "/api/v1/user/setApps", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

function getAppsAdmin(accessToken, adminToken, data) {
  return fetch(dns + "/api/v1/user/getAppsAdmin", {
    method: "POST",
    headers: new Headers({
      "x-access-token": accessToken,
      "x-admin-token": adminToken,
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());
}

const getUserData = accessToken =>
  fetch(`${dns}/api/v1/user/getPrefs`, {
    method: "GET",
    headers: new Headers({
      "x-access-token": accessToken
    })
  }).then(response => response.json());

const toggleAppStatus = (accessToken, data) =>
  fetch(`${dns}/api/v2/apps/update`, {
    method: "PUT",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());

const getScenes = (accessToken, data) =>
  fetch(`${dns}/api/v1/user/getScenes`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());

const getPlacements = (accessToken, data) =>
  fetch(`${dns}/api/v1/user/getPlacements`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());

const updatePlacements = (accessToken, data) =>
  fetch(`${dns}/api/v1/user/updatePlacements`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-access-token": accessToken
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());

// const getReportData = (accessToken, data) => reportData;

const getReportData = (accessToken, data) =>
  fetch(`https://report.admix.in/report/placement/daily`, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-auth-token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzE4ZmI1MmQ0ZGJjMTY0M2ZjN2ZhYTQiLCJuYW1lIjoiQWRtaW4gUGxhdGZvcm0iLCJlbWFpbCI6ImFkbWluQGFkbWl4LmluIiwicm9sZSI6MCwiaWF0IjoxNTQ1MTQxMDc0fQ.JoRcsmbGM4llyT2KxvDSVdshdAbufVG2DyGYjwUXDao"
    }),
    body: JSON.stringify(data)
  }).then(response => response.json());

export default {
  async,
  cloudinayImgUpload,
  cloudinayImgURL,
  isAdmin,
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
  getReportData
};
