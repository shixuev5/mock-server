const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

module.exports = {
  // 从结果中过滤目录，生成请求api数组
  filterCatalog(items) {
    let apis = [];
    items.forEach(item => {
      if ('item' in item) {
        apis = apis.concat(this.filterCatalog(item.item));
      } else {
        apis.push(item);
      }
    });
    return apis;
  },
  // 生成请求定义文件request.json放置在public中，用来保存请求信息
  createRequestSchema(apis) {
    const request = apis.filter(api => api.name.indexOf('|') > -1 || api.name === '')
      .map(api => {
        api.name = api.name ? api.name : api.response[0].name;
        api.request.name = api.name.split('|')[1];
        // 不为file 和 formdata类型数据生成参数校验规则
        if (![ 'file', 'formdata' ].includes(api.request.body.mode)) {
          api.request.rule = this.createRule(this.str2arr(api.request.description));
        }
        // 当存在example时，api.request.method api.request.url api.name 为空 需要从response.originalRequest中获取
        if (!api.request.method || !api.request.url) {
          const { method, url, header } = api.response[0].originalRequest;
          api.request.method = method;
          api.request.url = url;
          api.request.header = header;
        }
        delete api.request.description;
        delete api.response;
        return api;
      });
    fs.writeFileSync(path.join(this.config.baseDir, 'app/public/request.json'), JSON.stringify(request, null, 4));
  },
  str2arr(description) {
    // 从描述中过滤出规则定义
    return description.split('|')
      .map(x => x.trim().replace(/:?-{2,}:?/, ''))
      .filter(x => !/[\u4e00-\u9fa5]+/.test(x) && x !== '');
  },
  createRule(ruleArr) {
    const rule = {};
    for (let index = 0; index < ruleArr.length; index += 3) {
      if (ruleArr[index + 1] === 'object') {
        rule[ruleArr[index]] = {
          type: 'object',
          required: ruleArr[index + 2] === 'true',
          rule: (function(arr) {
            const rule = {};
            for (let index = 0; index < arr.length; index += 3) {
              if (arr[index][0] === '-') {
                rule[arr[index].slice(1)] = {
                  type: arr[index + 1],
                  require: arr[index + 2] === 'true',
                };
              } else {
                return rule;
              }
            }
          }(ruleArr.slice(index + 3))),
        };
      } else if (ruleArr[index][0] !== '-') {
        rule[ruleArr[index]] = {
          type: ruleArr[index + 1],
          required: ruleArr[index + 2] === 'true',
        };
      }
    }
    return rule;
  },
  // api接口打包
  createApi(request) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(this.config.baseDir, 'app/public/enviroment.json'), JSON.stringify(request.query, null, 4), function(err) {
        if (err) reject(err);
        exec('npm run package', function(err) {
          if (err) reject(err);
          resolve(`<script src="${request.origin}/public/api.min.js" async defer></script>`);
        });
      });
    });
  },
};
