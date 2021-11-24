import { Command, Table } from '../deps.ts';
import type { ICell, IRow } from '../deps.ts';
import { fetchWallet } from '../deps.ts';
import type { Token } from './types/Token.ts';
import { wallets } from './wallets.ts';
import { version } from './version.ts';

function convertToBillion(value: number) {
  return (value / 1000000000).toFixed(2);
}

function getHoskyValuePerB(value: number) {
  return `${convertToBillion(value)}B`;
}

function convertADA(price: number) {
  if (!price) {
    return 0;
  }

  return Math.round(price / 1000000);
}

export async function generateReport(showAda: boolean) {
  const report = [];
  let totalHosky = 0;
  let totalAda = 0;

  for (const [i, addr] of wallets.entries()) {
    const { tokens, lovelaces } = await fetchWallet(addr);

    if (tokens === undefined) continue;

    const curHosky = tokens.find((cur: Token) => cur.name === 'HOSKY');

    if (curHosky === undefined) continue;

    totalHosky += curHosky.quantity;
    totalAda += convertADA(lovelaces);

    report.push([
      `#${i + 1}`,
      showAda ? `${convertADA(lovelaces)}A` : '###',
      curHosky.quantity,
      getHoskyValuePerB(curHosky.quantity),
    ]);
  }

  report.push([
    'Total:',
    showAda ? `${totalAda}A` : '###',
    totalHosky,
    getHoskyValuePerB(totalHosky),
  ]);
  return report;
}

function renderTableReport(body: IRow<ICell>[]) {
  new Table()
    .header(['Wallet', 'ADA', '$HOSKY', '$HOSKY/B'])
    .body(body)
    .maxColWidth(13)
    .padding(1)
    .border(true)
    .render();
}

async function main() {
  const { options } = await new Command()
    .name('hosky-helper')
    .description(
      'Get your total hoskys in your wallets.\nYou have to define all your wallet addresses in `wallet.ts` file and you are good to go.',
    )
    .version(version)
    .option(
      '-s, --show-ada [show-ada:boolean]',
      'Show the ADA in your wallets?',
      {
        required: true,
        default: false,
      },
    )
    .parse(Deno.args);

  const { showAda } = options;

  const report = await generateReport(showAda);
  renderTableReport(report);
}

if (import.meta.main === true) {
  await main();
}
