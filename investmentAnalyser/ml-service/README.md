# ML Prediction Service

The FastAPI service loads the Phase 3 joblib artifact once at startup and exposes risk prediction only. It does not create product recommendations or persist data.

Install project dependencies and start the service from the repository root:

```sh
.venv/bin/python -m pip install -r data/requirements.txt
cd ml-service
../.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

Available endpoints:

- `GET /health` confirms that the persisted model loaded successfully.
- `POST /predict-risk` accepts the raw financial and questionnaire fields described in [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) and returns a risk profile and per-class probabilities.

`risk_questionnaire_score` is optional. When it is omitted, the service derives a deterministic score from the submitted behavioural answers before prediction.