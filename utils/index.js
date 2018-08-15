module.exports = {
  uuid() {
    return Math.random().toString(36).substring(4) + (new Date()).getTime().toString(36);
  },
};
