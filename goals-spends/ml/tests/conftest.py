import json
import os
import pytest

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "..", "samples")


@pytest.fixture
def canonical_user_data() -> dict:
    """The single canonical demo dataset (ml/samples/user_data.json) also used by
    apps/backend and apps/goals-frontend — keeping tests grounded in the same
    data everything else runs against."""
    with open(os.path.join(SAMPLES_DIR, "user_data.json")) as f:
        return json.load(f)
