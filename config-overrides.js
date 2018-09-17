const rewireSass = require('react-app-rewire-sass-modules');

module.exports = {
  webpack: rewireSass,

  devServer: function (configFunction) {
    return function (proxy, allowedHost) {
      proxy = proxy || {};

      Object.assign(proxy, {
        "/api": {
          changeOrigin: true,
          target: process.env.APP_API_PROXY,
          pathRewrite: {
            "^/api": "/"
          }
        }
      });

      return configFunction(proxy, allowedHost);
    }
  }
};
