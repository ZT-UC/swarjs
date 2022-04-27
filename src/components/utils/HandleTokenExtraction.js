import { useEffect } from "react";
import moment from "moment";

const token = window.localStorage.getItem("token");

function HandleTokenExtraction() {
  useEffect(() => {
    const hash = window.location.hash;

    if (!token && hash) {
      const newToken = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem(
        "expiryTime",
        moment().add(50, "m").valueOf()
      );
      window.localStorage.setItem("token", newToken);
    }
  });
}

export default HandleTokenExtraction;
