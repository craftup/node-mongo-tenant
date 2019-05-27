// we need to return `function () {}` here so injection of `this` works
// properly
module.exports = ({tenantIdKey, tenantIdGetter}) => function (next) {
  if (this.constructor.hasTenantContext) {
    this[tenantIdKey] = this.constructor[tenantIdGetter]();
  }

  next();
};
