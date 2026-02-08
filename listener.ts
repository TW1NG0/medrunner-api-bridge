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

async function startApp() {

    // 1. Erst Setup prüfen. Wenn .env fehlt, stoppt das Programm hier im Webserver-Modus.
    await ensureConfig();

    dotenv.config();

// 1. SETUP-CHECK (Muss ganz oben stehen!)
if (!fs.existsSync('.env')) {
  console.log('⚠️ Keine .env Konfigurationsdatei gefunden!');
  console.log('Starte Setup-Assistent...\n');

  try {
    // Führt die setup.ts aus und wartet auf Fertigstellung
    execSync('ts-node setup.ts', { stdio: 'inherit' });
    console.log('\n✅ Setup abgeschlossen.\n');
  } 

  catch (error) {
    console.error('Setup abgebrochen oder Fehler:', error);
    process.exit(1);
  }
}

// 2. DOTENV LADEN (Nachdem sichergestellt ist, dass die Datei existiert)
dotenv.config();

// 3. VALIDIERUNG (Checken, ob alle Werte drinstehen)
const required = ['MEDRUNNER_TOKEN', 'SINRIC_APP_KEY', 'SINRIC_APP_SECRET', 'SINRIC_SWITCH_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Kritischer Fehler: ${key} fehlt in der .env Datei!`);
    process.exit(1);
  }
}

// Variablen aus der .env laden

//Medrunner API
const apiConfig = {refreshToken: process.env.MEDRUNNER_TOKEN,};
//Sionric Pro
const APP_KEY = process.env.SINRIC_APP_KEY;
const APP_SECRET = process.env.SINRIC_APP_SECRET;
const SWITCH_ID = process.env.SINRIC_SWITCH_ID;

//init Medrunner
const api = MedrunnerApiClient.buildClient(apiConfig);
const ws = await api.websocket.initialize();
await ws.start();
console.log("--------------------------");
console.log(" Medrunner API:", ws.state); // HubConnectionState.Connected
console.log("--------------------------");




//init Sinric
const sinricpro = new SinricPro();
const mySwitch = new SinricProSwitch(SWITCH_ID);
sinricpro.add(mySwitch);

//Schalter Funktion
async function pulsTrigger() {
  log('Alarm-Status ist aktiviert', 'ALARM');
  await mySwitch.sendPowerStateEvent(true);  // Schalter AN
  
  setTimeout(async () => {
    await mySwitch.sendPowerStateEvent(false); // Schalter AUS (Reset für nächstes Mal)
    log('Alarm-Status ist deaktiviert.', 'INFO');
  }, 120000);
}

//Verbinden mit Sinric Pro und starte die Anwendung
sinricpro.onConnected(() => {
  console.log("-----------------------");
  console.log(" Sinric Pro: Connected");
  console.log("-----------------------");
});

await sinricpro.begin({ appKey: APP_KEY, appSecret: APP_SECRET });
mySwitch.sendPowerStateEvent(false);
log("Application started successfully! Listening for events...", 'SUCCESS');

//Medrunner Websocket Events
ws.onreconnected(async () => {
  log("Reconnected to the WebSocket", 'SUCCESS');
});
ws.onclose(async () => {
  log("Connection has been lost", 'WARN');
});

//Emergency created event listener
ws.on("EmergencyCreate", () => {
  log("Emergency recieved from Medrunner API", 'INFO');
  pulsTrigger();
}); 

}

startApp().catch(console.error);