"""
NVIDIA API integration for Claude and other LLM models via NVIDIA's inference endpoint.
Supports MiniMax-M3 and other multimodal models.
"""

import os
import sys
import json
import base64
from typing import Optional, List, Dict, Any
import requests


class NVIDIAAPIClient:
    """Client for NVIDIA inference API endpoints."""

    def __init__(self, api_key: Optional[str] = None, model: str = "minimaxai/minimax-m3"):
        """
        Initialize NVIDIA API client.

        Args:
            api_key: API key (defaults to NVIDIA_API_KEY env var)
            model: Model ID to use (default: minimaxai/minimax-m3)
        """
        self.api_key = api_key or os.getenv("NVIDIA_API_KEY")
        if not self.api_key:
            raise ValueError("NVIDIA_API_KEY environment variable not set")

        self.invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        self.model = model
        self.session = requests.Session()
        self._setup_session()

    def _setup_session(self):
        """Configure session with default headers."""
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}"
        })

    def _prepare_headers(self, stream: bool = False) -> Dict[str, str]:
        """Prepare request headers."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "text/event-stream" if stream else "application/json"
        }

    def _encode_image(self, image_path: str) -> str:
        """Encode local image to base64 data URI."""
        with open(image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()

        ext = image_path.split(".")[-1].lower()
        mime_type = f"image/{ext}" if ext != "jpg" else "image/jpeg"
        return f"data:{mime_type};base64,{b64}"

    def _encode_video(self, video_path: str) -> str:
        """Encode local video to base64 data URI."""
        with open(video_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        return f"data:video/mp4;base64,{b64}"

    def _build_content(self, content: Any) -> Any:
        """
        Build message content, handling text, URLs, and local files.

        Args:
            content: String, list of dicts, or mixed content

        Returns:
            Formatted content for API payload
        """
        if isinstance(content, str):
            return content

        if isinstance(content, list):
            result = []
            for item in content:
                if isinstance(item, str):
                    result.append({"type": "text", "text": item})
                elif isinstance(item, dict):
                    if item.get("type") == "image" and "path" in item:
                        # Local file: convert to base64
                        url = self._encode_image(item["path"])
                        result.append({"type": "image_url", "image_url": {"url": url}})
                    elif item.get("type") == "video" and "path" in item:
                        # Local video: convert to base64
                        url = self._encode_video(item["path"])
                        result.append({"type": "video_url", "video_url": {"url": url}})
                    else:
                        # Assume it's already properly formatted
                        result.append(item)
            return result

        return content

    def invoke(
        self,
        messages: List[Dict[str, Any]],
        max_tokens: int = 8192,
        temperature: float = 1.0,
        top_p: float = 0.95,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Call the NVIDIA inference API.

        Args:
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature (0.0-2.0)
            top_p: Nucleus sampling parameter
            stream: Whether to stream response
            **kwargs: Additional payload parameters

        Returns:
            API response (dict if not streaming, iterator if streaming)
        """
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "top_p": top_p,
            "stream": stream,
            **kwargs
        }

        headers = self._prepare_headers(stream)

        try:
            response = self.session.post(
                self.invoke_url,
                headers=headers,
                json=payload,
                stream=stream,
                timeout=120
            )
            response.raise_for_status()

            if stream:
                return self._handle_stream(response)
            else:
                return response.json()

        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"API request failed: {e}")

    def _handle_stream(self, response):
        """Handle streaming response."""
        for line in response.iter_lines():
            if line:
                data = line.decode("utf-8")
                if data.startswith("data: "):
                    try:
                        yield json.loads(data[6:])
                    except json.JSONDecodeError:
                        yield {"raw": data}
                else:
                    yield {"raw": data}

    def chat(
        self,
        user_message: str,
        system_message: Optional[str] = None,
        stream: bool = False,
        **kwargs
    ) -> str:
        """
        Simple chat interface.

        Args:
            user_message: User's message
            system_message: Optional system prompt
            stream: Whether to stream response
            **kwargs: Additional API parameters

        Returns:
            Response text
        """
        messages = []

        if system_message:
            messages.append({"role": "system", "content": system_message})

        messages.append({"role": "user", "content": user_message})

        response = self.invoke(messages, stream=stream, **kwargs)

        if stream:
            result = ""
            for chunk in response:
                if "choices" in chunk and chunk["choices"]:
                    delta = chunk["choices"][0].get("delta", {})
                    if "content" in delta:
                        result += delta["content"]
                        print(delta["content"], end="", flush=True)
            print()  # Newline after streaming
            return result
        else:
            return response["choices"][0]["message"]["content"]


def simple_call(
    prompt: str,
    model: str = "minimaxai/minimax-m3",
    stream: bool = False
) -> str:
    """
    Quick API call without explicit client setup.

    Args:
        prompt: User prompt
        model: Model to use
        stream: Whether to stream

    Returns:
        Response text
    """
    client = NVIDIAAPIClient(model=model)
    return client.chat(prompt, stream=stream)


if __name__ == "__main__":
    # Example usage
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
    else:
        prompt = "What is the capital of France?"

    print(f"Prompt: {prompt}\n")
    response = simple_call(prompt)
    print(f"\nResponse:\n{response}")
