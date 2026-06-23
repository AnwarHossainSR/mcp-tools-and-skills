import { Command } from 'commander';
const program = new Command();

async function sendTelegramMessage(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Missing TELEGRAM_BOT_TOKEN environment variable');
    process.exit(1);
  }

  if (!chatId || !message) {
    console.error('Chat ID and message are required');
    process.exit(1);
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  const data = (await res.json()) as { ok: boolean; description?: string };
  if (!data.ok) {
    console.error(`Telegram API error: ${data.description}`);
    process.exit(1);
  }

  console.log(`Message sent to chat ID ${chatId}`);
}

program
  .command("telegram")
  .description("Send messages via Telegram")
  .argument("<chatId>", "The chat ID to send the message to")
  .argument("<message>", "The message to send")
  .action(async (chatId: string, message: string) => {
    await sendTelegramMessage(chatId, message);
  });

program.parseAsync(process.argv);
