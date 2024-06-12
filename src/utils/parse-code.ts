/**
 * Parses code blocks from a string based on language markers.
 *
 * @param llmResponse - The string containing code blocks.
 * @param type - The type of code to extract (e.g., 'diff', 'json').
 * @returns The extracted code block, or the original string if no matching code block is found.
 */
export const parseCode = (llmResponse: string, type: 'diff' | 'json') => {
    const START_SLUG = `\`\`\`${type}`;
    const END_SLUG = `\`\`\``;
    if (!llmResponse.includes(START_SLUG)) {
        console.error('No ' + START_SLUG + '``` found in the response');
        return;
    }

    const codeStart = llmResponse.indexOf(START_SLUG);
    let codeEnd = llmResponse.lastIndexOf(END_SLUG);

    if (codeEnd < 0) {
        console.error('No ``` found in the response');
        codeEnd = llmResponse.length;
        return;
    }

    const code = llmResponse.substring(codeStart + type.length + 3, codeEnd)
        .replace(/([+-\s*])\d+\s*[\.|]\s/g, '$1') // Remove line numbers from diff
        .trim();
    return code;
};
