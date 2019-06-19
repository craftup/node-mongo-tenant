module.exports = ({schema, key, type, required}) => {
  const field = {
    [key]: {
      index: true,
      type: type,
      required: required,
    }
  };

  schema.add(field);
};
