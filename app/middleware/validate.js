const sleep = ms => cb => setTimeout(cb, ms);

module.exports = () => {
  return function* validate(next) {
    if (this.request.query._delay) {
      yield sleep(+this.request.query._delay);
      delete this.request.query._delay;
    }
    if (this.request.query._validate !== 'false') {
      const response = yield this.service.validate.index();
      if (response) {
        this.status = 403;
        this.body = response;
        return;
      }
    }
    yield next;
  };
};
