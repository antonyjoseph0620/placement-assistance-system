import sys
from pathlib import Path
backend = Path(__file__).resolve().parent
sys.path.insert(0, str(backend))

import config
from services.llm_service import llm_service

print('HF_TOKEN set', bool(config.HF_TOKEN))
print('MODEL_NAME', config.MODEL_NAME)
print('API_PORT', config.API_PORT)
print('CORS_ORIGINS', config.CORS_ORIGINS)
print('DATA_DIR', config.DATA_DIR)
print('Knowledge dir exists', Path(config.KNOWLEDGE_DIR).exists())
print('Vectorstore dir exists', Path(config.VECTORSTORE_DIR).exists())

print('Trying model load...')
loaded = llm_service.load_model(config.MODEL_NAME, config.HF_TOKEN, max_new_tokens=5)
print('load result', loaded)
print('is_loaded', llm_service.is_loaded)
print('load_error', llm_service.load_error)
