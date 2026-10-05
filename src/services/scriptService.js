const rmClient = require("../helpers/rentManagerClient");
const getTenant = require("./tenantService")

// Entity Script Test
async function testEntityScript(script, entityId, entityType) {
    try {
        /* setting this manually for test
        const testScript = {
            Script: script,
            AskParameters: "",
            MetaTag: null
        };
        */
        const testScript = {
            Script: script,
            //AskParameters: "",
            MetaTag: null
        };
        console.log('testScript req: ', testScript);
        const res = await rmClient.postCollection(`/${entityType}/${entityId}/TestScript`, testScript);
        console.log('response from postSingle: ', res);
        return res;
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    testEntityScript
}