import { User, Message } from "discord.js";

import config = require("../../../configs/config.json");
import { TListener } from "../../loaders/loadEvents";
import { createLogger } from "../../lib";
import CommandContext from "./Context";

// Middleware.
import antiSpam, { ISpamInfo } from "./antiSpam";
import commandDispatcher from "./commandDispatcher";
import didYouMean from "./didYouMean";

export interface IMessage extends Message {
  author: User;
}

const log = createLogger("events:message");
const readyListener: TListener = client => {
  client
    .use(antiSpam)
    .use(commandDispatcher)
    .use(didYouMean);
  
  return client.on("message", (msg: IMessage) => {
    setImmediate(async () => {
      try {
        const ctx = new CommandContext(client, msg, config, log.child(msg.id));

        await client.messageStack.handler(ctx);
      } catch (err) {
        log.error(err);
      }
    });
  });
};

export { CommandContext, ISpamInfo };
export default readyListener;