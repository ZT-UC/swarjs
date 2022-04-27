const REDIRECT_URI = process.env.REACT_APP_URL;

function LogOut() {
  window.localStorage.removeItem("expiryTime");
  window.localStorage.removeItem("token");
  window.location.href = REDIRECT_URI;
}

export default LogOut;
