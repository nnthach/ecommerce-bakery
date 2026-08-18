import { createDocumentEmbedding } from "@/lib/cohere";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

function chunkText(
  text: string,
  chunkSize = CHUNK_SIZE,
  overlap = CHUNK_OVERLAP,
): string[] {
  const chunks: string[] = [];

  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    if (end < text.length) {
      const paragraphBreak = text.lastIndexOf("\n", end);

      if (paragraphBreak > start + chunkSize * 0.6) {
        end = paragraphBreak;
      }
    }

    const chunk = text.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    start = end - overlap;

    if (start < 0) {
      start = 0;
    }
  }

  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "File is required",
        },
        { status: 400 },
      );
    }

    // các type file
    const allowedTypes = ["text/plain", "text/markdown", "text/x-markdown"];

    const fileName = file.name.toLowerCase();

    const isSupported =
      allowedTypes.includes(file.type) ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".markdown");

    if (!isSupported) {
      return NextResponse.json(
        {
          success: false,
          error: "Only .txt and .md files are supported",
        },
        { status: 400 },
      );
    }

    // check content
    const content = await file.text();

    if (!content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "File is empty",
        },
        { status: 400 },
      );
    }

    // 1. CHUNK []
    const chunks = chunkText(content);

    console.log("Total chunks:", chunks.length);

    // 2. CREATE EMBEDDINGS
    const chunkRows = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      console.log(`Embedding chunk ${i + 1}/${chunks.length}`);

      const embedding = await createDocumentEmbedding(chunk);

      if (!embedding) {
        throw new Error(`Failed to create embedding for chunk ${i}`);
      }

      chunkRows.push({
        chunk_index: i,
        content: chunk,
        embedding,
        metadata: {
          source: file.name,
          chunk_index: i,
        },
      });
    }

    // 3. CREATE DOCUMENT
    const { data: document, error: documentError } = await supabaseAdmin
      .from("knowledge_documents")
      .insert({
        title: file.name.replace(/\.(txt|md|markdown)$/i, ""),
        content,
        source: file.name,
        version: 1,
        is_active: true,
      })
      .select()
      .single();

    if (documentError) {
      throw documentError;
    }

    // 4. ATTACH DOCUMENT ID
    const finalChunkRows = chunkRows.map((chunk) => ({
      ...chunk,
      document_id: document.id,
    }));

    // 5. INSERT CHUNKS
    const { data: insertedChunks, error: chunksError } = await supabaseAdmin
      .from("knowledge_chunks")
      .insert(finalChunkRows)
      .select();

    if (chunksError) {
      // cleanup document if chunk insertion fails
      await supabaseAdmin
        .from("knowledge_documents")
        .delete()
        .eq("id", document.id);

      throw chunksError;
    }

    // SUCCESS
    return NextResponse.json(
      {
        success: true,
        data: {
          document: {
            id: document.id,
            title: document.title,
            source: document.source,
          },
          chunks: {
            total: insertedChunks?.length ?? 0,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Knowledge ingestion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process knowledge document",
      },
      { status: 500 },
    );
  }
}
