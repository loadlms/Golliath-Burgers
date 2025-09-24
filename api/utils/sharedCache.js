// Cache global compartilhado entre APIs
let globalCache = null;

function setGlobalCache(data) {
  globalCache = data;
}

function getGlobalCache() {
  return globalCache;
}

function hasGlobalCache() {
  return globalCache !== null;
}

module.exports = {
  setGlobalCache,
  getGlobalCache,
  hasGlobalCache
};