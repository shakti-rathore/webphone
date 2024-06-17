import React from "react";
import ReactDOM from "react-dom";
import { GlobalContextProvide } from "./ContextHooks/GlobalContextProvide";
import Routes from "./Routes/Routes";

ReactDOM.render(
  <React.StrictMode>
   <GlobalContextProvide>
   <Routes/>
   </GlobalContextProvide>
  </React.StrictMode>,
  document.getElementById("root")
);
