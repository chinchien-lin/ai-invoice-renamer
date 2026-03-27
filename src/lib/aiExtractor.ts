import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractEntities(text: string, template: string): Promise<Record<string, string>> {
  // Extract tokens from template like [Date]-[Vendor].pdf -> ['Date', 'Vendor']
  const tokenMatches = [...template.matchAll(/\[(.*?)\]/g)];
  const tokens = tokenMatches.map(m => m[1]);
  
  if (tokens.length === 0) return {};

  const properties: Record<string, any> = {};
  for (const token of tokens) {
    // Sanitize token name for JSON schema property key (alphanumeric and underscores)
    const safeKey = token.replace(/[^a-zA-Z0-9_]/g, '_');
    properties[safeKey] = {
      type: Type.STRING,
      description: `The extracted value for '${token}'. If the token implies a format (e.g., YYYY-MM-DD), format it exactly as requested. If not found, return an empty string.`,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract the requested information from the following invoice text.\n\nInvoice Text:\n${text.substring(0, 20000)}`,
      config: {
        systemInstruction: 'You are an expert data extractor. Extract the requested fields from the invoice text. If a field cannot be found, return an empty string. Do not hallucinate data.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties,
          required: Object.keys(properties),
        },
        temperature: 0.1,
      },
    });

    const jsonText = response.text?.trim() || '{}';
    const parsed = JSON.parse(jsonText);
    
    // Map back safe keys to original tokens
    const result: Record<string, string> = {};
    for (const token of tokens) {
      const safeKey = token.replace(/[^a-zA-Z0-9_]/g, '_');
      result[token] = parsed[safeKey] || '';
    }
    
    return result;
  } catch (error) {
    console.error("AI Extraction Error:", error);
    throw new Error("Failed to extract data via AI");
  }
}

export function generateProposedName(template: string, extractedData: Record<string, string>): string {
  let name = template;
  for (const [token, value] of Object.entries(extractedData)) {
    // Replace all instances of the token
    const regex = new RegExp(`\\[${escapeRegExp(token)}\\]`, 'g');
    name = name.replace(regex, value || 'Unknown');
  }
  return name;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
