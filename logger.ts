import chalk from 'chalk';

export type LogType = 'INFO' | 'WARN' | 'ERROR' | 'ALERT' | 'SUCCESS';

export function log(message: string, type: LogType = 'INFO') {

    const time = new Date().toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'

    });

    const greyTime = chalk.gray(`${time}`);

    // colors and prefixes
    const themes = {
        INFO: chalk.blue('INFO'),
        WARN: chalk.yellow('WARN'),
        ERROR: chalk.red.bold('ERR'),
        ALERT: chalk.hex('#aa0000').bold('ALERT'),
        SUCCESS: chalk.green('SUCCESS')
    };

    console.log(`[${greyTime} ${themes[type]}] ${message}`);
}