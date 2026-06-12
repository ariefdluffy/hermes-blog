import type { AIArticleResult } from '$lib/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4';
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';

const HERMES_SYSTEM_PROMPT = `You are Hermes AI Writer.

Your task:
Generate professional blog articles.

Content Categories:
- Riset (Research papers, arXiv, AI research)
- Teknologi & AI (Technology news, AI, digital innovation)
- Tutorial (Step-by-step programming & tools guides)
- Knowledge Base (Reference, documentation, general knowledge)

Rules:
- Write factual content only
- Avoid fake information
- Avoid hallucination
- Use professional journalistic tone
- SEO optimized
- Human readable
- Markdown format
- Include title
- Include excerpt
- Include tags
- Include SEO title
- Include SEO description

Content Structure:
1. Title
2. Excerpt
3. Main Content
4. Key Points
5. Conclusion
6. Tags

Style:
- modern
- informative
- concise
- high readability

Target:
- tech readers
- developers
- researchers
- students

Never:
- fabricate information
- generate clickbait misinformation`;

const CONTENT_CATEGORIES = {
	riset: 'Riset',
	'teknologi-ai': 'Teknologi & AI',
	tutorial: 'Tutorial',
	'knowledge-base': 'Knowledge Base'
} as const;

export type ContentCategory = keyof typeof CONTENT_CATEGORIES;

interface OpenAIMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

async function callOpenAI(messages: OpenAIMessage[]): Promise<string> {
	const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: OPENAI_MODEL,
			messages,
			temperature: 0.7,
			max_tokens: 4096
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`OpenAI API error: ${response.status} - ${error}`);
	}

	const data = await response.json();
	return data.choices?.[0]?.message?.content ?? '';
}

export async function generateArticle(
	source: string,
	category: ContentCategory
): Promise<AIArticleResult> {
	const categoryName = CONTENT_CATEGORIES[category];

	const userPrompt = `Based on the following source information, generate a professional ${categoryName} article.

Source information:
${source}

Respond with a JSON object with these fields:
- title: string (compelling article title)
- excerpt: string (2-3 sentence summary, max 200 chars)
- content: string (full article in markdown, 500-1500 words)
- seoTitle: string (SEO-optimized title, max 60 chars)
- seoDescription: string (SEO meta description, max 160 chars)
- tags: string[] (3-5 relevant tag names)

Only output valid JSON. No markdown fences.`;

	const result = await callOpenAI([
		{ role: 'system', content: HERMES_SYSTEM_PROMPT },
		{ role: 'user', content: userPrompt }
	]);

	try {
		// Strip markdown code fences if present
		const cleaned = result.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
		const parsed = JSON.parse(cleaned);
		return {
			title: parsed.title ?? '',
			excerpt: parsed.excerpt ?? '',
			content: parsed.content ?? '',
			seoTitle: parsed.seoTitle ?? parsed.title ?? '',
			seoDescription: parsed.seoDescription ?? parsed.excerpt ?? '',
			tags: Array.isArray(parsed.tags) ? parsed.tags : []
		};
	} catch {
		throw new Error(`Failed to parse AI article response: ${result.slice(0, 200)}`);
	}
}

export async function summarizeContent(content: string): Promise<string> {
	const userPrompt = `Summarize the following content into a concise 2-3 sentence excerpt suitable for a news article. Maximum 200 characters.

Content:
${content}`;

	const result = await callOpenAI([
		{ role: 'system', content: HERMES_SYSTEM_PROMPT },
		{ role: 'user', content: userPrompt }
	]);

	return result.trim();
}

export async function generateSeoMetadata(
	title: string,
	content: string
): Promise<{ seoTitle: string; seoDescription: string }> {
	const userPrompt = `Generate SEO metadata for this article.

Title: ${title}
Content: ${content.slice(0, 2000)}

Respond with a JSON object:
- seoTitle: string (max 60 chars, SEO-optimized)
- seoDescription: string (max 160 chars, compelling meta description)

Only output valid JSON. No markdown fences.`;

	const result = await callOpenAI([
		{ role: 'system', content: HERMES_SYSTEM_PROMPT },
		{ role: 'user', content: userPrompt }
	]);

	try {
		const cleaned = result.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
		const parsed = JSON.parse(cleaned);
		return {
			seoTitle: parsed.seoTitle ?? title,
			seoDescription: parsed.seoDescription ?? ''
		};
	} catch {
		return {
			seoTitle: title,
			seoDescription: ''
		};
	}
}

export async function generateTags(content: string): Promise<string[]> {
	const userPrompt = `Generate 3-5 relevant tags for the following content. Return only a JSON array of tag name strings. No markdown fences.

Content:
${content.slice(0, 2000)}`;

	const result = await callOpenAI([
		{ role: 'system', content: HERMES_SYSTEM_PROMPT },
		{ role: 'user', content: userPrompt }
	]);

	try {
		const cleaned = result.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
		const parsed = JSON.parse(cleaned);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}