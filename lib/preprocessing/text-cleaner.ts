// Simple text cleaner for query preprocessing
export class TextCleaner {
  private urlPattern: RegExp;
  private emailPattern: RegExp;
  private htmlPattern: RegExp;
  private numberPattern: RegExp;

  constructor() {
    this.urlPattern = /https?:\/\/\S+|www\.\S+/g;
    this.emailPattern = /\S+@\S+/g;
    this.htmlPattern = /<.*?>/g;
    this.numberPattern = /\d+/g;
  }

  cleanText(text: string): string {
    if (!text) return "";

    // Lowercase
    let cleaned = text.toLowerCase();

    // Remove URL
    cleaned = cleaned.replace(this.urlPattern, '');

    // Remove email
    cleaned = cleaned.replace(this.emailPattern, '');

    // Remove HTML tags
    cleaned = cleaned.replace(this.htmlPattern, '');

    // Remove numbers
    cleaned = cleaned.replace(this.numberPattern, '');

    // Remove non-alphabet (except spaces)
    cleaned = cleaned.replace(/[^a-z\s]/g, ' ');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }
}
