try:
    from backend.api.routes import router
except (ImportError, ValueError):
    try:
        from api.routes import router
    except (ImportError, ValueError):
        from .routes import router
