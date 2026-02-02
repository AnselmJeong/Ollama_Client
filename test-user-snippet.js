import { Ollama } from "ollama";
import * as dotenv from 'dotenv';
dotenv.config();

// Ensure the env var is set according to SDK expectation (case-sensitive)
process.env.OLLAMA_API_KEY = process.env.Ollama_API_KEY;

const client = new Ollama();

console.log("--- START USER TEST ---");
try {
  // Verbatim from user request: client.webFetch("https://ollama.com")
  // @ts-ignore
  const fetchResult = await client.webFetch("https://ollama.com");
  console.log("fetchResult:", JSON.stringify(fetchResult, null, 2));
} catch (e) {
  console.log("Error:", e.message || e);
}
console.log("--- END USER TEST ---");
