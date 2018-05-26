import reportData from "../assets/data/placementDailyReport.json";
// import reportData from "../assets/data/placementDailyReport-total.json";

const dns = "http://ec2-52-15-223-69.us-east-2.compute.amazonaws.com";

function async() {
   return fetch("http://date.jsontest.com/").then(response => response.json());
}

function cloudinayImgUpload(accessToken, data) {
   return fetch(dns + "/api/v1/user/cloudinaryUpload", {
      method: "POST",
      headers: new Headers({
         "x-access-token": accessToken
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
   return fetch(dns + "/api/v1/user/signup", {
      method: "POST",
      headers: new Headers({
         "Content-Type": "application/json"
      }),
      body: JSON.stringify(data)
   }).then(response => response.json());
}

function forgotPass(data) {
   return fetch(dns + "/api/v1/user/forgot", {
      method: "POST",
      headers: new Headers({
         "Content-Type": "application/json"
      }),
      body: JSON.stringify(data)
   }).then(response => response.json());
}

function getApps(accessToken) {
   return fetch(dns + "/api/v1/user/getApps", {
      method: "GET",
      headers: new Headers({
         "x-access-token": accessToken
      })
   }).then(response => response.json());
}

function getAppsAdmin(accessToken) {
   return fetch(dns + "/api/v1/user/getAppsAdmin", {
      method: "GET",
      headers: new Headers({
         "x-access-token": accessToken
      })
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
   fetch(`${dns}/api/v1/user/setApps`, {
      method: "POST",
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

const getReportData = appsIds => reportData;

export default {
   async,
   cloudinayImgUpload,
   cloudinayImgURL,
   isAdmin,
   login,
   signup,
   forgotPass,
   getApps,
   getAppsAdmin,
   getUserData,
   toggleAppStatus,
   getScenes,
   getPlacements,
   updatePlacements,
   getReportData
};
