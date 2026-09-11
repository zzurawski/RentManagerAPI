const fs = require("fs");
const path = require("path");
const os = require("os");
const rmClient = require("../helpers/rentManagerClient");

async function getLetterTemplates() {
  try {
    const url = `/LetterTemplates?fields=Name`;
    const response = await rmClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching letter templates:", error);
    throw error;
  }
}