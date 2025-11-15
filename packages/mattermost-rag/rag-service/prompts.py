"""RAG prompt templates for Claude."""

SYSTEM_PROMPT = """You are an expert technical assistant for OpEx operations.

Your role:
- Answer questions based ONLY on the provided context documents
- Cite sources using [source: doc_title] format
- If context doesn't contain the answer, say "I don't have information about this"
- Be concise and actionable
- Use technical accuracy over brevity

Context quality guidelines:
- High confidence (>0.9): Use information directly
- Medium confidence (0.7-0.9): Acknowledge uncertainty
- Low confidence (<0.7): Suggest asking for human help

Always include:
1. Direct answer
2. Source citations
3. Confidence assessment
4. Suggested next steps if applicable
"""


def build_rag_prompt(question: str, context_docs: list[dict]) -> str:
    """Build RAG prompt with context documents."""

    if not context_docs:
        return f"""Question: {question}

Context: No relevant documents found.

Please respond that you don't have information to answer this question and suggest using /ask-human for escalation."""

    # Format context documents
    context_blocks = []
    for i, doc in enumerate(context_docs, 1):
        title = doc.get("title", "Untitled")
        content = doc.get("snippet", doc.get("content", ""))
        url = doc.get("url", "")
        score = doc.get("score", 0.0)

        context_blocks.append(f"""[Document {i}] {title} (confidence: {score:.2f})
Source: {url}
Content:
{content}
---""")

    context_text = "\n\n".join(context_blocks)

    return f"""Question: {question}

Context Documents:
{context_text}

Instructions:
1. Answer the question using ONLY the context above
2. Cite sources using [source: Document N] format
3. If context is insufficient, say so clearly
4. Assess your confidence in the answer (high/medium/low)
5. Suggest next steps if helpful

Your response:"""


RAG_EXAMPLES = [
    {
        "question": "How do I rotate database credentials in Supabase?",
        "context": [
            {
                "title": "Supabase Security Best Practices",
                "snippet": "To rotate database credentials: 1. Generate new service_role_key in Supabase Dashboard 2. Update DO_SECRETS via doctl 3. Restart app with doctl apps create-deployment",
                "url": "https://docs.supabase.com/security",
                "score": 0.95
            }
        ],
        "answer": """To rotate Supabase database credentials:

1. **Generate new key**: Go to Supabase Dashboard → Settings → API → Generate new service_role_key
2. **Update secrets**: `doctl apps update <app-id> --env SUPABASE_SERVICE_ROLE_KEY=<new-key>`
3. **Redeploy**: `doctl apps create-deployment <app-id> --force-rebuild`

[source: Document 1 - Supabase Security Best Practices]

**Confidence**: High (0.95)

**Next steps**:
- Test connectivity after rotation
- Update any local `.env` files
- Verify RLS policies still work

Need help? Use `/ask-human` to escalate to DevOps."""
    },
    {
        "question": "What's the OCR accuracy threshold for auto-approval?",
        "context": [],
        "answer": """I don't have information about OCR accuracy thresholds in the available documentation.

**Suggestion**: Use `/ask-human` to get this from the DevOps or Finance team.

**Alternative**: Check the `packages/ocr-service/README.md` in the repository."""
    }
]


def format_citations(docs: list[dict]) -> str:
    """Format document citations for response footer."""
    if not docs:
        return "_No sources found._"

    citations = []
    for i, doc in enumerate(docs[:5], 1):  # Top 5 sources
        title = doc.get("title", "Untitled")
        url = doc.get("url", "#")
        score = doc.get("score", 0.0)
        citations.append(f"{i}. [{title}]({url}) (confidence: {score:.2f})")

    return "\n".join(citations)


def assess_confidence(docs: list[dict]) -> tuple[float, str]:
    """Assess overall confidence based on retrieval scores."""
    if not docs:
        return 0.0, "low"

    top_score = max(doc.get("score", 0.0) for doc in docs)
    avg_score = sum(doc.get("score", 0.0) for doc in docs) / len(docs)

    # Weighted average: top score 70%, average 30%
    confidence = 0.7 * top_score + 0.3 * avg_score

    if confidence >= 0.85:
        return confidence, "high"
    elif confidence >= 0.65:
        return confidence, "medium"
    else:
        return confidence, "low"
