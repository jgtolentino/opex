# JakeVoiceDev - Voice RAG + Coding Assistant

A voice-first AI assistant powered by the OpenAI Agents SDK, combining:
- **Voice I/O** (speak naturally, get spoken responses)
- **RAG** (query your Scout/InsightPulse/Odoo/Supabase docs)
- **Coding help** (Odoo CE/OCA, Supabase, general dev)
- **Personal assistant** (task creation, planning, summaries)

Based on the [OpenAI Agents SDK voice agents cookbook](https://github.com/openai/openai-cookbook/tree/main/examples/agents_sdk).

## Features

### Voice Interaction
- **STT**: OpenAI `gpt-4o-transcribe` (no local Whisper needed)
- **TTS**: OpenAI `gpt-4o-mini-tts` (no macOS `say` needed)
- **Pipeline**: Single integrated voice loop via Agents SDK

### Tools Available
1. **Web Search** - Real-time web search for current info
2. **Scout/InsightPulse Docs** - Query your Scout documentation (RAG stub ready)
3. **Odoo Knowledge** - Search Odoo CE/OCA dev knowledge (RAG stub ready)
4. **Supabase Docs** - Query Supabase best practices (RAG stub ready)
5. **Task Creation** - Personal assistant task/note management

### Agent Behavior
- Conversational but concise (optimized for listening)
- Calls tools automatically when helpful
- Can handle coding questions, planning, clarifications
- Multi-turn context awareness

## Setup

### 1. Prerequisites

- Python 3.9+
- OpenAI API key
- Microphone and speakers/headphones

### 2. Install Dependencies

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 3. Set OpenAI API Key

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Or use a `.env` file:

```bash
echo "OPENAI_API_KEY=sk-your-key-here" > .env
```

Then modify `voice_agent.py` to load it:

```python
from dotenv import load_dotenv
load_dotenv()
```

## Usage

### Basic Run

```bash
python voice_agent.py
```

### Interaction Flow

1. **Start**: Script starts and waits for you
2. **Press Enter**: Begin recording your query
3. **Speak**: Ask your question naturally
4. **Press Enter**: Stop recording
5. **Listen**: Agent processes and speaks the response
6. **Repeat**: Continue with follow-up questions

### Example Queries

**Personal Assistant:**
- "Create a high priority task to review the Scout analytics dashboard"
- "Summarize what I should focus on today for the CES project"

**Coding Help:**
- "How do I set up row-level security in Supabase for a multi-tenant app?"
- "What's the best way to extend an Odoo CE purchase order model?"
- "Search the web for the latest Supabase realtime features"

**RAG Queries:**
- "What does our Scout documentation say about data visualization?"
- "Look up how InsightPulse handles report generation"

**General:**
- "What are the OWASP top 10 for 2024?"
- "Explain the difference between Postgres RLS and application-level auth"

## Customization

### Wire Up RAG Backends

The script has placeholder functions in `voice_agent.py`:
- `query_scout_docs()`
- `query_odoo_knowledge()`
- `query_supabase_docs()`

Replace the placeholders with actual calls to your Supabase vector search:

```python
@function_tool
def query_scout_docs(query: str) -> str:
    """Search Scout / InsightPulse documentation."""
    from supabase import create_client

    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )

    # Example: call your edge function
    result = supabase.rpc('search_scout_docs', {'query': query}).execute()

    # Format and return top results
    docs = result.data[:3]  # top 3 chunks
    return "\n".join([doc['content'] for doc in docs])
```

### Add More Tools

Add any `@function_tool` decorated function to the `voice_agent` tools list:

```python
@function_tool
def deploy_to_staging(service: str) -> str:
    """Deploy a service to staging environment."""
    # Your deployment logic
    return f"Deployed {service} to staging"

voice_agent = Agent(
    # ...
    tools=[
        WebSearchTool(search_context_size="low"),
        query_scout_docs,
        deploy_to_staging,  # Add here
        # ...
    ],
)
```

### Adjust Agent Personality

Edit `VOICE_ASSISTANT_INSTRUCTIONS` in `voice_agent.py` to change tone, verbosity, or domain focus.

### Change Model

The default is `gpt-4o-mini` for cost efficiency. For better reasoning, switch to `gpt-4o`:

```python
voice_agent = Agent(
    # ...
    model="gpt-4o",  # More capable, higher cost
)
```

## Architecture

```
┌─────────────┐
│  Your Mic   │
└──────┬──────┘
       │ Audio
       ▼
┌─────────────────────┐
│  VoicePipeline      │
│  - STT (gpt-4o)     │
│  - Workflow Router  │
└──────┬──────────────┘
       │ Text
       ▼
┌─────────────────────┐
│  JakeVoiceDev       │
│  Agent              │
│  - Instructions     │
│  - Tools (RAG, etc) │
│  - Model (4o-mini)  │
└──────┬──────────────┘
       │ Response Text
       ▼
┌─────────────────────┐
│  VoicePipeline      │
│  - TTS (4o-mini)    │
└──────┬──────────────┘
       │ Audio
       ▼
┌─────────────┐
│ Your Speaker│
└─────────────┘
```

## Next Steps

### Immediate
1. **Test the basics**: Run `python voice_agent.py` and try a few queries
2. **Wire up RAG**: Connect `query_scout_docs` to your Supabase vector search
3. **Add task backend**: Connect `create_task_note` to your task management system

### Advanced
1. **Multi-agent routing**: Add a triage agent for complex workflows (like NotebookLM deep research)
2. **Memory/context**: Persist conversation history across sessions
3. **Streaming improvements**: Add visual feedback (waveform, transcription display)
4. **Tool expansions**: Add code execution, file operations, etc.

### Integration with Claude Code CLI

This voice agent complements your existing Claude Code CLI workflow:
- **Voice agent**: Quick queries, planning, documentation lookup
- **Claude Code**: Deep implementation, file editing, git operations

Example workflow:
1. Ask voice agent: "What's the best approach to add RLS to my Supabase tables?"
2. Listen to summary and suggestions
3. Switch to Claude Code CLI: "Implement RLS based on the approach we just discussed"

## Troubleshooting

### Audio Issues

**No microphone detected:**
```bash
python -m sounddevice
```
Should list your audio devices. Set default if needed.

**Permission denied (macOS):**
System Preferences → Security & Privacy → Microphone → Allow Terminal/iTerm

### API Issues

**OpenAI API errors:**
- Check `OPENAI_API_KEY` is set correctly
- Verify API key has sufficient credits
- Check rate limits if getting 429 errors

### Installation Issues

**`openai-agents` not found:**
```bash
pip install --upgrade openai openai-agents
```

**Audio library errors (Linux):**
```bash
sudo apt-get install portaudio19-dev python3-pyaudio
pip install --upgrade sounddevice
```

## Resources

- [OpenAI Agents SDK Docs](https://github.com/openai/openai-agents)
- [Voice Agents Cookbook](https://github.com/openai/openai-cookbook/tree/main/examples/agents_sdk)
- [Supabase Vector Search](https://supabase.com/docs/guides/ai)
- [Claude Code CLI](https://github.com/anthropics/claude-code)

## License

MIT (or whatever your opex project uses)

---

**Built with:**
- OpenAI Agents SDK
- Supabase (RAG backend)
- Claude Code (for heavy lifting)
