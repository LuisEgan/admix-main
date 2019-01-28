import api from "../api";
import { setAsyncError } from "./asyncActions";
import { REPORT_DATA, SET_INITIAL_REPORT_APP } from "./actions";

const sendReportData = data => {
  return {
    type: REPORT_DATA,
    data,
  };
};

// * FETCH

const getReportData = ({ appsIds, accessToken, publisherId }) => dispatch => {
  const currentDate = new Date();

  const data = {
    startDate: {
      year: 2018,
      month: 1,
      day: 1,
    },
    endDate: {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      day: currentDate.getDate(),
    },
    publisherId,
  };

  api
    .getReportData(accessToken, data)
    .then(res => {
      dispatch(sendReportData(res));
    })
    .catch(error => {
      dispatch(setAsyncError(error));
    });

  // const reportData = api.getReportData(appsIds);
  // dispatch(sendReportData(reportData));
};

const setInitialReportApp = appId => dispatch => {
  dispatch({
    type: SET_INITIAL_REPORT_APP,
    data: appId,
  });
};

export default {
  getReportData,
  setInitialReportApp,
};
