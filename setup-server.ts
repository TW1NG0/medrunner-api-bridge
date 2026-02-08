import express from 'express';
import * as fs from 'fs';
import { log } from './logger.ts';


export async function ensureConfig() {
    const ENV_PATH = '.env';

    //check for existing .env
    if (fs.existsSync(ENV_PATH)) return;

    //build server
    const app = express();
    app.use(express.json());
    app.use(express.static('public'));

    //msg to user
    log("Initial setup is required: http://localhost:3000", 'WARN');

    //write .env after user submitted keys
    return new Promise((resolve) => {
        const server = app.listen(3000);

        app.post('/save-config', (req, res) => {
    const config = req.body;
    
    const lines = [
        `MEDRUNNER_TOKEN=${config.MEDRUNNER_TOKEN}`,
        `SINRIC_APP_KEY=${config.SINRIC_APP_KEY}`,
        `SINRIC_APP_SECRET=${config.SINRIC_APP_SECRET}`,
        `SINRIC_SWITCH_ID=${config.SINRIC_SWITCH_ID}`
    ];

    fs.writeFileSync(ENV_PATH, lines.join('\n'));
    
    res.json({ success: true });
    log("Initial setup completed, configuration saved to .env", 'SUCCESS');

    
    setTimeout(() => {
        server.close(() => {
            log('Setup server closed', 'INFO');
            resolve(true); 
        });
    }, 1000);
        });
    });
}