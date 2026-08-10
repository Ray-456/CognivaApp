const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

const originalEnhance = (config.server && config.server.enhanceMiddleware) || null;

config.server = config.server || {};
config.server.enhanceMiddleware = (middleware, server) => {
  const enhanced = (req, res, next) => {
    if (req.url && req.url.includes('\\')) {
      req.url = req.url.replace(/\\/g, '/');
    }
    return middleware(req, res, next);
  };
  if (originalEnhance) {
    return originalEnhance(enhanced, server);
  }
  return enhanced;
};

module.exports = config;
