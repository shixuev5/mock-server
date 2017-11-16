const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

module.exports = app => {
  class ProxyController extends app.Controller {
    * index() {
      const proxy = fs.readFileSync(path.join(app.config.baseDir, './app/public/proxy.json'), {
        encoding: 'utf-8',
      });
      const changeProxy = JSON.parse(proxy).map(val => {
        if (val.name in this.ctx.query) {
          val.host = this.ctx.query[val.name];
        }
        return val;
      });
      fs.writeFileSync(path.join(this.config.baseDir, 'app/public/proxy.json'), JSON.stringify(changeProxy, null, 4));
      exec('npm run stop && npm run start', function(err) {
        if (err) throw err;
        this.ctx.body = `代理切换成功！ 当前代理环境为${changeProxy}`;
      });
    }
  }
  return ProxyController;
};
