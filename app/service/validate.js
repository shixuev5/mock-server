const fs = require('fs');
const path = require('path');

module.exports = app => {
  class Validate extends app.Service {
    * index() {
      const request = fs.readFileSync(path.join(app.config.baseDir, './app/public/request.json'), {
        encoding: 'utf-8',
      });
      const reqItem = JSON.parse(request).filter(val => {
        let url = val.request.url.raw ? val.request.url.raw : val.request.url;
        url = url.replace(/{{\w+}}/, '').replace(/\/:\S+/, '');
        return this.ctx.path.indexOf(url) > -1;
      });
      // 当匹配到验证规则时
      if (reqItem.length) {
        const rule = reqItem[0].request.rule;
        const restful = !!reqItem[0].request.url.variable;

        for (const key of Object.keys(rule)) {
          rule[key].type = this.getValidatorType(restful, key, rule[key].type);
        }

        return app.validator.validate(rule, Object.assign({}, this.ctx.query, this.ctx.request.body, this.extraRest(this.ctx.path, reqItem[0].request.url)));
      }
      return undefined;
    }
    getValidatorType(restful, name, type) {
      // 若参数是以restful 或者 query 或者 x-www-form-urlencoded 方式提交的，则允许字符串格式的数字与布尔值
      const isUnstrict = restful || name in this.ctx.query || this.ctx.header['content-type'] === 'application/x-www-form-urlencoded';
      if (isUnstrict && [ 'number', 'boolean' ].indexOf(type) > -1) {
        return `unstrict_${type}`;
      }
      return type;
    }
    // 从url中提取出restful提交参数
    extraRest(path, url) {
      const params = {};
      if (!url.variable) return params;
      const pathArr = path.slice(1).split('/');
      url.path && url.path.forEach((val, index) => {
        if (val.search(/:\w+/) > -1) {
          params[val.slice(1)] = pathArr[index];
        }
      });
      return params;
    }
  }
  // 数字校验-允许提交字符串格式的数字
  app.validator.addRule('unstrict_number', (rule, value) => {
    if (value && !isNaN(value)) {
      value = Number(value);
    }
    if (typeof value !== 'number') {
      return 'should be a number';
    }
  });
  app.validator.addRule('unstrict_boolean', (rule, value) => {
    if (typeof value === 'boolean') return;
    if (value === 'false' || value === 'true') return;
    return 'should be a boolean';
  });
  return Validate;
};
