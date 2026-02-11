import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VOLUME = 0.2; 
const soundFile = path.resolve(__dirname, 'sounds', 'chime1.wav');

export function playAlert(volume: number = 0.2) {

    const player = spawn('ffplay', [
        '-nodisp',
        '-autoexit',
        '-af', `volume=${volume}`,
        soundFile
    ]);

    player.on('error', (err) => {
        console.error(chalk.red('Fehler beim Starten von ffplay:'), err.message);
        console.log(chalk.yellow('Tipp: Ist ffmpeg/ffplay in deinem PATH installiert?'));
    });

    player.stderr.on('data', (data) => {
        // Falls du Debug-Infos von ffplay sehen willst, aktiviere das nächste Log:
        // console.log(chalk.gray(data.toString()));
    });
}