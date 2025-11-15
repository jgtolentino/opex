#!/usr/bin/env python3
"""
JakeVoiceDev - Voice RAG + Coding Assistant
Based on OpenAI Agents SDK voice example
"""

import asyncio
import os
import sys
import numpy as np
import sounddevice as sd
from io import BytesIO
import json
from typing import Optional

# Load environment variables from .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed, continue with system env vars

from agents import Agent, Runner, function_tool, ModelSettings
from agents.voice import AudioInput, SingleAgentVoiceWorkflow, VoicePipeline
from agents.extensions.rag import WebSearchTool

# HTTP client for RAG queries
try:
    import requests
except ImportError:
    print("Warning: 'requests' library not installed. RAG features will not work.")
    print("Install with: pip install requests")
    requests = None

# =============================================================================
# RAG CLIENT HELPER
# =============================================================================

def query_opex_rag(
    question: str,
    assistant: str = 'opex',
    domain: Optional[str] = None,
    process: Optional[str] = None
) -> str:
    """
    Query the OpEx RAG system via Supabase edge function.

    Args:
        question: The query to search for
        assistant: 'opex' or 'ph-tax' assistant
        domain: Optional domain filter (hr, finance, ops, tax, knowledge_base)
        process: Optional process filter

    Returns:
        The assistant's answer from RAG knowledge base
    """
    if requests is None:
        return "Error: 'requests' library not installed. Run: pip install requests"

    supabase_url = os.getenv('SUPABASE_URL')
    if not supabase_url:
        return "Error: SUPABASE_URL environment variable not set. Check your .env file."

    # Build request payload
    payload = {
        'assistant': assistant,
        'question': question,
    }

    if domain:
        payload['domain'] = domain
    if process:
        payload['process'] = process

    try:
        # Call Supabase edge function
        response = requests.post(
            f"{supabase_url}/functions/v1/opex-rag-query",
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            answer = data.get('answer', 'No answer found')

            # Include citation count if available
            citations = data.get('citations', [])
            if citations:
                answer += f"\n\n(Based on {len(citations)} source(s))"

            return answer
        else:
            error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
            error_msg = error_data.get('error', f'HTTP {response.status_code}')
            return f"RAG query failed: {error_msg}"

    except requests.exceptions.Timeout:
        return "RAG query timed out. The knowledge base might be processing a complex query."
    except requests.exceptions.ConnectionError:
        return "Could not connect to RAG backend. Check SUPABASE_URL and network connection."
    except Exception as e:
        return f"RAG query error: {str(e)}"


# =============================================================================
# CUSTOM RAG TOOLS - Wired to Supabase backend
# =============================================================================

@function_tool
def query_scout_docs(query: str) -> str:
    """
    Search Scout / InsightPulse documentation and return a concise summary.

    Args:
        query: The search query for Scout/InsightPulse docs

    Returns:
        Relevant documentation snippets or summary
    """
    print(f"[RAG] Searching Scout docs for: {query}")
    return query_opex_rag(
        question=query,
        assistant='opex',
        domain='knowledge_base'
    )


@function_tool
def query_odoo_knowledge(query: str) -> str:
    """
    Search Odoo CE/OCA knowledge base for development help.

    Args:
        query: The search query for Odoo documentation or solutions

    Returns:
        Relevant Odoo development information
    """
    print(f"[RAG] Searching Odoo knowledge for: {query}")
    return query_opex_rag(
        question=query,
        assistant='opex',
        domain='knowledge_base'
    )


@function_tool
def query_supabase_docs(query: str) -> str:
    """
    Search Supabase documentation and best practices.

    Args:
        query: The search query for Supabase docs

    Returns:
        Relevant Supabase documentation or examples
    """
    print(f"[RAG] Searching Supabase docs for: {query}")
    return query_opex_rag(
        question=query,
        assistant='opex',
        domain='knowledge_base'
    )


@function_tool
def create_task_note(task: str, priority: str = "medium") -> str:
    """
    Create a task or note for later (personal assistant function).

    Args:
        task: Description of the task or note
        priority: Priority level (low, medium, high)

    Returns:
        Confirmation of task creation
    """
    print(f"[PA] Creating task [{priority}]: {task}")

    # Save to local tasks file
    tasks_file = os.path.expanduser("~/.jake_voice_tasks.json")

    try:
        # Load existing tasks
        if os.path.exists(tasks_file):
            with open(tasks_file, 'r') as f:
                tasks = json.load(f)
        else:
            tasks = []

        # Add new task with timestamp
        from datetime import datetime
        new_task = {
            'task': task,
            'priority': priority,
            'created_at': datetime.now().isoformat(),
            'completed': False
        }
        tasks.append(new_task)

        # Save updated tasks
        with open(tasks_file, 'w') as f:
            json.dump(tasks, f, indent=2)

        return f"Task saved: '{task}' with priority {priority}. Total tasks: {len(tasks)}. View at: {tasks_file}"

    except Exception as e:
        return f"Failed to save task: {str(e)}. Task was: '{task}' (priority: {priority})"


# =============================================================================
# VOICE ASSISTANT AGENT
# =============================================================================

VOICE_ASSISTANT_INSTRUCTIONS = """
You are JakeVoiceDev, Jake's voice-first RAG + coding assistant.

Your role:
- Act as a personal assistant: help with planning, task management, clarifying questions, and summaries
- Act as a coding/devops expert for: Odoo CE/OCA, Supabase, Scout, InsightPulse, CES, and general software development
- When helpful, call available tools (web search, RAG queries) instead of guessing
- Keep answers concise, clear, and easy to listen to (this is voice interaction)
- For complex topics, offer to break them down into steps
- If you're uncertain, say so and offer to search or look it up

Available knowledge bases (via tools):
- Scout / InsightPulse documentation
- Odoo CE/OCA development knowledge
- Supabase documentation
- General web search
- Task creation for personal assistant functions

Voice interaction tips:
- Be conversational but efficient
- Avoid overly long responses unless asked for detail
- When code is involved, offer to explain key points rather than reading all code aloud
- Confirm understanding before complex operations
"""

voice_agent = Agent(
    name="JakeVoiceDev",
    instructions=VOICE_ASSISTANT_INSTRUCTIONS,
    tools=[
        WebSearchTool(search_context_size="low"),
        query_scout_docs,
        query_odoo_knowledge,
        query_supabase_docs,
        create_task_note,
    ],
    model="gpt-4o-mini",
    model_settings=ModelSettings(tool_choice="auto"),
)


# =============================================================================
# VOICE PIPELINE
# =============================================================================

async def voice_assistant():
    """
    Main voice interaction loop.
    - Press Enter to start recording
    - Press Enter again to stop
    - Agent responds with voice
    """
    # Get default input device sample rate
    samplerate = int(sd.query_devices(kind='input')['default_samplerate'])

    print("\n" + "="*60)
    print("JakeVoiceDev - Voice RAG + Coding Assistant")
    print("="*60)
    print(f"Sample rate: {samplerate} Hz")
    print("\nInstructions:")
    print("  1. Press Enter to start recording your query")
    print("  2. Speak your question")
    print("  3. Press Enter again to stop recording")
    print("  4. Agent will process and respond with voice")
    print("  5. Type 'quit' or Ctrl+C to exit")
    print("="*60 + "\n")

    while True:
        try:
            # Wait for user to start
            user_input = input("Press Enter to speak your query (or type 'quit'): ")
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break

            # Create new pipeline for this interaction
            pipeline = VoicePipeline(
                workflow=SingleAgentVoiceWorkflow(voice_agent)
            )

            # Record audio
            print("\n🎤 Recording... (press Enter to stop)")
            audio_data = []

            def audio_callback(indata, frames, time, status):
                if status:
                    print(f"Status: {status}")
                audio_data.append(indata.copy())

            # Start recording stream
            stream = sd.InputStream(
                samplerate=samplerate,
                channels=1,
                dtype=np.int16,
                callback=audio_callback
            )

            with stream:
                input()  # Wait for Enter to stop recording

            print("⏸️  Recording stopped. Processing...")

            # Convert recorded audio to bytes
            audio_array = np.concatenate(audio_data, axis=0)
            audio_bytes = BytesIO()
            # Write as WAV format
            import wave
            with wave.open(audio_bytes, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)  # 2 bytes for int16
                wav_file.setframerate(samplerate)
                wav_file.writeframes(audio_array.tobytes())

            audio_bytes.seek(0)

            # Process through voice pipeline
            print("🤔 Thinking...")

            audio_input = AudioInput(
                audio=audio_bytes.read(),
                format="wav"
            )

            # Stream response
            print("🔊 Speaking response...\n")
            audio_chunks = []

            async for event in pipeline.stream(audio_input):
                if hasattr(event, 'audio') and event.audio:
                    audio_chunks.append(event.audio)
                if hasattr(event, 'text') and event.text:
                    print(f"[Agent]: {event.text}")

            # Play back audio response
            if audio_chunks:
                # Combine all audio chunks
                combined_audio = b''.join(audio_chunks)

                # Parse and play audio (assuming it's WAV format from OpenAI TTS)
                audio_io = BytesIO(combined_audio)
                with wave.open(audio_io, 'rb') as wav_file:
                    audio_rate = wav_file.getframerate()
                    audio_array = np.frombuffer(
                        wav_file.readframes(wav_file.getnframes()),
                        dtype=np.int16
                    )

                    # Play audio
                    sd.play(audio_array, audio_rate)
                    sd.wait()

            print("\n✅ Response complete.\n")

        except KeyboardInterrupt:
            print("\n\nInterrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Continuing to next query...\n")


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Entry point for voice agent."""
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        print("Please set it with: export OPENAI_API_KEY='sk-...'")
        sys.exit(1)

    # Run async voice assistant
    try:
        asyncio.run(voice_assistant())
    except KeyboardInterrupt:
        print("\nGoodbye!")


if __name__ == "__main__":
    main()
