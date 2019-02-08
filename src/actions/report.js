import api from "../api";
import { setAsyncError, setAsyncLoading } from "./asyncActions";
import { REPORT_DATA, SET_INITIAL_REPORT_APP } from "./actions";

const getReportData = ({
  appsIds,
  accessToken,
  publisherId,
}) => async dispatch => {
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

  try {
    const res = await api.getReportData(data);
    if (!res.success) throw res.message;

    dispatch({
      type: REPORT_DATA,
      data: res,
    });
    dispatch(setAsyncLoading(false));
  } catch (error) {
    console.log("error: ", error);
    // dispatch(setAsyncError(error));
  }
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
