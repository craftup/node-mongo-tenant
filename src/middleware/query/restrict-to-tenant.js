module.exports = ({tenantIdKey, tenantIdGetter}) => function (next) {
  if (this.model.hasTenantContext) {
    this._conditions[tenantIdKey] = this.model[tenantIdGetter]();
  }

  next();
};
