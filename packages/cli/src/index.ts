#!/usr/bin/env node
import { sendTelegramMessage } from "@anwarhossainsr/sendkit-core";
import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { z } from "zod";

const configPath = join(homedir(), ".config", "sendkit", "config.json");

const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional(),
});

function writeTelegramBotToken(token: string): void {
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`, {
    mode: 0o600,
  });
}

function getTelegramBotToken(): string {
  if (!existsSync(configPath)) {
    throw new Error("Telegram bot token is required. Please run `sendkit init`.");
  }

  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, "utf8")));
  if (!config.telegramBotToken) {
    throw new Error("Telegram bot token is required. Please run `sendkit init`.");
  }

  return config.telegramBotToken;
}

const program = new Command();

program.name("sendkit").description("SendKit CLI backed by @anwarhossainsr/sendkit-core");

program
  .command("telegram")
  .description("Send messages via Telegram")
  .argument("<chatId>", "The chat ID to send the message to")
  .argument("<message>", "The message to send")
  .action(async (chatId: string, message: string) => {
    const result = await sendTelegramMessage({
      chatId,
      message,
      botToken: getTelegramBotToken(),
    });
    console.log(JSON.stringify(result));
  });

program
  .command("init")
  .description("Configure the SendKit CLI local settings")
  .requiredOption("--telegram-bot-token <token>", "The Telegram bot token")
  .action((options: { telegramBotToken: string }) => {
    writeTelegramBotToken(options.telegramBotToken);
    console.log(`Saved SendKit CLI configuration to ${configPath}`);
  });

await program.parseAsync(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
