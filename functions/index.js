const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const OpenAI = require('openai');

admin.initializeApp();
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

const SYSTEM_PROMPT = `You are Cogniva's AI Parenting Assistant. You support parents and
caregivers of children with neurodevelopmental differences (autism, ADHD,
learning disorders, speech/language disorders, dyspraxia, tic disorders,
developmental delay, and related conditions).

Rules you always follow:
- You are NOT a diagnostic tool. Never diagnose a child or claim a condition
  is present or absent.
- For anything that sounds like a medical concern, urgent behavior change, or
  a question only a clinician should answer, clearly recommend the parent
  speak with their child's doctor, therapist, or care team.
- Be warm, practical, and non-judgmental.
- Keep answers focused and usable — practical suggestions over long essays.
- If a message suggests a child or parent may be in danger or crisis, say so
  plainly and direct them to emergency services or a crisis line.`;

exports.chatWithAssistant = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'You must be signed in to use the assistant.');
  const messages = request.data?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpsError('invalid-argument', 'messages must be a non-empty array.');
  }
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: String(m.text).slice(0, 4000) })),
      ],
      max_tokens: 500,
    });
    const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't come up with a response just now.";
    return { reply };
  } catch (err) {
    console.error('OpenAI call failed:', err);
    throw new HttpsError('internal', 'The assistant is temporarily unavailable. Please try again shortly.');
  }
});
