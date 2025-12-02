// Simple Indonesian stemmer (basic rules-based)
// For production, you might want to use a more sophisticated approach
export class IndonesianStemmer {
  private prefixes = ['me', 'di', 'ke', 'pe', 'ter', 'ber', 'se'];
  private suffixes = ['kan', 'an', 'i', 'nya'];

  stem(word: string): string {
    let stemmed = word;

    // Remove suffixes
    for (const suffix of this.suffixes) {
      if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
        stemmed = stemmed.slice(0, -suffix.length);
        break;
      }
    }

    // Remove prefixes
    for (const prefix of this.prefixes) {
      if (stemmed.startsWith(prefix) && stemmed.length > prefix.length + 2) {
        stemmed = stemmed.slice(prefix.length);
        break;
      }
    }

    return stemmed;
  }

  stemTokens(tokens: string[]): string[] {
    return tokens.map(token => this.stem(token));
  }
}
