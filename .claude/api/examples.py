"""
Examples of using the NVIDIA API client for various tasks.
"""

from nvidia_api import NVIDIAAPIClient


def example_simple_chat():
    """Basic text chat."""
    client = NVIDIAAPIClient()
    response = client.chat("Explain quantum computing in simple terms")
    print("Simple Chat:\n", response)


def example_multimodal_with_url():
    """Chat with image URL."""
    client = NVIDIAAPIClient()
    response = client.chat(
        content=[
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    )
    print("Multimodal (URL):\n", response)


def example_multimodal_with_file():
    """Chat with local image file."""
    client = NVIDIAAPIClient()
    response = client.chat(
        content=[
            {"type": "text", "text": "Analyze this image"},
            {"type": "image", "path": "/path/to/image.png"}
        ]
    )
    print("Multimodal (File):\n", response)


def example_streaming():
    """Stream response for long outputs."""
    client = NVIDIAAPIClient()
    print("Streaming response:")
    response = client.chat(
        "Write a short story about AI",
        stream=True
    )


def example_system_prompt():
    """Use system message for role-playing."""
    client = NVIDIAAPIClient()
    response = client.chat(
        user_message="What's 2+2?",
        system_message="You are a helpful math tutor. Explain your answers step by step.",
        temperature=0.7
    )
    print("With System Prompt:\n", response)


def example_conversation():
    """Multi-turn conversation."""
    client = NVIDIAAPIClient()

    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What's Python?"},
        {"role": "assistant", "content": "Python is a high-level programming language..."},
        {"role": "user", "content": "Give me an example."}
    ]

    response = client.invoke(messages)
    print("Conversation:\n", response["choices"][0]["message"]["content"])


def example_different_model():
    """Use a different model."""
    client = NVIDIAAPIClient(model="mistralai/mistral-large")
    response = client.chat("Hello, what model are you?")
    print("Different Model:\n", response)


def example_with_parameters():
    """Fine-tune generation with parameters."""
    client = NVIDIAAPIClient()
    response = client.chat(
        "Generate a creative story",
        max_tokens=2000,
        temperature=1.5,  # More creative
        top_p=0.9
    )
    print("With Parameters:\n", response)


if __name__ == "__main__":
    print("NVIDIA API Client Examples\n")
    print("=" * 50)

    # Uncomment to run examples
    print("\n1. Simple Chat:")
    print("-" * 50)
    example_simple_chat()

    print("\n2. With System Prompt:")
    print("-" * 50)
    example_system_prompt()

    print("\n3. Streaming:")
    print("-" * 50)
    example_streaming()

    # print("\n4. Multimodal with File:")
    # print("-" * 50)
    # example_multimodal_with_file()

    # print("\n5. Different Model:")
    # print("-" * 50)
    # example_different_model()
