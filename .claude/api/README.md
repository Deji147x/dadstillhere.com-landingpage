# NVIDIA API Client

Python client for NVIDIA's inference API, supporting multiple LLM models including MiniMax M3 (multimodal), Mistral, and Llama.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set API Key

Export your NVIDIA API key:

```bash
export NVIDIA_API_KEY="your-api-key-here"
```

Or in Windows PowerShell:

```powershell
$env:NVIDIA_API_KEY = "your-api-key-here"
```

## Usage

### Simple Chat

```python
from api import NVIDIAAPIClient

client = NVIDIAAPIClient()
response = client.chat("What is quantum computing?")
print(response)
```

### Streaming Response

```python
client = NVIDIAAPIClient()
response = client.chat("Write a story", stream=True)
```

### Multimodal (Image + Text)

```python
client = NVIDIAAPIClient()
response = client.chat(
    content=[
        {"type": "text", "text": "What's in this image?"},
        {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
    ]
)
```

### Local Image File (Auto-encoded)

```python
response = client.chat(
    content=[
        {"type": "text", "text": "Describe this"},
        {"type": "image", "path": "/path/to/image.png"}
    ]
)
```

### System Prompt

```python
response = client.chat(
    user_message="What's 2+2?",
    system_message="You are a helpful math tutor. Explain step by step."
)
```

### Different Model

```python
client = NVIDIAAPIClient(model="mistralai/mistral-large")
response = client.chat("Hello!")
```

### Multi-turn Conversation

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What's Python?"},
    {"role": "assistant", "content": "Python is a high-level..."},
    {"role": "user", "content": "Give an example."}
]

response = client.invoke(messages)
```

### Fine-tune Generation

```python
response = client.chat(
    "Write a story",
    max_tokens=2000,
    temperature=1.5,  # More creative
    top_p=0.9
)
```

## API Parameters

- `max_tokens` (int): Max output length, default 8192
- `temperature` (float): Creativity (0.0-2.0), default 1.0
- `top_p` (float): Nucleus sampling (0.0-1.0), default 0.95
- `stream` (bool): Stream response, default False

## Models

See `models.json` for available models. Currently supported:

- `minimaxai/minimax-m3` - Multimodal (text, image, video)
- `mistralai/mistral-large` - Large language model
- `meta/llama2-70b` - Llama 2 70B
- `nv-mistralai/mistral-nemo-12b-instruct` - Efficient model

## Error Handling

```python
try:
    response = client.chat("Hello")
except ValueError as e:
    print(f"Config error: {e}")
except RuntimeError as e:
    print(f"API error: {e}")
```

## Command Line Usage

```bash
python nvidia_api.py "Your prompt here"
```

## Examples

See `examples.py` for more detailed examples.
