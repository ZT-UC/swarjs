function Mode(int) {
  switch (int) {
    case 0:
      return "Minor";
    case 1:
      return "Major";
    default:
      return "None available";
  }
}

export default Mode;
