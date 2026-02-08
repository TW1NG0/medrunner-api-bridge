import * as fs from 'fs';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

async function runSetup() {
  const rl = readline.createInterface({ input, output });

  console.log('--- Medrunner & Sinric Setup (TS) ---\n');

  const token = await rl.question('Gib deinen Medrunner Refresh Token ein: ');
  const appKey = await rl.question('Gib deinen Sinric App Key ein: ');
  const appSecret = await rl.question('Gib deinen Sinric App Secret ein: ');
  const switchId = await rl.question('Gib deine Sinric Switch ID ein: ');

  const envContent = 
`MEDRUNNER_TOKEN=${token.trim()}
SINRIC_APP_KEY=${appKey.trim()}
SINRIC_APP_SECRET=${appSecret.trim()}
SINRIC_SWITCH_ID=${switchId.trim()}`;

  fs.writeFileSync('.env', envContent);

  console.log('\n✅ .env Datei wurde erfolgreich erstellt!');
  rl.close();
}

runSetup().catch(console.error);