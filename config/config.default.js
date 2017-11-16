module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1509363690223_9514';

  // add your config here
  config.middleware = [];

  // cors config
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.security = {
    csrf: {
      enable: false,
    },
    xframe: {
      enable: false,
    },
    xssProtection: {
      enable: false,
    },
    noopen: {
      enable: false,
    },
    nosniff: {
      enable: false,
    },
  };

  return config;
};
