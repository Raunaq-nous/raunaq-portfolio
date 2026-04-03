"""
RAG Knowledge Base Setup Script
Populates the knowledge base with reference documents
"""

import asyncio
import aiohttp
import os
from pathlib import Path

# Reference documents to fetch and ingest
REFERENCE_DOCS = [
    {
        "title": "WCAG 2.1 - Contrast Minimum",
        "url": "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum",
        "type": "standard",
        "publisher": "W3C",
        "section": "1.4.3"
    },
    {
        "title": "Microsoft Writing Style Guide - Numbers",
        "url": "https://learn.microsoft.com/en-us/style-guide/numbers",
        "type": "guide",
        "publisher": "Microsoft"
    },
    {
        "title": "GOV.UK Style Guide - Writing about numbers",
        "url": "https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style#numbers",
        "type": "guide",
        "publisher": "GOV.UK"
    },
    {
        "title": "Plain Language Guidelines",
        "url": "https://www.plainlanguage.gov/guidelines/",
        "type": "guide",
        "publisher": "Digital.gov"
    },
    {
        "title": "APA Style - Numbers",
        "url": "https://apastyle.apa.org/style-grammar-guidelines/numbers",
        "type": "guide",
        "publisher": "APA"
    }
]

# Local files to ingest (place in docs/ folder)
LOCAL_DOCS = [
    {
        "filename": "stephen_few_chart_design.pdf",
        "title": "Designing Effective Tables and Graphs",
        "type": "article",
        "publisher": "Perceptual Edge"
    },
    {
        "filename": "tufte_principles.txt",
        "title": "Tufte Data Visualization Principles",
        "type": "article",
        "publisher": "Edward Tufte"
    }
]


async def fetch_url_content(url: str) -> str:
    """Fetch content from URL"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                return await response.text()
            else:
                print(f"Failed to fetch {url}: {response.status}")
                return None


async def ingest_web_document(api_base: str, doc: dict):
    """Ingest a web document"""
    print(f"Fetching: {doc['title']}...")

    content = await fetch_url_content(doc['url'])
    if not content:
        print(f"  ❌ Failed to fetch {doc['title']}")
        return

    # Create a temporary text file
    temp_file = f"/tmp/{doc['title'].replace(' ', '_')}.txt"
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(content)

    # Ingest via API
    async with aiohttp.ClientSession() as session:
        with open(temp_file, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('file', f, filename=f"{doc['title']}.txt")
            data.add_field('title', doc['title'])
            data.add_field('doc_type', doc['type'])
            data.add_field('url', doc['url'])
            data.add_field('publisher', doc.get('publisher', ''))
            data.add_field('section', doc.get('section', ''))

            async with session.post(f"{api_base}/api/rag/ingest", data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"  ✅ Ingested: {result.get('chunks_created', 0)} chunks")
                else:
                    print(f"  ❌ Failed to ingest: {response.status}")

    # Cleanup
    os.remove(temp_file)


async def ingest_local_document(api_base: str, doc: dict):
    """Ingest a local document"""
    filepath = Path("docs") / doc["filename"]

    if not filepath.exists():
        print(f"  ⚠️  File not found: {filepath}")
        return

    print(f"Ingesting: {doc['title']}...")

    async with aiohttp.ClientSession() as session:
        with open(filepath, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('file', f, filename=doc['filename'])
            data.add_field('title', doc['title'])
            data.add_field('doc_type', doc['type'])
            data.add_field('publisher', doc.get('publisher', ''))

            async with session.post(f"{api_base}/api/rag/ingest", data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"  ✅ Ingested: {result.get('chunks_created', 0)} chunks")
                else:
                    print(f"  ❌ Failed to ingest: {response.status}")


async def setup_knowledge_base(api_base: str = "http://localhost:8000"):
    """Setup the complete knowledge base"""
    print("🚀 Starting RAG Knowledge Base Setup\n")
    print(f"API Base: {api_base}\n")

    # Ingest web documents
    print("📡 Ingesting web documents...")
    for doc in REFERENCE_DOCS:
        await ingest_web_document(api_base, doc)
        await asyncio.sleep(1)  # Rate limiting

    print("\n📁 Ingesting local documents...")
    for doc in LOCAL_DOCS:
        await ingest_local_document(api_base, doc)

    # Get stats
    print("\n📊 Knowledge Base Statistics:")
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{api_base}/api/rag/stats") as response:
            if response.status == 200:
                stats = await response.json()
                print(f"  Total Sources: {stats.get('total_sources', 0)}")
                print(f"  Total Chunks: {stats.get('total_chunks', 0)}")

    print("\n✅ Knowledge base setup complete!")


async def add_custom_text(api_base: str, title: str, content: str, doc_type: str = "guide"):
    """Add custom text content to knowledge base"""
    temp_file = f"/tmp/{title.replace(' ', '_')}.txt"
    with open(temp_file, 'w', encoding='utf-8') as f:
        f.write(content)

    async with aiohttp.ClientSession() as session:
        with open(temp_file, 'rb') as f:
            data = aiohttp.FormData()
            data.add_field('file', f, filename=f"{title}.txt")
            data.add_field('title', title)
            data.add_field('doc_type', doc_type)

            async with session.post(f"{api_base}/api/rag/ingest", data=data) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Added '{title}': {result.get('chunks_created', 0)} chunks")
                    return result

    os.remove(temp_file)


# Example usage for adding custom rules
CUSTOM_RULES = """
# Presentation Best Practices

## Typography Rules
- Minimum font size: 10pt for body text
- Recommended title size: 36-44pt
- Limit to 3-5 different font sizes per deck
- Use sans-serif fonts for presentations (Arial, Calibri, Helvetica)

## Color Guidelines
- Maintain brand color palette
- Ensure WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text
- Limit to 5-7 colors per deck
- Use colorblind-safe palettes

## Content Guidelines
- Maximum 6-7 bullet points per slide
- Maximum 6-7 words per bullet
- One main idea per slide
- Avoid full sentences in bullets

## Chart Design
- Limit to 7 data series maximum
- Always label axes clearly
- Use legends sparingly
- Avoid 3D charts
- Remove chartjunk (unnecessary decorations)

## Number Formatting
- Spell out numbers 1-9 in text
- Use numerals for 10 and above
- Be consistent with units (K, M, B)
- Round to 2 decimal places maximum
"""


async def setup_with_custom_rules(api_base: str = "http://localhost:8000"):
    """Setup knowledge base including custom rules"""
    await setup_knowledge_base(api_base)

    print("\n📝 Adding custom presentation rules...")
    await add_custom_text(
        api_base,
        "Presentation Best Practices",
        CUSTOM_RULES,
        "guide"
    )


if __name__ == "__main__":
    import sys

    api_base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

    print("Auto-Check RAG Knowledge Base Setup")
    print("=" * 50)
    print("\nOptions:")
    print("1. Setup with web documents only")
    print("2. Setup with custom rules (recommended)")
    print("3. Add custom text")

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == "1":
        asyncio.run(setup_knowledge_base(api_base))
    elif choice == "2":
        asyncio.run(setup_with_custom_rules(api_base))
    elif choice == "3":
        title = input("Enter document title: ")
        content = input("Enter content (or path to file): ")
        if os.path.exists(content):
            with open(content, 'r') as f:
                content = f.read()
        asyncio.run(add_custom_text(api_base, title, content))
    else:
        print("Invalid choice")
