import { WalletClient, ClientFactory, DefaultProviderUrls, utils, EventPoller, IEvent, fromMAS } from "@massalabs/massa-web3";
import pollAsyncEvents from "./pollAsyncEvent";
import { readFileSync } from "fs";
import path from "path";


export interface IEventPollerResult {
    isError: boolean;
    eventPoller: EventPoller;
    events: IEvent[];
  }
async function executeContract() {
    const account = await WalletClient.getAccountFromSecretKey(
      "S1JiEGozApGaUR8GzJ9CgDnw84iVVHhviXWkbt1MoXMPFqAiBC7"
    );
    const client = await ClientFactory.createDefaultClient(
      DefaultProviderUrls.BUILDNET, // provider
      true, // retry strategy
      account // base account
    );


    const opId = await client.smartContracts().deploySmartContract({
      fee: fromMAS(0.1),
      maxGas: BigInt(4_200_000_000),
      maxCoins: fromMAS(0.5),
      contractDataBinary: readFileSync(path.join(__dirname, 'build', 'test.wasm')),
    });
    console.log(opId);
    
  // async poll events in the background for the given opId
  const { isError, eventPoller, events }: IEventPollerResult =
    await utils.time.withTimeoutRejection<IEventPollerResult>(
      pollAsyncEvents(client, opId),
      20000,
    );

  console.log(isError, eventPoller, events);

  // stop polling
  eventPoller.stopPolling();

  // if errors, don't await finalization
  if (isError) {
    console.log(events);
    throw new Error(
      `Massa Deployment Error: ${JSON.stringify(events, null, 4)}`,
    );
  }
  }

  executeContract();