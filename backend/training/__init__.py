try:
    from backend.training.train import train_and_export_models
except (ImportError, ValueError):
    try:
        from training.train import train_and_export_models
    except (ImportError, ValueError):
        from .train import train_and_export_models
