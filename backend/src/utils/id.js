exports.generateId = () => {
  return Math.floor(Date.now() / 1000); // seconds, fits INT
};
