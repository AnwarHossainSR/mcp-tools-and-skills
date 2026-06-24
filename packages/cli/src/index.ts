import { Command } from 'commander';
import { sendTelegramMessage } from '@sendkit/core';

const program = new Command();

program
  .name('sendkit')
  .description('SendKit CLI');

program
  .command('telegram')
  .description('Send messages via Telegram')
  .argument('<chatId>', 'The chat ID to send the message to')
  .argument('<message>', 'The message to send')
  .action(async (chatId: string, message: string) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('Missing TELEGRAM_BOT_TOKEN environment variable');
      process.exit(1);
    }

    if (!chatId || !message) {
      console.error('Chat ID and message are required');
      process.exit(1);
    }

    try {
      const result = await sendTelegramMessage({ chatId, message, botToken });
      console.log(`Telegram message sent. Message ID: ${result.messageId}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(`Telegram API request failed: ${detail}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
