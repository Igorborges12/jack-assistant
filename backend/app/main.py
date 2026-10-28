
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.database import Base, engine

# Modelos do banco de dados
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.crawler_preference import CrawlerPreference

# Rotas da API
from app.api.users import router as users_router
from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.applications import router as applications_router
from app.api.crawler import router as crawler_router
from app.api.crawler_preferences import router as crawler_preferences_router


# Cria as tabelas que ainda não existem no banco de dados
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Jack API",
    description="Backend do assistente pessoal Jack",
    version="0.1.0",
)


# CORS - Permite comunicação com o frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


# Rotas da aplicação
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(crawler_router)
app.include_router(crawler_preferences_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "jack-backend",
    }


@app.get("/api/health/database")
def database_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }
