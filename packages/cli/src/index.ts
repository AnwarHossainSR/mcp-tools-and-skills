import { Command } from 'commander';
const program = new Command();

program
  .command("telegram")
  .description("Send messages via Telegram")
  .argument("<chatId>", "The chat ID to send the message to")
  .argument("<message>", "The message to send")
  .action(async (chatId: string, message: string) => {
    console.log(`Sending message to chat ID ${chatId}: ${message}`);
    process.exit(1);
  });


program.parseAsync(process.argv);
