module.exports = () => {
  const cache = {};
  return {
    has: (name, id) => (cache[name] && cache[name][id] && true) || false,
    get: (name, id) => cache[name] && cache[name][id],
    set: (name, id, value) => {
      cache[name] = {
        ...(cache[name] || {}),
        [id]: value,
      };
    },
  };
};
