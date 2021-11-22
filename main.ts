import { fetchWallet } from "https://raw.githubusercontent.com/diogofalken/wallet-nft-calculator/fb9636f7075706958cb8ef75e0adec4309e17c72/lib/main.ts";
import { wallets } from "./wallets.ts";

let totalHosky = 0;

function convertToBillion(value: number) {
  return (value / 1000000000).toFixed(2);
}

function getHoskyValue(value: number) {
  return `${value} | ${convertToBillion(value)}B`;
}

async function main() {
  let totalHosky = 0;

  console.log("----------");
  for (const [i, addr] of wallets.entries()) {
    const { tokens } = await fetchWallet(addr);

    if (tokens === undefined) continue;

    const curHosky = tokens.find((cur) => cur.name === "HOSKY");

    if (curHosky === undefined) continue;

    totalHosky += curHosky.quantity;

    console.log(`Wallet ${i + 1}: ${getHoskyValue(curHosky.quantity)}`);
  }
  console.log("----------");
  console.log(`Total: ${getHoskyValue(totalHosky)}`);
}

if (import.meta.main === true) {
  await main();
}
