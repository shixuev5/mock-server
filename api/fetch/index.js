import axios from 'axios';
const HTTP_ERROR = require('./httpError');

const customParams = [ 'mock', 'code', 'validate', 'delay' ];

function validateStatus(status) {
  return status % 100 === 0;
}

const fetch = axios.create({
  timeout: 5000,
  withCredentials: true,
});

fetch.notify = function(error) {
  console.error(error);
};
fetch.start = function() {

};
fetch.end = function() {

};
fetch.fail = function() {

};
fetch.enviroment = require('../../app/public/enviroment.json');

fetch.interceptors.request.use(config => {
  fetch.start();
  customParams.forEach(val => {
    if (val in config) {
      config.params[`_${val}`] = config[val];
    }
  });
  return config;
}, error => {
  fetch.fail();
  if (error.request) {
    fetch.notify({ code: error.request.status, message: HTTP_ERROR[error.request.status][1] });
  } else {
    fetch.notify({ code: error.status, message: HTTP_ERROR[error.status][1] });
  }
});

fetch.interceptors.response.use(response => {
  fetch.end();
  if (validateStatus(response.data.statusCode)) {
    response.data = response.data.data;
    return Promise.resolve(response);
  }
  fetch.notify({
    code: response.data.statusCode,
    message: response.data.message,
  });
  return Promise.reject(response);
}, error => {
  fetch.fail();
  if (error.response) {
    fetch.notify({
      code: error.response.status,
      message: HTTP_ERROR[error.response.status][1],
    });
    console.table(error.response.data);
    return Promise.reject(error.response);
  } else if (error.status) {
    fetch.notify({ code: error.status, message: HTTP_ERROR[error.status][1] });
  }
  return Promise.reject(error);
});

module.exports = fetch;
