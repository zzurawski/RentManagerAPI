const rmClient = require('../helpers/rentManagerClient');

async function getEntities(entityType) {
  return rmClient.getCollection(`/${entityType}`);
}

module.exports = {
  getEntities,
};