"""
RAG Service — LangChain Retrieval-Augmented Generation pipeline.
Handles document ingestion, vector storage, and contextual query answering.
"""

import logging
from pathlib import Path
from typing import Optional, List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from services.llm_service import llm_service

logger = logging.getLogger(__name__)

# PlacementGPT Master Prompt Template
PLACEMENT_GPT_PROMPT = """You are PlacementGPT, an intelligent AI Placement Eligibility and Career Guidance Assistant.

Your goal is to help students understand their placement readiness, company eligibility, strengths, weaknesses, skill gaps, and career improvement opportunities.

Use ONLY the provided context and information when generating responses. Do not fabricate any data.

## Response Guidelines:
- Be professional, helpful, encouraging, and data-driven
- Provide specific, actionable recommendations based on the student's profile
- If evaluating eligibility, clearly state the status (Eligible / Partially Eligible / Not Eligible)
- Estimate a Placement Readiness Score between 0 and 100 when appropriate
- Identify strengths and areas for improvement
- Use phrases like "Based on available data", "The model suggests", "The prediction indicates"
- Never claim certainty about predictions

## Retrieved Context:
{context}

## Student Profile:
{student_profile}

## Prediction Result:
{prediction_result}

## User Question:
{question}

Generate an accurate, evidence-based placement guidance response using only the provided information. Structure your response clearly with sections for Eligibility Status, Readiness Score, Strengths, Areas for Improvement, and Recommendations where applicable."""


class RAGService:
    """LangChain RAG pipeline for placement knowledge retrieval."""

    def __init__(self):
        self.vectorstore = None
        self.embeddings = None
        self.is_ready = False

    def initialize(
        self,
        knowledge_dir: str,
        persist_dir: str,
        embedding_model: str = "all-MiniLM-L6-v2",
    ):
        """
        Initialize the RAG pipeline:
        1. Load embedding model
        2. Ingest knowledge documents into ChromaDB
        """
        try:
            logger.info("Initializing RAG pipeline...")

            # Load embedding model
            self.embeddings = HuggingFaceEmbeddings(
                model_name=embedding_model,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True},
            )
            logger.info(f"Embedding model loaded: {embedding_model}")

            # Check if vectorstore already exists
            persist_path = Path(persist_dir)
            if persist_path.exists() and any(persist_path.iterdir()):
                logger.info("Loading existing vectorstore...")
                self.vectorstore = Chroma(
                    collection_name="placement_knowledge",
                    embedding_function=self.embeddings,
                    persist_directory=str(persist_dir),
                )
            else:
                logger.info("Creating new vectorstore from knowledge documents...")
                self._ingest_documents(knowledge_dir, persist_dir)

            self.is_ready = True
            logger.info("RAG pipeline ready!")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize RAG pipeline: {e}")
            self.is_ready = False
            return False

    def _ingest_documents(self, knowledge_dir: str, persist_dir: str):
        """Load and ingest knowledge documents into ChromaDB."""
        knowledge_path = Path(knowledge_dir)

        if not knowledge_path.exists():
            logger.warning(f"Knowledge directory not found: {knowledge_dir}")
            return

        # Load all text files
        documents = []
        for txt_file in knowledge_path.glob("*.txt"):
            try:
                loader = TextLoader(str(txt_file), encoding="utf-8")
                documents.extend(loader.load())
                logger.info(f"Loaded: {txt_file.name}")
            except Exception as e:
                logger.error(f"Error loading {txt_file.name}: {e}")

        if not documents:
            logger.warning("No documents found to ingest!")
            return

        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        chunks = text_splitter.split_documents(documents)
        logger.info(f"Created {len(chunks)} document chunks")

        # Create vectorstore
        self.vectorstore = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            collection_name="placement_knowledge",
            persist_directory=str(persist_dir),
        )
        logger.info(f"Vectorstore created with {len(chunks)} chunks")

    def query(
        self,
        question: str,
        student_profile: str = "Not provided",
        prediction_result: str = "Not available",
        k: int = 5,
    ) -> dict:
        """
        Query the RAG pipeline with student context.
        Returns the AI response and number of sources used.
        """
        if not self.is_ready:
            return {
                "response": "RAG system is not initialized. Please check the configuration.",
                "sources_used": 0,
            }

        try:
            # Retrieve relevant documents
            if self.vectorstore:
                retriever = self.vectorstore.as_retriever(
                    search_type="similarity",
                    search_kwargs={"k": k},
                )
                if hasattr(retriever, "invoke"):
                    relevant_docs = retriever.invoke(question)
                elif hasattr(retriever, "get_relevant_documents"):
                    relevant_docs = retriever.get_relevant_documents(question)
                else:
                    relevant_docs = self.vectorstore.similarity_search(question, k=k)
                context = "\n\n".join([doc.page_content for doc in relevant_docs])
                sources_used = len(relevant_docs)
            else:
                context = "No knowledge base available."
                sources_used = 0

            # Format the master prompt
            formatted_prompt = PLACEMENT_GPT_PROMPT.format(
                context=context,
                student_profile=student_profile,
                prediction_result=prediction_result,
                question=question,
            )

            # Generate response using LLM
            response = llm_service.generate(formatted_prompt)

            return {
                "response": response,
                "sources_used": sources_used,
            }

        except Exception as e:
            logger.error(f"RAG query error: {e}")
            return {
                "response": f"An error occurred while processing your query. Please try again.",
                "sources_used": 0,
            }

    def get_relevant_context(self, query: str, k: int = 3) -> List[str]:
        """Retrieve relevant document chunks without generating a response."""
        if not self.is_ready or not self.vectorstore:
            return []

        try:
            docs = self.vectorstore.similarity_search(query, k=k)
            return [doc.page_content for doc in docs]
        except Exception as e:
            logger.error(f"Context retrieval error: {e}")
            return []


# Global singleton
rag_service = RAGService()
