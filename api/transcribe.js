
// Vercel Serverless Function
// Handles multipart/form-data upload and forwards to Groq

export const config = {
    api: {
        bodyParser: false, // Disallow default body parsing to handle FormData
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for API Key
    const apiKey = req.headers['x-api-key'] || process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API Key' });
    }

    try {
        // We need to parse the incoming FormData (audio file)
        // Since we can't use 'formidable' easily in standard Web API environment of Vercel Edge/Node without deps,
        // we will simple forwarding approach if possible, or use a basic buffer parsing.

        // HOWEVER, specific to Vercel Node.js functions, we usually need 'busboy' or similar. 
        // BUT, we can also forward the raw body if we are careful.

        // Easier approach for this "No-Deps" preference:
        // Let client send raw binary body with correct Content-Type, easier to proxy.
        // OR: Use 'formdata-node' / 'node-fetch' if installed.

        // Given the constraints and likely "standard" environment:
        // We will assume the client sends a FormData. To parse it without extra deps is hard in Node.
        // STRATEGY PIVOT: Client sends Blob directly as Body? 
        // Better: Client sends JSON with base64? (Audio size < 4MB usually for snippets) -> Easiest for No-Deps.
        // Let's try FormData with native fetch if Node 18+.
        // Actually, Vercel supports standard Request/Response in Edge functions, but this is a Node function (default).

        // Let's try the simplest robust way: Client sends raw audio bytes content-type: audio/webm.
        // We read the buffer and send to Groq.

        // Reading chunks from request
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Groq requires multipart/form-data.
        // We construct a multipart request manually or use 'undici' (built-in Node 18).

        const boundary = '--------------------------' + Date.now().toString(16);

        // Minimal Multipart construction for a single file "file" and model "model"
        // This is low-level but avoids npm install errors if user environment is restricted.

        const model = 'distil-whisper-large-v3-en';
        const filename = 'recording.webm';

        let parts = [];

        // 1. Model field
        parts.push(Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="model"\r\n\r\n` +
            `${model}\r\n`
        ));

        // 2. File field
        parts.push(Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
            `Content-Type: audio/webm\r\n\r\n`
        ));
        parts.push(buffer);
        parts.push(Buffer.from(`\r\n`));

        // 3. Response Format (optional, default json)
        parts.push(Buffer.from(
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="response_format"\r\n\r\n` +
            `json\r\n`
        ));

        // Closing boundary
        parts.push(Buffer.from(`--${boundary}--`));

        const payload = Buffer.concat(parts);

        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'Content-Length': payload.length,
            },
            body: payload
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            throw new Error(`Groq API Error: ${groqRes.status} ${errText}`);
        }

        const data = await groqRes.json();
        return res.status(200).json({ text: data.text });

    } catch (error) {
        console.error('Transcription Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
