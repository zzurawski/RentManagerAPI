const fs = require("fs");
const path = require("path");
const os = require("os");
const rmClient = require("../helpers/rentManagerClient");

// receive Letter Templates from Rent Manager API
async function getLetterTemplates() {
    const url = `/LetterTemplates?fields=Name,LetterTemplateID`;
    try {
        return await rmClient.getCollection(url);
    } catch (error) {
        console.error("Error fetching letter templates:", error);
        throw error;
    }
}

async function previewLetterTemplate(templateId, tenantId) {
    const url = `/LetterTemplates/${templateId}/RunLetterTemplates?GetOptions=ReturnHTMLUrl`;
    try {
        console.log(`Previewing letter template ${templateId} for tenant ${tenantId}`);
        const client = rmClient.getClient();
        const res = await client.post(url, [{LetterTemplateID: templateId, EntityKeyIDs: [tenantId || 2] }]);
        console.dir(res.data, { depth: null });
        const payload = res.data[0].FileLinks[0].URL || res.data[0].FileLinks[0].url || res.data[0].FileLinks[0].HtmlUrl || res.data[0].FileLinks[0].htmlUrl || res.data[0].FileLinks[0].HTMLUrl || "NO URL FOUND";
        console.log(`Received response for letter template ${templateId}: ${payload}`);

        return payload;
    } catch (error) {
        console.error("Error previewing letter template:", error);
        throw error;
    }
}

module.exports = {
    getLetterTemplates,
    previewLetterTemplate,
};