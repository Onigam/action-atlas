# ADR-002: Use Vercel AI SDK v4 over Langchain for AI Operations

**Status**: Accepted

**Date**: 2026-01-07

**Deciders**: Architecture Team, AI Development Team

---

## Context

Action Atlas needs to generate embeddings for activity descriptions using OpenAI's API. We need a library/framework to:
- Generate embeddings (text-embedding-3-small model)
- Handle API rate limiting and retries
- Provide type safety for TypeScript
- Be maintainable by AI agents

### Current State (2026)

**Langchain Status:**
- Bloated with 20+ abstraction layers for simple tasks
- Frequent breaking changes
- Heavy dependencies (~50MB+ node_modules)
- Poor TypeScript type inference
- Complex abstractions difficult for AI agents to understand

**Vercel AI SDK Status:**
- 2.8M weekly NPM downloads (most popular TypeScript AI framework)
- Lightweight (~20KB)
- Native TypeScript support with excellent types
- Streaming-first primitives
- Built-in rate limiting

---

## Decision

We will use **Vercel AI SDK v4** for all AI operations, specifically:
- Embedding generation (single and batch)
- Future LLM operations (if needed)

We will **NOT** use Langchain or LlamaIndex.

### Implementation

```typescript
// packages/ai/src/embedding-service.ts
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

const embeddingModel = openai.embedding('text-embedding-3-small');

export class EmbeddingService {
  // Single embedding generation
  async generateSingle(text: string): Promise<EmbeddingResult> {
    const { embedding, usage } = await embed({
      model: embeddingModel,
      value: text,
    });

    return {
      embedding: embedding as Embedding,
      model: 'text-embedding-3-small',
      dimensions: 1536,
      tokenUsage: usage.tokens,
      generatedAt: new Date(),
    };
  }

  // Batch generation with automatic rate limiting
  async generateBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const { embeddings, usage } = await embedMany({
      model: embeddingModel,
      values: texts,
    });

    return embeddings.map((emb, i) => ({
      embedding: emb as Embedding,
      model: 'text-embedding-3-small',
      dimensions: 1536,
      tokenUsage: Math.floor(usage.tokens / texts.length),
      generatedAt: new Date(),
    }));
  }
}
```

---

## Rationale

### Why Vercel AI SDK Wins

1. **Simplicity & Clarity**
   ```typescript
   // Vercel AI SDK: 3 lines
   const { embedding } = await embed({
     model: openai.embedding('text-embedding-3-small'),
     value: text,
   });

   // Langchain: 10+ lines with complex abstractions
   const embeddings = new OpenAIEmbeddings({
     openAIApiKey: process.env.OPENAI_API_KEY,
     modelName: 'text-embedding-3-small',
   });
   const vectorStore = new MemoryVectorStore(embeddings);
   const result = await vectorStore.addDocuments([{ pageContent: text }]);
   // ... more complexity
   ```

2. **Type Safety**
   - Vercel AI SDK: Excellent TypeScript inference
   ```typescript
   const { embedding, usage } = await embed(/* ... */);
   // embedding: number[] (inferred)
   // usage: { tokens: number } (inferred)
   ```
   - Langchain: Poor type inference, requires manual typing

3. **Bundle Size**
   ```
   Vercel AI SDK: ~20KB
   Langchain: ~50MB+ (250x larger!)
   ```

4. **Built-in Rate Limiting**
   ```typescript
   // Vercel AI SDK handles OpenAI rate limits automatically
   const { embeddings } = await embedMany({
     model: embeddingModel,
     values: thousandsOfTexts, // Automatically batched and rate-limited
   });
   ```

5. **AI Agent Friendliness**
   - **Simple patterns**: AI agents can understand and modify easily
   - **Predictable behavior**: No hidden abstractions
   - **Self-documenting**: Types tell the full story

6. **Active Maintenance**
   - Vercel-backed (well-funded, stable)
   - Weekly releases with bug fixes
   - Responsive to community issues
   - Excellent documentation

7. **Framework Agnostic**
   - Works with Next.js, Hono, Express, any JS runtime
   - Can use in serverless functions, edge runtime, Node.js

8. **Future-Proof**
   - Streaming primitives for future UI features
   - Chat completion support (if we add AI chat)
   - Tool calling support (if we add AI agents)

### Why NOT Langchain (2026)

**Problems:**

1. **Over-Abstraction**
   ```typescript
   // Langchain requires understanding:
   // - VectorStore abstraction
   // - Document loader abstraction
   // - Embedding abstraction
   // - Retriever abstraction
   // - Chain abstraction
   //
   // Just to generate an embedding!
   ```

2. **Breaking Changes**
   - v0.1 → v0.2 broke many APIs
   - Frequent deprecations without clear migration paths
   - Difficult to keep up with changes

3. **Poor Documentation**
   - Examples often outdated
   - TypeScript examples lacking
   - Inconsistent patterns across codebase

4. **Heavy Dependencies**
   ```bash
   # Langchain pulls in:
   langchain: 50MB+
   @langchain/core: 15MB
   @langchain/community: 30MB
   @langchain/openai: 10MB
   # Total: 105MB+ for simple embedding generation!
   ```

5. **AI Agent Confusion**
   - Complex abstractions difficult for AI to reason about
   - Hidden state management
   - Implicit behavior not obvious from types

