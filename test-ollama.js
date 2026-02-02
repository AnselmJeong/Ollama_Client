import { Ollama } from "ollama";
import * as dotenv from 'dotenv';
dotenv.config();

const rawKey = process.env.Ollama_API_KEY || '';
const cleanKey = rawKey.replace(/"/g, '').trim(); // Remove quotes if dotenv kept them
console.log(`Loaded Key: ${cleanKey.slice(0, 5)}...${cleanKey.slice(-5)} (Length: ${cleanKey.length})`);

// Explicitly pass the key in headers to be 100% sure
const client = new Ollama({
  headers: {
    'Authorization': `Bearer ${cleanKey}`
  }
});

console.log("--- DEBUG TEST START ---");
try {
  console.log("Testing webFetch with object param...");
  // @ts-ignore
  const fetchResult = await client.webFetch({ url: "https://ollama.com" });
  console.log("Success:", JSON.stringify(fetchResult, null, 2));
} catch (e) {
  console.log("webFetch Error:", e.message || e);
  if (e.status_code) console.log("Status Code:", e.status_code);
}
console.log("--- DEBUG TEST END ---");
