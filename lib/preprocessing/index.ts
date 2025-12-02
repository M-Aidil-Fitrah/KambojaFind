import { TextCleaner } from './text-cleaner';
import { Tokenizer } from './tokenizer';
import { StopwordRemover } from './stopword-remover';
import { IndonesianStemmer } from './stemmer';

export function preprocessQuery(query: string): string[] {
  const cleaner = new TextCleaner();
  const tokenizer = new Tokenizer();
  const stopwordRemover = new StopwordRemover();
  const stemmer = new IndonesianStemmer();

  // Clean
  const cleaned = cleaner.cleanText(query);

  // Tokenize
  const tokens = tokenizer.tokenize(cleaned);

  // Remove stopwords
  const filtered = stopwordRemover.removeStopwords(tokens);

  // Stem
  const stemmed = stemmer.stemTokens(filtered);

  return stemmed;
}
