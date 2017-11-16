module.exports = () => {
  return function* mock(next) {
    const uid = '38e9671d-6909-4922-89e4-1250a288d6b6';
    const url = `https://${uid}.mock.pstmn.io`;
    const postman_api_key = 'd1a662ffe69243bdad748a3db6c749f3';
    const options = {
      method: this.request.method,
      headers: {
        'X-Api-Key': postman_api_key,
      },
      dataType: 'json',
    };
    if (this.request.query._code) options.headers['x-mock-response-code'] = +this.request.query._code;
    if (this.request.query._mock && this.request.query._mock === 'true') {
      const result = yield this.ctx.curl(`${url}${this.request.url.split('?')[0]}`, options);
      this.status = result.status;
      this.body = result.data;
      return;
    }
    yield next;
  };
};
