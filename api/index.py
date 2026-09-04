import sys
import os
from pathlib import Path

# Ensure project root is first in sys.path followed by backend directory
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

for path_str in [str(backend_dir), str(root_dir)]:
    if path_str in sys.path:
        sys.path.remove(path_str)
    sys.path.insert(0, path_str)

try:
    from backend.main import app
except Exception:
    from main import app
