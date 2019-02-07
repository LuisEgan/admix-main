import qs from "qs";

const isProd = process.env.NODE_ENV !== "development";

const dns = isProd ? "https://api.admix.in" : "http://localhost:3000";
!isProd && console.warn("dns: ", dns);

// ************ //
// * AUTH
// ************ //

const login = async data => {
  try {
    const res = await fetch(dns + "/api/v2/auth/login", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ login: ", error);
  }
};

const register = async data => {
  try {
    const res = await fetch(dns + "/api/v2/auth/signup", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ register: ", error);
  }
};

const resendSignUpEmail = async data => {
  try {
    const res = await fetch(dns + "/api/v2/auth/resend/email", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ resendSignUpEmail: ", error);
  }
};

const forgotPass = async data => {
  try {
    const res = await fetch(dns + "/api/v2/auth/forgot", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ forgotPass: ", error);
  }
};

const setNewPass = async data => {
  try {
    const res = await fetch(dns + "/api/v2/auth/set/password", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ setNewPass: ", error);
  }
};

const setNewEmail = async data => {
  try {
    const res = await fetch(dns + "/api/v2/auth/set/email", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ setNewEmail: ", error);
  }
};

// ************ //
// * APPS
// ************ //

// ! there shouldn't be 2 for getting apps, 1 is enough for getting 1 app or all.
const getAppsAll = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/apps/all", {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ getAppsAll: ", error);
  }
};

const getApps = async (accessToken, data) => {
  const { filterBy } = data;
  const query = `?${qs.stringify(filterBy)}`;
  try {
    const res = await fetch(`${dns}/api/v2/apps/${query}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ getApps: ", error);
  }
};
// ! there shouldn't be 2 for getting apps, 1 is enough for getting 1 app or all.

const updateApp = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/apps/update", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ updateApp: ", error);
  }
};

const getAppsAdmin = async (accessToken, adminToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/admin/data/apps", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
        "x-admin-token": adminToken,
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ getAppsAdmin: ", error);
  }
};

const toggleAppStatus = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/apps/update", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ toggleAppStatus: ", error);
  }
};

// ************ //
// * SCENES
// ************ //

const getScenes = async (accessToken, appId) => {
  try {
    const res = await fetch(`${dns}/api/v2/scenes/${appId}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ getScenes: ", error);
  }
};

// ************ //
// * PLACEMENTS
// ************ //

const getPlacements = async (accessToken, data) => {
  const { appId, sceneId } = data;
  let url = `${dns}/api/v2/placements/${appId}`;
  sceneId && (url += `/${sceneId}`);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ getPlacements: ", error);
  }
};

const getPlacementsAdmin = async (accessToken, adminToken, data) => {
  const { appId, sceneId } = data;
  let url = `${dns}/api/v2/admin/placements/${appId}`;
  sceneId && (url += `/${sceneId}`);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
        "x-admin-token": adminToken,
      }),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ getPlacementsAdmin: ", error);
  }
};

const updatePlacements = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/placements/update", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ updatePlacements: ", error);
  }
};

// ************ //
// * USER
// ************ //

const updateUser = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/user/update", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ updateUser: ", error);
  }
};

const changeEmail = async (accessToken, data) => {
  try {
    const res = await fetch(dns + "/api/v2/user/update/email", {
      method: "PUT",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.error("API ERROR @ changeEmail: ", error);
  }
};

const getUserData = async accessToken => {
  try {
    const res = await fetch(dns + "/api/v2/user/preferences", {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-access-token": accessToken,
      }),
    });

    return res.json();
  } catch (error) {
    console.log("API ERROR @ getUserData: ", error);
  }
};

// ************ //
// * REPORT
// ************ //

const getReportData = async data => {
  try {
    const res = await fetch(`https://report.admix.in/report/placement/daily`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "x-auth-token":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YmU0NDc5MTIxMDBjMTMxZjJhNDQwYzEiLCJuYW1lIjoiQWRtaW4gUGxhdGZvcm0iLCJlbWFpbCI6ImFkbWluQGFkbWl4LmluIiwicm9sZSI6MCwiaWF0IjoxNTQxNjg3MTg1fQ.HcV0VUmfIHdHUHvH-EjWx35VKHj1H_IrSrBvW8Dz4lQ",
      }),
      body: JSON.stringify(data),
    });

    return res.json();
  } catch (error) {
    console.log("API ERROR @ getReportData: ", error);
  }
};

// ************ //
// * CLOUDINARY
// ************ //

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

export default {
  cloudinayImgUpload,
  cloudinayImgURL,
  login,
  register,
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
  getPlacementsAdmin,
  updatePlacements,
  getReportData,
};
