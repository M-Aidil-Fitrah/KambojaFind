import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: docId } = await params;
    
    // Read the filtered corpus file
    const filePath = path.join(process.cwd(), 'preprocessing', 'dataset', 'filtered_corpus.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const corpus = JSON.parse(fileContent);

    // Find article by ID
    const article = corpus.find((item: any) => item.id.toString() === docId || item.id === parseInt(docId));

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
