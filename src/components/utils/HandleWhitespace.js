function HandleWhitespace(e) {
  if (e.target.value.length === 0 && e.key === " ") {
    e.preventDefault();
  }
}

export default HandleWhitespace;
