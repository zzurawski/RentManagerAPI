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
    const url = `/LetterTemplates/${templateId}/MergeLetterTemplate?RecipientIds=${tenantId || 2}&GetOptions=ReturnHTMLStream`;
    try {
        const client = rmClient.getClient();
        const res = await client.post(url); // this endpoint somehow does not need a request body, contained in url
        const payload = res.data; // get the HTML content from the response
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