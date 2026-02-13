const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function parseWithLLM(query) {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are a query parser for an electronics e-commerce platform.

Return ONLY valid JSON with:
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
    });

    const content = completion.choices[0].message.content;

    const structured = JSON.parse(content);

    return structured;

  } catch (error) {
    console.error("Groq Parsing failed:", error.message);
    return null;
  }
}

module.exports = { parseWithLLM };
