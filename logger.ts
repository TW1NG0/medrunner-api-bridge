import chalk from 'chalk';

// Definition der Typen für bessere Autovervollständigung
export type LogType = 'INFO' | 'WARN' | 'ERROR' | 'ALARM' | 'SUCCESS';

export function log(message: string, type: LogType = 'INFO') {
    // Zeitstempel im Format HH:mm:ss
    const time = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const greyTime = chalk.gray(`${time}`);

    // Farben und Präfixe für die verschiedenen Typen
    const themes = {
        INFO: chalk.blue('INFO'),
        WARN: chalk.yellow('WARN'),
        ERROR: chalk.red.bold('ERR'),
        ALARM: chalk.magenta.bold('ALARM'),
        SUCCESS: chalk.green('SUCCESS')
    };

    console.log(`[${greyTime} ${themes[type]}] ${message}`);
}