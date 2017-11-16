module.exports = app => {
  const proxy = require('./public/proxy.json');
  const proxyMiddlewares = proxy.map(val => app.middlewares.proxy(Object.assign({
    host: val.host,
    jar: true,
  }, {
    match: val.match,
  })));

  const validate = app.middlewares.validate();
  const mock = app.middlewares.mock();

  app.get('/', 'api.doc');
  app.get('/api', 'api.index');
  app.get('/proxy', 'proxy.index');

  const matchUrl = /^(?!\/api)|(?!\/proxy)/;

  app.head(matchUrl, mock, validate, ...proxyMiddlewares);
  app.options(matchUrl, mock, validate, ...proxyMiddlewares);
  app.get(matchUrl, mock, validate, ...proxyMiddlewares);
  app.post(matchUrl, mock, validate, ...proxyMiddlewares);
  app.put(matchUrl, mock, validate, ...proxyMiddlewares);
  app.patch(matchUrl, mock, validate, ...proxyMiddlewares);
  app.del(matchUrl, mock, validate, ...proxyMiddlewares);
};
