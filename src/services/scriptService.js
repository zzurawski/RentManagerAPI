const rmClient = require("../helpers/rentManagerClient");
const getTenant = require("./tenantService")

// Tenant Script Test
async function testTenantScript(script, tenantId) {
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
        const res = await rmClient.postSingle(`/Tenants/${tenantId}/TestScript`, testScript);
        console.log('response from postSingle: ', res);
        return res;
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    testTenantScript
}