// Tokenizer
export class Tokenizer {
  tokenize(text: string): string[] {
    if (!text) return [];

    // Split by whitespace and filter empty strings
    const tokens = text.split(/\s+/).filter(token => token.length >= 2);

    return tokens;
  }
}
