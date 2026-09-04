try:
    from backend.data.demo_scenarios import get_demo_scenarios
    from backend.data.synthetic_generator import generate_synthetic_historical_stream
except (ImportError, ValueError):
    try:
        from data.demo_scenarios import get_demo_scenarios
        from data.synthetic_generator import generate_synthetic_historical_stream
    except (ImportError, ValueError):
        from .demo_scenarios import get_demo_scenarios
        from .synthetic_generator import generate_synthetic_historical_stream
