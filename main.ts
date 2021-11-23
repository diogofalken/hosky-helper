import { Command } from 'https://deno.land/x/cliffy@v0.20.1/command/command.ts';
import { ICell } from 'https://deno.land/x/cliffy@v0.20.1/table/cell.ts';
import { IRow } from 'https://deno.land/x/cliffy@v0.20.1/table/row.ts';
import { Table } from 'https://deno.land/x/cliffy@v0.20.1/table/table.ts';
import { fetchWallet } from 'https://raw.githubusercontent.com/diogofalken/wallet-nft-calculator/fb9636f7075706958cb8ef75e0adec4309e17c72/lib/main.ts';
import { wallets } from './wallets.ts';

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

    const curHosky = tokens.find((cur) => cur.name === 'HOSKY');

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
    .version('0.0.1')
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
