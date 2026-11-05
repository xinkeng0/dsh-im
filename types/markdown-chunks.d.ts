/** Divide Markdown at block boundaries, keeping fenced code and table headers valid. */
export function chunkMarkdownText(text: string, limit?: number): string[];
