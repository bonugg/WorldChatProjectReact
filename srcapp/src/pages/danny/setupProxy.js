// const {createProxyMiddleware} = require("http-proxy-middleware");
//
// module.exports = (app) => {
//     app.use(
//         "/ws",
//         createProxyMiddleware({ target: "http://localhost:9002", changeOrigin: true, ws: true })
//     );
//     app.use(
//         "/api/v1/accessToken",
//         createProxyMiddleware({ target: "http://localhost:9002"})
//     );
// };