import * as fs from 'fs';
import { execSync } from 'child_process';
import { spawn } from 'child_process';
import chalk from 'chalk';
import dotenv from 'dotenv'; 
import { log } from './logger.ts';
import { ensureConfig } from './setup-server.ts'; 
import { MedrunnerApiClient } from "@medrunner/api-client";
import { SinricPro, SinricProSwitch } from 'sinricpro';
import pkg from './package.json' with { type: 'json' };
import { playAlert } from './play.ts'
import * as readline from 'readline';

const mdrnRed = chalk.hex('#aa0000');
const version: string = pkg.version;

let cVol = fs.existsSync('./.volume') 
    ? parseFloat(fs.readFileSync('./.volume', 'utf-8')) 
    : 0.15;

//command prompt interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: chalk.hex('#aa0000')(' > ')
});

//hijack console.log
const originalLog = console.log;
console.log = (...args: any[]) => {
  process.stdout.write('\r\x1b[K'); 
  originalLog(...args);
};

// Error und Warnungen ebenfalls umleiten
console.warn = console.log;
console.error = console.log;

//title
console.clear();
console.log("");
console.log(chalk.bgHex('#aa0000').white.bold(" ┏┳┓┏━╸╺┳┓┏━┓╻ ╻┏┓╻┏┓╻┏━╸┏━┓   ┏━┓┏━┓╻   ┏┓ ┏━┓╻╺┳┓┏━╸┏━╸ "));
console.log(chalk.bgHex('#aa0000').white.bold(" ┃┃┃┣╸  ┃┃┣┳┛┃ ┃┃┗┫┃┗┫┣╸ ┣┳┛   ┣━┫┣━┛┃   ┣┻┓┣┳┛┃ ┃┃┃╺┓┣╸  "));
console.log(chalk.bgHex('#aa0000').white.bold(" ╹ ╹┗━╸╺┻┛╹┗╸┗━┛╹ ╹╹ ╹┗━╸╹┗╸   ╹ ╹╹  ╹   ┗━┛╹┗╸╹╺┻┛┗━┛┗━╸ "));
console.log(" ┏┳┓┏━┓╺┳┓┏━╸   ┏┓ ╻ ╻   ╺┳╸╻ ╻┓┏┓╻┏━╸┏━┓ ");
console.log(" ┃┃┃┣━┫ ┃┃┣╸    ┣┻┓┗┳┛    ┃ ┃╻┃┃┃┗┫┃╺┓┃ ┃ ");
console.log(" ╹ ╹╹ ╹╺┻┛┗━╸   ┗━┛ ╹     ╹ ┗┻┛╹╹ ╹┗━┛┗━┛ ");
console.log("");
console.log(chalk.bgWhite.hex('#aa0000').bold(` v${pkg.version} `));
console.log("");
console.log(chalk.gray(" Type 'help' for a list of commands"));
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
let alarmTimer: NodeJS.Timeout | null = null;

async function pulsTrigger() {
  try {

    //delete current timer if there is one
    if (alarmTimer) {
      clearTimeout(alarmTimer); 
      log('Restarting alert sequence', 'INFO');
      
      await mySwitch.sendPowerStateEvent(false); //turn off switch
      
      await delay(3000); // wait 3 sec

    }

    //(re)start alert state
    log('Alert-state on', 'INFO');
    playAlert(cVol);
    await mySwitch.sendPowerStateEvent(true);

    //(re)start timer
    alarmTimer = setTimeout(async () => {
      try {
        await mySwitch.sendPowerStateEvent(false);
        log('Alert-state off', 'INFO');
        alarmTimer = null; 
      } catch (err: any) {
        log('Fault turning switch off: ' + err.message, 'ERROR');
      }
    }, 120000); // 120.000 ms = 2 Min

  } catch (err: any) {
    log('Error triggering alert sequenz: ' + err.message, 'ERROR');
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
//show prompt
rl.prompt(); 

//Medrunner Websocket Events
ws.onreconnected(async () => log("Reconnected to the WebSocket", 'SUCCESS'));

ws.onclose(async () => log("Connection has been lost", 'WARN'));

ws.on("EmergencyCreate", () => {
  log("Emergency received from Medrunner API", 'ALERT');
  pulsTrigger();
});

//commmand interpreter
  rl.on('line', async (line) => {
    const input = line.trim().toLowerCase();
    const [cmd, ...args] = input.split(' ');

    switch (cmd) {
      case 'help':
        console.log(chalk.yellow("\navailable commands:"));
        console.log(chalk.white("  test") + "          - simulate alert-event");
        console.log(chalk.white("  stop") + "          - stop current alert-event");
        console.log(chalk.white("  status") + "        - shows API and websocket status");
        console.log(chalk.white("  version") + "       - shows Medrunner API Bridge version");
        console.log(chalk.white("  setup") + "         - setup to change tokens / devices\n");
        console.log(chalk.white("  clear") + "         - clears the terminal feed");
        console.log(chalk.white("  exit") + "          - close Medrunner API Bridge\n");
        break;

      case 'test':
        log("triggering test alert", 'INFO');
        await pulsTrigger();
        break;

      case 'stop':
        if (alarmTimer) {
          clearTimeout(alarmTimer);
          alarmTimer = null;
          await mySwitch.sendPowerStateEvent(false);
          log("alert-state deactived", 'INFO');
        } else {
          await mySwitch.sendPowerStateEvent(false);
          log("No current timer available", 'INFO');
        }
        break;

      case 'status':
        console.log("------------------------------------------");
        console.log(` Medrunner API: ${chalk.cyan(ws.state)}`);
        console.log(` Sinric Pro:    ${chalk.green("Connected")}`);
        console.log(` Alarm-Aktiv:   ${alarmTimer ? chalk.red("YES") : chalk.gray("NO")}`);
        console.log(` Volume:        ${chalk.gray(cVol * 100, "%")}`);
        console.log("------------------------------------------");
        break;

      case 'version':
        console.log(chalk.bgWhite.hex('#aa0000').bold(` Medrunner API Bridge v${version} `));
        break;

      case 'clear':
        console.clear();
        break;

      case 'exit':
        log("", 'WARN');
        process.exit(0);
        break;

      case 'setvol':
        const rawValue = args[0];
        const volumeNum = parseInt(rawValue);
        if (!isNaN(volumeNum) && volumeNum >= 0 && volumeNum <= 100) {
          cVol = volumeNum / 100; 
          fs.writeFileSync('./.volume', cVol.toString());
          log(`set volume to ${volumeNum}%`, 'INFO');
        } else {
          log("Please enter a number between 0 and 100", 'ERROR');
        }
        break;

      case 'setup':
        try {
            await ensureConfig(true); 
            
            console.log("\n" + chalk.bgGreen.black.bold(" SAVED CONFIG "));
            log("Please restart the Medrunner API Bridge to have the changes take effect", 'WARN');
            
            setTimeout(() => process.exit(0), 2000);

        } catch (err: any) {
            log(`Setup-Error: ${err.message}`, 'ERROR');
        }
        break;

      case '': 
        break;

      default:
        console.log(chalk.red(`Unknown Command: ${cmd}. Type 'help' for a list of commands`));
        break;
    }
  });
}

startApp().catch(console.error);