function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Endpoint not found"
  });
}

module.exports = notFoundHandler;
