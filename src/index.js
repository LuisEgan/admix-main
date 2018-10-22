import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { LastLocationProvider } from "react-router-last-location";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";

import "./index.css";
import "react-table/react-table.css";

// bootstrap
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
// import "../node_modules/bootstrap/dist/js/bootstrap.min.js";

import configureStore from "./config/store";
import App from "./views/App";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
   faStroopwafel,
   faPen,
   faAngleUp,
   faUniversity,
   faMousePointer,
   faMinusSquare,
   faGamepad,
   faEye
} from "@fortawesome/free-solid-svg-icons";

library.add(
   faStroopwafel,
   faPen,
   faAngleUp,
   faUniversity,
   faMousePointer,
   faMinusSquare,
   faGamepad,
   faEye
);

const { persistor, store } = configureStore();

const render = Component => {
   ReactDOM.render(
      <Provider store={store}>
         <PersistGate persistor={persistor}>
            <BrowserRouter>
               <LastLocationProvider>
                  <Component />
               </LastLocationProvider>
            </BrowserRouter>
         </PersistGate>
      </Provider>,
      document.getElementById("root")
   );
};

// Render app
render(App);
