import { z } from "zod";

/** What a caller (CLI, MCP tool, …) provides to send a Telegram message. */
export const telegramMessageInputSchema = z.object({
  chatId: z.string().min(1, "chatId is required"),
  message: z.string().min(1, "message is required"),
});

/** Full set of arguments the operation needs, including the bot token. */
export const telegramMessageOptionsSchema = telegramMessageInputSchema.extend({
  botToken: z.string().min(1, "botToken is required"),
});

/** Body we send to the Telegram sendMessage API. */
export const telegramSendMessageRequestSchema = z.object({
  chat_id: z.string(),
  text: z.string(),
});

/** Shape of Telegram's sendMessage API response. */
export const telegramSendMessageResponseSchema = z.object({
  ok: z.boolean(),
  result: z
    .object({
      message_id: z.number(),
    })
    .optional(),
  description: z.string().optional(),
});

/** What sendTelegramMessage() returns to its caller. */
export const telegramMessageOutputSchema = z.object({
  ok: z.boolean(),
  chatId: z.string(),
  messageId: z.number(),
});

export type TelegramMessageInput = z.infer<typeof telegramMessageInputSchema>;
export type TelegramMessageOptions = z.infer<typeof telegramMessageOptionsSchema>;
export type TelegramMessageOutput = z.infer<typeof telegramMessageOutputSchema>;
