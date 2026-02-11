import chalk from 'chalk';
import pkg from './package.json' with { type: 'json' };

export async function mdrnApiTitle() {
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
console.log(chalk.gray(" Tippe 'help' für verfügbare Befehle."));
console.log("");
return;
}