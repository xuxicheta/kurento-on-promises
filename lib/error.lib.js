class DetailedError extends Error {
  constructor(message) {
    super(message);
    this.details = null;
  }
}

module.exports.DetailedError = DetailedError;
