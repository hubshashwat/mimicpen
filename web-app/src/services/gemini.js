// Gemini API service for style analysis and article generation

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Call Gemini API with the given prompt and system instruction
 */
async function callGemini(apiKey, model, prompt, systemInstruction = '') {
    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`

    const body = {
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ],
        generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 8192
        }
    }

    // Add system instruction if provided
    if (systemInstruction) {
        body.systemInstruction = {
            parts: [{ text: systemInstruction }]
        }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || `API Error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/**
 * Analyze writing samples and generate a personalized style guide
 */
export async function analyzeWritingStyle(apiKey, model, writingSamples) {
    const analyzerPrompt = `You are an expert writing analyst specializing in creating UNDETECTABLE AI writing styles.

Your goal: Create a system instruction that produces writing that passes AI detection tools (Grammarly, GPTZero, Quillbot, etc).

Analyze these writing samples deeply. Focus on what makes them HUMAN:

## ANALYSIS REQUIREMENTS:

1. **Sentence Length Variation:**
   - Map the EXACT pattern of sentence lengths (e.g., "Long, short, short, medium, fragment, long")
   - Note any sentence fragments or one-word sentences
   - Humans vary wildly. AI is too consistent.

2. **Imperfections & Quirks:**
   - Informal contractions (gonna, wanna, kinda, y'know)
   - Intentional rule-breaking (starting with "And", "But", "So")
   - Run-on sentences or comma splices the author uses
   - Parenthetical asides (like this one)
   - Em-dashes for — dramatic effect

3. **Personal Voice Markers:**
   - First-person opinions ("I think", "In my experience", "Honestly")
   - Rhetorical questions that go unanswered
   - Self-deprecating humor or admissions of uncertainty
   - Direct reader address ("you", "your", "let's")

4. **Formatting Fingerprint:**
   - Bold/italic patterns
   - One-sentence paragraphs frequency
   - Code block or example usage style
   - Bullet vs numbered list preferences

5. **BANNED AI PHRASES (Critical for detection evasion):**
   Identify phrases the author NEVER uses, plus add these common AI tells:
   - "In conclusion", "To summarize", "Furthermore", "Moreover", "Hence"
   - "It's important to note", "It's worth mentioning"
   - "Dive into", "Delve into", "Navigate", "Leverage"
   - "Robust", "Comprehensive", "Crucial", "Pivotal", "Seamless"
   - "Landscape", "Realm", "Journey", "Foster", "Cultivate"
   - "In today's [anything]", "In this article we will"
   - Any sentence starting with "This is"

6. **The Hook Pattern:**
   How do articles start? (Question? Anecdote? Bold claim? Problem statement?)

## OUTPUT FORMAT:

Create a SYSTEM INSTRUCTION that:
1. Starts with "You are a writer who writes EXACTLY like this author..."
2. Lists specific style rules with examples from the samples
3. Includes sentence length variation patterns
4. Lists 20+ BANNED phrases that must NEVER appear
5. Emphasizes imperfections and human quirks
6. Requires the AI to include uncertainty ("probably", "might", "I think")
7. Mandates at least 2-3 very short sentences (under 6 words) per paragraph
8. Requires occasional sentence fragments

---

WRITING SAMPLES TO ANALYZE:

${writingSamples}`

    return await callGemini(apiKey, model, analyzerPrompt)
}

/**
 * Generate an article using the user's style guide
 */
export async function generateArticle(apiKey, model, topic, styleGuide) {
    const antiDetectionRules = `

=== CRITICAL: ANTI-AI-DETECTION WRITING RULES ===

You MUST follow these rules to produce undetectable, human-sounding content:

## FLOW & NATURALNESS
- Write with natural, human-like flow including small imperfections
- High perplexity and burstiness (unpredictable word choices, varied rhythm)
- Conversational tone with slight informalities
- Variability in sentence structure - avoid uniformity
- Include emotional expressions ("I think," "honestly," "look,")
- Mix pacing: long sentences with short, punchy ones
- Less polished - use casual phrasing and incomplete thoughts
- Include relatable human experiences or self-awareness

## CLARITY & DIRECTNESS
- Say exactly what you mean. Be direct.
- Use plain English. Short, simple sentences.
- Cut the fluff. Skip extra adjectives and adverbs.
- No empty buzzwords or hype.
- Stay honest. No exaggeration or forced cheer.
- Sound natural. Conversational beats formal.
- Relaxed grammar is fine if it fits.

## SENTENCE RULES
- Mix sentence lengths: short, medium, long for rhythm
- Write short, punchy sentences often
- Use active voice ("We'll send" not "It will be sent")
- Break long sentences into bite-sized chunks
- Use standalone fragments when it feels natural
- Keep paragraphs under four sentences

## VOICE & TONE
- Address the reader directly as "you"
- Use minimal contractions
- Avoid semicolons completely
- Use informal connectors ("so," "then," "plus")
- Use phrasal verbs ("kick off," "figure out")
- Warm, conversational tone
- Sprinkle enthusiasm (!) sparingly
- Write as if chatting with a friend

## BANNED PHRASES (NEVER USE THESE)
- "Let's dive in" / "dive into" / "delve into"
- "In conclusion" / "To summarize" / "In summary"
- "Furthermore" / "Moreover" / "Hence" / "Thus"
- "It's important to note" / "It's worth mentioning"
- "Navigate" / "Leverage" / "Utilize"
- "Robust" / "Comprehensive" / "Crucial" / "Pivotal" / "Seamless"
- "Landscape" / "Realm" / "Journey" / "Foster" / "Cultivate"
- "In today's [anything]" / "In this article"
- "Game-changer" / "Revolutionary" / "Cutting-edge"
- Any sentence starting with "This is"
- Filler phrases like "It should be noted that"

## STRUCTURE
- Begin with a compelling hook (question, bold claim, or story)
- Add brief, relatable examples
- Insert short transitions between paragraphs
- Include one-line personal anecdotes
- End with a friendly call to action
- Preserve all key facts intact

## FINAL CHECKLIST
- Remove redundant words
- No jargon, clichés, hashtags, or emojis
- Speak confidently when sure
- Paint vivid imagery with simple language
- Keep the original structure but loosen formality

===

Now write about the following topic using the style guide AND all the rules above:`

    const enhancedSystemInstruction = styleGuide + antiDetectionRules
    return await callGemini(apiKey, model, topic, enhancedSystemInstruction)
}

/**
 * Test if API key is valid
 */
export async function testApiKey(apiKey, model = 'gemini-3-flash-preview') {
    try {
        await callGemini(apiKey, model, 'Say "API key works!" in exactly 3 words.')
        return { valid: true }
    } catch (error) {
        return { valid: false, error: error.message }
    }
}
