import * as fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv'; 
import { log } from './logger.ts';
import { ensureConfig } from './setup-server.ts'; 
import { MedrunnerApiClient } from "@medrunner/api-client";
import { SinricPro, SinricProSwitch } from 'sinricpro';

//title
console.clear();
console.log("");
console.log("┏┳┓┏━╸╺┳┓┏━┓╻ ╻┏┓╻┏┓╻┏━╸┏━┓   ┏━┓┏━┓╻   ┏┓ ┏━┓╻╺┳┓┏━╸┏━╸");
console.log("┃┃┃┣╸  ┃┃┣┳┛┃ ┃┃┗┫┃┗┫┣╸ ┣┳┛   ┣━┫┣━┛┃   ┣┻┓┣┳┛┃ ┃┃┃╺┓┣╸ ");
console.log("╹ ╹┗━╸╺┻┛╹┗╸┗━┛╹ ╹╹ ╹┗━╸╹┗╸   ╹ ╹╹  ╹   ┗━┛╹┗╸╹╺┻┛┗━┛┗━╸");
console.log("┏┳┓┏━┓╺┳┓┏━╸   ┏┓ ╻ ╻   ╺┳╸╻ ╻┓┏┓╻┏━╸┏━┓");
console.log("┃┃┃┣━┫ ┃┃┣╸    ┣┻┓┗┳┛    ┃ ┃╻┃┃┃┗┫┃╺┓┃ ┃");
console.log("╹ ╹╹ ╹╺┻┛┗━╸   ┗━┛ ╹     ╹ ┗┻┛╹╹ ╹┗━┛┗━┛");
console.log("");
console.log("Version: 0.1.2");
console.log("");

//start medrunner api bridge client
async function startApp() {

  await ensureConfig();
  dotenv.config();

// validate variables
const required = ['MEDRUNNER_TOKEN', 'SINRIC_APP_KEY', 'SINRIC_APP_SECRET', 'SINRIC_SWITCH_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Kritischer Fehler: ${key} fehlt in der .env Datei!`);
    process.exit(1);
  }
}

//Medrunner API consts
const apiConfig = {refreshToken: process.env.MEDRUNNER_TOKEN,};

//Sionric Pro consts
const APP_KEY = process.env.SINRIC_APP_KEY;
const APP_SECRET = process.env.SINRIC_APP_SECRET;
const SWITCH_ID = process.env.SINRIC_SWITCH_ID;

//init Medrunner
const api = MedrunnerApiClient.buildClient(apiConfig);
const ws = await api.websocket.initialize();
await ws.start();
console.log("--------------------------");
console.log(" Medrunner API:", ws.state); 
console.log("--------------------------");

//init Sinric
const sinricpro = new SinricPro();
const mySwitch = new SinricProSwitch(SWITCH_ID);
sinricpro.add(mySwitch);

//alarm switch function
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function pulsTrigger() {
  try {
    log('Alert-state active', 'ALARM');
    await mySwitch.sendPowerStateEvent(true);
    
    await delay(120000); // Wartet sauber 2 Minuten
    
    await mySwitch.sendPowerStateEvent(false);
    log('Alert-state off', 'INFO');
  } catch (err: any) {
    log('Error: ' + err.message, 'ERROR');
  }
}

//connect to sinric pro
sinricpro.onConnected(() => {
  console.log("-----------------------");
  console.log(" Sinric Pro: Connected");
  console.log("-----------------------");
});

//auth sinric pro and begin listening on Medrunner websocket
await sinricpro.begin({ appKey: APP_KEY, appSecret: APP_SECRET });
mySwitch.sendPowerStateEvent(false);
log("Application started successfully! Listening for events...", 'SUCCESS');

//Medrunner Websocket Events

//reconnecting success
ws.onreconnected(async () => {
  log("Reconnected to the WebSocket", 'SUCCESS');
});

//connection lost warn
ws.onclose(async () => {
  log("Connection has been lost", 'WARN');
});

//Emergency created
ws.on("EmergencyCreate", () => {
  log("Emergency recieved from Medrunner API", 'INFO');
  pulsTrigger();
}); 

}

startApp().catch(console.error);