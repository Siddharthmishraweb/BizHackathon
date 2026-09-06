# Dataset Preparation and EDA

The static source dataset is [raw/synthetic_risk_profiles.csv](raw/synthetic_risk_profiles.csv). It contains 5,000 plausible financial and behavioural profiles and a small number of intentionally blank input values to exercise the cleaning workflow.

Run the preparation and exploratory analysis:

```sh
python3 -m pip install -r data/requirements.txt
python3 data/prepare_dataset.py
```

The workflow applies these missing-value rules:

| Column type | Treatment |
|---|---|
| Numeric financial/behavioural values | Median imputation |
| Categorical questionnaire values | Most-frequent-value imputation |
| `monthly_surplus` | Recomputed from cleaned income, expenses, and EMI |
| `risk_profile` | Required target; invalid or missing records are excluded |

It produces two datasets:

- `processed/risk_profiles_clean.csv` contains the imputed, validated raw features.
- `processed/risk_profiles_featured.csv` is the Phase 2 model-ready dataset. It adds `savings_ratio`, `expense_ratio`, `emi_to_income_ratio`, and `investment_to_income_ratio` using annual income where applicable.

The `feature_engineering.py` transformation is kept separate from the cleaning code so Phase 3 training and the later ML prediction service can apply the same calculations. Charts in `reports/` cover class distribution, feature correlation, and risk-profile relationships.

## Phase 3: Model Training

Train and evaluate the risk classifiers after generating the featured dataset:

```sh
.venv/bin/python ml-service/app/training/train_models.py
```

The training workflow uses a stratified 80/20 split and evaluates logistic regression, decision tree, and class-balanced random forest models. Cross-validation selects logistic regression as the current primary pipeline because it produces the strongest accuracy for this dataset. The persisted model is written to `ml-service/app/models/risk_profile_model.joblib`; metrics, confusion matrices, and random-forest feature-importance artifacts are written to `reports/model_evaluation/`.