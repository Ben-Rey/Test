import { WalletClient, ClientFactory, DefaultProviderUrls } from "@massalabs/massa-web3";
import pollAsyncEvents from "./pollAsyncEvent";
import { readFileSync } from "fs";
import path from "path";


async function executeContract() {
    const account = await WalletClient.getAccountFromSecretKey(
      "S1JiEGozApGaUR8GzJ9CgDnw84iVVHhviXWkbt1MoXMPFqAiBC7"
    );
    const client = await ClientFactory.createDefaultClient(
      DefaultProviderUrls.BUILDNET, // provider
      true, // retry strategy
      account // base account
    );

    console.log(client);
    console.log(readFileSync(path.join(__dirname, 'build', 'test.wasm')));
    const bytes = new Uint8Array(readFileSync(path.join(__dirname, 'build', 'test.wasm')));
    const opId = await client.smartContracts().deploySmartContract({
      fee: BigInt(0),
      maxGas: BigInt(100000000000000000),
      maxCoins: BigInt(100000000000000000),
      contractDataBinary: bytes,
    });
    console.log(opId);
    pollAsyncEvents(client, opId);
  }

  executeContract();