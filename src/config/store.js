import { createStore, applyMiddleware, combineReducers } from "redux";
import { persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

import rootReducer from "../reducers";
import persistReducer from "redux-persist/lib/persistReducer";

const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  collapsed: true,
});

const middleware = isProduction
  ? applyMiddleware(thunk)
  : applyMiddleware(thunk, logger);

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["async"],
  whitelist: ["app"],
};

const reducer = combineReducers(rootReducer);
const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer, middleware);
let persistor = persistStore(store);

export default () => ({
  persistor,
  store,
});
