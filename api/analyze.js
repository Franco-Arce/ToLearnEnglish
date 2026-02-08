
export const config = {
    runtime: 'edge', // Use Edge runtime for speed
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { text, level = 'intermediate', roleplay = 'general', isConversation = false } = await req.json();
        const apiKey = req.headers.get('x-api-key') || process.env.GROQ_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Missing API Key' }), { status: 401 });
        }

        if (!text || text.length < 2) {
            return new Response(JSON.stringify({ error: 'Text too short' }), { status: 400 });
        }

        const roleplayContexts = {
            general: "an expert English teacher",
            restaurant: "a waiter in a fancy restaurant",
            interview: "a professional job interviewer",
            travel: "an airport immigration officer",
            medical: "a doctor in a clinic"
        };

        const systemPrompt = `
      You are ${roleplayContexts[roleplay] || roleplayContexts.general}.
      Analyze the user's speech transcript and provide feedback.
      
      STUDENT LEVEL: ${level}
      SCENARIO: ${roleplay}
      MODE: ${isConversation ? 'CONVERSATION (You MUST reply to the user to keep the dialogue going)' : 'ANALYSIS (Focus on grammar and fluency only)'}

      Return ONLY a JSON object with this exact structure:
      {
        "grammar_corrections": [
          { "original": "error text", "correction": "fixed text", "explanation": "brief reason" }
        ],
        "fluency_score": 0-100,
        "tips": ["tip focused on ${level} level", "tip 2"],
        "positive_feedback": "one sentence of praise relevant to the context",
        "reply": ${isConversation ? '"Character response to the user, in English, keeping the conversation active."' : 'null'}
      }
      If the English is perfect for the ${level} level, grammar_corrections should be empty.
    `;

        const userPrompt = `User said: "${text}"`;

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
                temperature: 0.7,
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
