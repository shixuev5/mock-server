const fetch = require('../fetch');
const reqJSON = require('../../app/public/request.json');

const methods = [ 'PUT', 'POST', 'PATCH' ];
const mode = [ 'file', 'formdata' ];

// 请求函数构造函数
function fnFactory(req) {
  return function fn(obj = {}, data = {}, config) {

    const reqConfig = Object.assign({}, {
      method: req.method,
      url: createUrl(req.url.raw ? req.url.raw.split('?')[0] : req.url),
      headers: arr2obj(req.header),
    }, config == null ? data : config);

    // 处理:id等restful参数
    if (req.url.variable) {
      const result = [];
      req.url.variable.forEach(val => {
        if (val.key in obj) {
          reqConfig.url = reqConfig.url.replace(new RegExp(`:${val.key}`), obj[val.key]);
          delete obj[val.key];
        } else {
          result.push({ code: 'missing_field',
            field: val.key,
            message: 'required',
          });
        }
      });
      if (result.length) {
        return console.table(result);
      }
    }

    // 如果body为File或FormData那么接受的第二个参数data为作为data传递，第一个参数为params
    if (mode.indexOf(req.body.mode) > 0) {
      reqConfig.data = data;
      reqConfig.params = obj;
      // 类型为file或者formdata时，取消mock server参数校验
      reqConfig.validate = false;
    }

    if (methods.indexOf(req.method) > 0) {
      // 如果put、post、patch等方法中包含params，则从obj中分离出params和data，否则直接将obj作为data
      if (req.url.query) {
        const { objData, objParams } = splitObj(obj, req);
        reqConfig.data = objData;
        reqConfig.params = objParams;
      } else {
        reqConfig.data = obj;
      }
    } else {
      reqConfig.params = obj;
    }

    return fetch(reqConfig);
  };
}

// 导出请求函数
function exportReqFn(reqList) {
  const obj = {};
  for (const { request } of reqList) {
    obj[request.name] = fnFactory(request);
  }
  return obj;
}

// 将数组转换为obj返回
function arr2obj(arr) {
  const obj = {};
  arr.forEach(val => {
    obj[val.key] = val.value;
  });
  return obj;
}

// 根据定义的请求参数，从传递过来的obj中分离params和data
function splitObj(obj, req) {
  const params = {};
  const data = {};
  Object.keys(arr2obj(req.url.query))
    .forEach(key => {
      if (obj[key]) {
        params[key] = obj[key];
      } else {
        data[key] = obj[key];
      }
    });
  return {
    params,
    data,
  };
}

// 根据enviroment参数替换环境变量创建请求url
function createUrl(url) {
  const variable = url.match(/{{(\w+)}}/)[1];
  return (fetch.enviroment.mockServer ? fetch.enviroment.mockServer : fetch.enviroment[variable]) + url.replace(/{{\w+}}/, '');
}

module.exports = exportReqFn(reqJSON);
