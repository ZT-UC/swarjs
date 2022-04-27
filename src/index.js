import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./components/App";
import { addBackToTop } from "vanilla-back-to-top";

ReactDOM.render(
  <React.StrictMode>
    <App />
    {addBackToTop({
      diameter: 36,
      backgroundColor: "#1db954",
      textColor: "#000",
      showWhenScrollTopIs: 150,
    })}
  </React.StrictMode>,
  document.getElementById("root")
);
