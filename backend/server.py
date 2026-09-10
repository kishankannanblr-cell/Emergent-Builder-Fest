from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
from lib.db import client, db
from routers.deals import router as deals_router
from routers.financials import router as financials_router
from routers.ai import router as ai_router

# Startup runs before the yield, shutdown after it.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed if database is empty on launch
    deals_count = await db.deals.count_documents({})
    if deals_count == 0:
        try:
            from seed import run_seed
            await run_seed()
        except Exception as e:
            logging.error(f"Failed to auto-seed database: {e}")
    yield
    client.close()

# Create the main app without a prefix
app = FastAPI(title="DealCFO API", lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add root status check
@api_router.get("/")
async def root():
    return {"message": "DealCFO API operational", "status": "healthy"}

# Include feature routers on api_router
api_router.include_router(deals_router)
api_router.include_router(financials_router)
api_router.include_router(ai_router)

# Include api_router into main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
