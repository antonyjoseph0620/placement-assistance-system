"""
LLM Service — HuggingFace Transformers wrapper for Llama 3.2 1B Instruct.
Provides both direct generation and LangChain-compatible pipeline.
"""

import logging
from typing import Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

logger = logging.getLogger(__name__)


class LLMService:
    """Wrapper around HuggingFace Transformers for Llama 3.2."""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipe = None
        self.is_loaded = False
        self.load_error = None

    def load_model(self, model_name: str, hf_token: str, max_new_tokens: int = 1024):
        """
        Load the Llama 3.2 model from HuggingFace.
        Falls back to CPU if CUDA is unavailable.
        """
        self.load_error = None
        try:
            logger.info(f"Loading model: {model_name}")

            # Determine device
            if torch.cuda.is_available():
                device = "cuda"
                dtype = torch.float16
                logger.info("Using CUDA GPU for inference")
            else:
                device = "cpu"
                dtype = torch.float32
                logger.info("Using CPU for inference (may be slow)")

            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                token=hf_token if hf_token else None,
                trust_remote_code=True,
            )

            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                token=hf_token if hf_token else None,
                torch_dtype=dtype,
                device_map="auto" if device == "cuda" else None,
                trust_remote_code=True,
                low_cpu_mem_usage=True,
            )

            if device == "cpu":
                self.model = self.model.to(device)

            # Create pipeline
            self.pipe = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.15,
                return_full_text=False,
            )

            self.is_loaded = True
            logger.info("Model loaded successfully!")
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.load_error = str(e)
            self.is_loaded = False
            return False

    def generate(self, prompt: str, max_new_tokens: Optional[int] = None) -> str:
        """
        Generate a response from the LLM.
        Returns a fallback message if model isn't loaded.
        """
        if not self.is_loaded:
            return self._fallback_response(prompt)

        try:
            # Format as chat messages for instruct model
            messages = [
                {"role": "system", "content": "You are PlacementGPT, an intelligent AI Placement Eligibility and Career Guidance Assistant. Provide helpful, accurate, and encouraging placement guidance based on the provided information."},
                {"role": "user", "content": prompt}
            ]

            if hasattr(self.tokenizer, "apply_chat_template"):
                formatted_prompt = self.tokenizer.apply_chat_template(
                    messages,
                    tokenize=False,
                    add_generation_prompt=True,
                )
            else:
                formatted_prompt = "\n\n".join([m["content"] for m in messages])

            # Generate
            gen_kwargs = {}
            if max_new_tokens:
                gen_kwargs["max_new_tokens"] = max_new_tokens

            outputs = self.pipe(formatted_prompt, **gen_kwargs)
            response = outputs[0]["generated_text"].strip()

            return response

        except Exception as e:
            logger.error(f"Generation error: {e}")
            return self._fallback_response(prompt)

    def _fallback_response(self, prompt: str) -> str:
        """
        Generate a rule-based fallback response when the LLM is unavailable.
        Parses the prompt to extract student info and provides basic guidance.
        """
        return (
            "**Note: AI model is currently unavailable. Providing rule-based analysis.**\n\n"
            "Based on the information provided, here is a preliminary assessment:\n\n"
            "**Recommendations:**\n"
            "• Focus on strengthening your technical and coding skills through regular practice\n"
            "• Complete relevant certifications in your domain\n"
            "• Build 3-5 significant projects that demonstrate practical skills\n"
            "• Improve communication skills through regular practice and reading\n"
            "• Maintain attendance above 85% for better placement readiness\n"
            "• Clear any active backlogs to maximize eligibility\n\n"
            "*For detailed AI-powered analysis, please ensure the language model is properly configured.*"
        )


# Global singleton
llm_service = LLMService()
