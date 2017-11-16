module.exports = app => {
  class ApiController extends app.Controller {
    * index() {
      try {
        yield this.ctx.service.api.index();
        // 请求api接口包含query参数时，进入api打包流程
        if (Object.keys(this.ctx.query).length) {
          this.ctx.body = yield this.ctx.helper.createApi(this.ctx.request);
        } else {
          this.ctx.body = 'mock-server API接口更新成功!';
        }
      } catch (e) {
        this.ctx.body = e;
      }
    }
    * doc() {
      const uuid = '3056928-0e35a571-9bb4-958d-f30b-f4d4991b5529';
      this.ctx.redirect(`https://blue-sunset-1165.postman.co/docs/collection/view/${uuid}`);
    }
  }
  return ApiController;
};
