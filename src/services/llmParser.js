const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function parseWithLLM(query) {
  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are a query parser for an electronics e-commerce platform.

Extract structured information from the user query.

Return ONLY valid JSON with these fields:
{
  "brand": string | null,
  "product": string | null,
  "modelNumber": number | null,
  "color": string | null,
  "minStorageGB": number | null,
  "maxPrice": number | null,
  "intent": "cheap" | "latest" | null,
  "category": "mobile" | "accessory" | null
}

If not present, use null.
`
          },
          {
            role: "user",
            content: query
          }
        ],
      }),

      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("LLM Timeout")), 9000)
      )
    ]);

    const structured = JSON.parse(completion.choices[0].message.content);

    return structured;

  } catch (error) {
    console.error("LLM Parsing failed:", error.message);
    return null;
  }
}

module.exports = { parseWithLLM };
