"""
RAG Service
Knowledge base management and retrieval
"""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import structlog
import hashlib

from app.models.citation import SourceReference
from app.utils.config import settings as app_settings

logger = structlog.get_logger()


class RAGService:
    """RAG service for knowledge base operations"""

    def __init__(self):
        self.client = None
        self.collection = None
        self.sources: Dict[str, SourceReference] = {}
        self.initialized = False

    async def initialize(self):
        """Initialize ChromaDB"""
        try:
            self.client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=app_settings.CHROMA_PERSIST_DIR
            ))

            self.collection = self.client.get_or_create_collection(
                name="autocheck_knowledge",
                metadata={"description": "Auto-Check knowledge base"}
            )

            self.initialized = True
            logger.info("rag_service_initialized")

        except Exception as e:
            logger.error("rag_init_failed", error=str(e), exc_info=e)
            raise

    async def cleanup(self):
        """Cleanup resources"""
        if self.client:
            # ChromaDB cleanup
            logger.info("rag_service_cleanup")

    async def ingest_document(
        self,
        content: bytes,
        source_ref: SourceReference,
        filename: str
    ) -> Dict[str, Any]:
        """Ingest a document into the knowledge base"""
        try:
            # Decode content
            text = content.decode("utf-8", errors="ignore")

            # Chunk text
            chunks = self._chunk_text(text, app_settings.RAG_CHUNK_SIZE, app_settings.RAG_CHUNK_OVERLAP)

            # Store source
            self.sources[source_ref.id] = source_ref

            # Add to ChromaDB
            ids = []
            documents = []
            metadatas = []

            for idx, chunk in enumerate(chunks):
                chunk_id = f"{source_ref.id}_chunk_{idx}"
                ids.append(chunk_id)
                documents.append(chunk)
                metadatas.append({
                    "source_id": source_ref.id,
                    "source_title": source_ref.title,
                    "chunk_index": idx,
                    "filename": filename
                })

            self.collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )

            logger.info(
                "document_ingested",
                source_id=source_ref.id,
                chunks=len(chunks)
            )

            return {
                "source_id": source_ref.id,
                "chunks_created": len(chunks)
            }

        except Exception as e:
            logger.error("ingest_failed", source=source_ref.id, error=str(e), exc_info=e)
            raise

    async def query(
        self,
        query: str,
        top_k: int = 5,
        min_confidence: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Query the knowledge base"""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k
            )

            formatted_results = []
            for idx in range(len(results["ids"][0])):
                result = {
                    "id": results["ids"][0][idx],
                    "text": results["documents"][0][idx],
                    "metadata": results["metadatas"][0][idx],
                    "distance": results["distances"][0][idx] if "distances" in results else None,
                    "confidence": 1.0 - (results["distances"][0][idx] if "distances" in results else 0.5)
                }

                if result["confidence"] >= min_confidence:
                    formatted_results.append(result)

            return formatted_results

        except Exception as e:
            logger.error("query_failed", query=query, error=str(e), exc_info=e)
            return []

    async def validate_claim(
        self,
        claim: str,
        claimed_value: Optional[Any] = None,
        context: Optional[dict] = None
    ) -> Dict[str, Any]:
        """Validate a claim against knowledge base"""
        try:
            # Query for relevant passages
            results = await self.query(claim, top_k=3, min_confidence=0.6)

            if not results:
                return {
                    "verified": False,
                    "confidence": 0.5,
                    "message": "No supporting evidence found in knowledge base",
                    "citations": []
                }

            # Analyze results
            best_match = results[0]

            return {
                "verified": best_match["confidence"] > 0.7,
                "confidence": best_match["confidence"],
                "message": f"Found relevant passage in {best_match['metadata'].get('source_title', 'knowledge base')}",
                "supporting_text": best_match["text"][:200],
                "citations": [best_match["metadata"].get("source_title")],
                "source_id": best_match["metadata"].get("source_id")
            }

        except Exception as e:
            logger.error("validation_failed", claim=claim, error=str(e), exc_info=e)
            return {
                "verified": False,
                "confidence": 0.0,
                "message": f"Validation error: {str(e)}",
                "citations": []
            }

    async def delete_source(self, source_id: str):
        """Delete a source from knowledge base"""
        try:
            # Get all chunks for this source
            results = self.collection.get(
                where={"source_id": source_id}
            )

            if results["ids"]:
                self.collection.delete(ids=results["ids"])

            if source_id in self.sources:
                del self.sources[source_id]

            logger.info("source_deleted", source_id=source_id)

        except Exception as e:
            logger.error("delete_failed", source_id=source_id, error=str(e), exc_info=e)
            raise

    async def reindex(self):
        """Reindex knowledge base"""
        logger.info("reindex_started")
        # ChromaDB handles indexing automatically
        logger.info("reindex_completed")

    async def get_stats(self) -> Dict[str, Any]:
        """Get RAG system statistics"""
        try:
            count = self.collection.count()

            return {
                "total_chunks": count,
                "total_sources": len(self.sources),
                "initialized": self.initialized
            }

        except Exception as e:
            logger.error("stats_failed", error=str(e), exc_info=e)
            return {
                "total_chunks": 0,
                "total_sources": 0,
                "initialized": self.initialized
            }

    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """Chunk text with overlap"""
        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]

            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind(".")
                if last_period > chunk_size * 0.5:
                    end = start + last_period + 1
                    chunk = text[start:end]

            chunks.append(chunk.strip())
            start = end - overlap

        return chunks


# Global instance
rag_service = RAGService()
