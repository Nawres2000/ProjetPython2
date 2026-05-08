const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // FastAPI backend (auth, predict, health) → port 8000
  app.use(
    "/backend",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: true,
      pathRewrite: { "^/backend": "" },
    })
  );

  // Recommender service → port 8001
  app.use(
    "/recommender",
    createProxyMiddleware({
      target: "http://localhost:8001",
      changeOrigin: true,
      pathRewrite: { "^/recommender": "" },
    })
  );
};
