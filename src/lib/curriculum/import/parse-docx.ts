import { readFile } from "node:fs/promises";
import mammoth from "mammoth";

export interface DocxTextResult {
  text: string;
  messages: string[];
}

export async function readDocxText(filePath: string): Promise<DocxTextResult> {
  const buffer = await readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value.replace(/\r\n/g, "\n"),
    messages: result.messages.map((message) => message.message),
  };
}