### Why NOT LlamaIndex

**Pros:**
- Better than Langchain for RAG pipelines
- More focused than Langchain
- Good Python support

**Cons:**
- Still overkill for Action Atlas (we don't need RAG)
- Python-first (TypeScript support is secondary)
- We only need embeddings, not full document processing
- Additional complexity not justified

**Decision:** Not needed. Our use case is simple:
1. Take activity text
2. Generate embedding
3. Store in MongoDB

### Why NOT Direct OpenAI SDK

**Pros:**
- Most lightweight option
- Direct control
- Minimal abstraction

**Cons:**
- No built-in rate limiting (would need to implement)
- No automatic batching (would need to implement)
- No retry logic (would need to implement)
- More boilerplate code

**Decision:** Vercel AI SDK provides just enough abstraction without going overboard.

---

## Consequences

### Positive

✅ **Faster Development**: Less code to write and maintain
✅ **Better Type Safety**: Excellent TypeScript inference
✅ **Smaller Bundle**: 250x smaller than Langchain
✅ **AI Agent Friendly**: Simple, predictable patterns
✅ **Reliable**: Built-in rate limiting and retries
✅ **Future-Proof**: Easy to add streaming or chat features later

### Negative

⚠️ **Less "Enterprise"**: Some teams expect Langchain for AI projects
⚠️ **Fewer Features**: No pre-built chains or agents (we don't need them)
⚠️ **Vercel Dependency**: Some risk if Vercel abandons the project (low risk given Vercel's investment)

### Mitigation

1. **Document Decision**: This ADR explains why we chose Vercel AI SDK
2. **Monitor Ecosystem**: Track Vercel AI SDK development and community health
3. **Abstraction Layer**: Wrap Vercel AI SDK in our own service classes for easy migration if needed
   ```typescript
   // packages/ai/src/embedding-service.ts
   // If we need to migrate, we only change this file
   export class EmbeddingService {
     async generateSingle(text: string): Promise<EmbeddingResult> {
       // Current: Vercel AI SDK
       // Future: Could swap to direct OpenAI SDK or other library
       const { embedding } = await embed({
         model: openai.embedding('text-embedding-3-small'),
         value: text,
       });
       return { embedding, /* ... */ };
     }
   }
   ```

---

## Alternatives Considered

### Alternative 1: Langchain

**Evaluation:**
```typescript
// Langchain complexity example
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'text-embedding-3-small',
});

const vectorStore = await MemoryVectorStore.fromDocuments(
  activities.map(a => ({
    pageContent: a.description,
    metadata: { id: a.id },
  })),
  embeddings
);

// Just to get embeddings!
```

**Decision:** ❌ Rejected due to complexity and maintenance burden

### Alternative 2: LlamaIndex

**Evaluation:**
```python
# LlamaIndex is Python-first
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader('data').load_data()
index = VectorStoreIndex.from_documents(documents)
```

**Decision:** ❌ Rejected - TypeScript is our primary language, and we don't need RAG

### Alternative 3: Direct OpenAI SDK

**Evaluation:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Need to implement rate limiting
let retries = 3;
while (retries > 0) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    if (error.status === 429) {
      retries--;
      await sleep(1000 * (4 - retries)); // Exponential backoff
    } else {
      throw error;
    }
  }
}
```

**Decision:** ⚠️ Valid but more boilerplate. Vercel AI SDK provides this out-of-the-box.

### Alternative 4: Vercel AI SDK (Chosen)

**Evaluation:**
```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// Single embedding
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: text,
});

// Batch with automatic rate limiting
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: texts,
});
```

**Decision:** ✅ Accepted - Perfect balance of simplicity and functionality

---

## Performance Comparison

| Framework | Bundle Size | Embedding Generation | Type Safety | AI Agent Friendly |
|-----------|------------|---------------------|-------------|-------------------|
| **Vercel AI SDK** | ~20KB | ✅ Fast | ✅ Excellent | ✅ Yes |
| Langchain | ~50MB+ | ⚠️ Overhead | ⚠️ Fair | ❌ No |
| LlamaIndex | N/A (Python) | ⚠️ Good | N/A | ❌ No |
| Direct OpenAI SDK | ~5KB | ✅ Fast | ✅ Good | ⚠️ Verbose |

---

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Top TypeScript AI Frameworks 2026](https://blog.agentailor.com/posts/top-typescript-ai-agent-frameworks-2026)
- [LangChain Alternatives Comparison](https://www.vellum.ai/blog/top-langchain-alternatives)
- [Vercel AI SDK GitHub](https://github.com/vercel/ai)

---

## Related Decisions

- [ADR-001: MongoDB Atlas Vector Search](./001-mongodb-atlas-vector-search.md)
- [ADR-004: Next.js 15 App Router](./004-nextjs-15-app-router.md)

---

## Review Notes

**Acceptance Criteria Met:**
- ✅ Simplifies AI integration code
- ✅ Reduces bundle size
- ✅ Improves maintainability
- ✅ Better for AI agents
- ✅ Active community and maintenance

**Approved By:**
- Technical Lead: ✅
- AI/ML Lead: ✅
- Frontend Lead: ✅

**Next Review**: After 6 months of usage, or if Vercel AI SDK shows signs of abandonment
