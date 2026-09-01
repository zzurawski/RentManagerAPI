const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
    try {
        const webhookData = req.body;
        await processWebhookData(webhookData);
        res.sendStatus(200);
    } catch (error) {
        console.error(`Error: ${error}`);
        res.sendStatus(500);
    }
});

async function processWebhookData(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Webhook data from RM:', data);
            resolve();
        }, 2000);
    });
}