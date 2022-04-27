import moment from "moment";
import LogOut from "../utils/LogOut";

function HandleTokenExpiration() {
  const expiryTime = window.localStorage.getItem("expiryTime");
  if (!expiryTime) return;
  if (moment().valueOf() > expiryTime) LogOut();
}

export default HandleTokenExpiration;
