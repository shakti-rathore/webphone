import React from "react";
import ReactDOM from "react-dom";
import { GlobalContextProvide } from "./context/GlobalContextProvide";
import Router from "./router/route";

ReactDOM.render(
  <React.StrictMode>
   <GlobalContextProvide>
   <Router/>
   </GlobalContextProvide>
  </React.StrictMode>,
  document.getElementById("root")
);
