
export const config = {
    runtime: 'edge', // Use Edge runtime for speed
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { text, level = 'intermediate', roleplay = 'general' } = await req.json();
        const apiKey = req.headers.get('x-api-key') || process.env.GROQ_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Missing API Key' }), { status: 401 });
        }

        if (!text || text.length < 2) {
            return new Response(JSON.stringify({ error: 'Text too short' }), { status: 400 });
        }

        const systemPrompt = `
      You are an expert English teacher. Analyze the user's speech transcript.
      
      CONTEXT:
      - Student Level: ${level} (Adjust your tips and score accordingly).
      - Scenario: ${roleplay === 'general' ? 'Daily conversation' : `Roleplay as: ${roleplay}`}.
      
      Return ONLY a JSON object with this exact structure (no markdown, no extra text):
      {
        "grammar_corrections": [
          { "original": "substring of error", "correction": "corrected substring", "explanation": "brief reason" }
        ],
        "fluency_score": 0-100 (integer, baselined on level complexity),
        "tips": ["tip focused on ${level} level", "tip 2"],
        "positive_feedback": "one sentence of praise relevant to the ${roleplay} context"
      }
      If the English is perfect for the ${level} level, grammar_corrections should be empty.
    `;

        const userPrompt = `Analyze this text: "${text}"`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq API Error: ${err}`);
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Analysis Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
