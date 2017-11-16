module.exports = app => {
  class Api extends app.Service {
    * index() {
      const response = yield this.getApiJson();
      const api = this.ctx.helper.filterCatalog(response);
      this.ctx.helper.createRequestSchema(api);
    }
    * getApiJson() {
      const uid = '3056928-0e35a571-9bb4-958d-f30b-f4d4991b5529';
      const postman_api_key = 'd1a662ffe69243bdad748a3db6c749f3';
      const result = yield this.ctx.curl(`https://api.getpostman.com/collections/${uid}`, {
        headers: {
          'X-Api-Key': postman_api_key,
        },
        dataType: 'json',
      });
      return result.data.collection.item;
    }
  }
  return Api;
};
