module.exports = ({tenantIdKey, tenantIdGetter}) => function (next) {
  if (this.model.hasTenantContext) {
    const tenantId = this.model[tenantIdGetter]();

    // avoid jumping tenant context when overwriting a model.
    if ((tenantIdKey in this._update) || this.options.overwrite) {
      this._update[tenantIdKey] = tenantId;
    }

    // avoid jumping tenant context from $set operations
    const $set = this._update.$set;
    if ($set && (tenantIdKey in $set) && $set[tenantIdKey] !== tenantId) {
      $set[tenantIdKey] = tenantId;
    }
  }

  next();
};
