"""
Main FastAPI application for Explain Like I'm 10
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from config import (
    CORS_ORIGINS, 
    CORS_CREDENTIALS, 
    CORS_METHODS, 
    CORS_HEADERS,
    CORS_EXPOSE_HEADERS
)

# Initialize FastAPI app
app = FastAPI(title="Explain Like I'm 10")

# Add CORS middleware - must be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Set to False when using wildcard origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]  # Expose all headers
)

# Include API routes
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

