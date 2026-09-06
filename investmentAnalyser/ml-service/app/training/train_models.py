"""Train and evaluate risk-profile classification models offline."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = PROJECT_ROOT / "data" / "processed" / "risk_profiles_featured.csv"
MODEL_DIRECTORY = PROJECT_ROOT / "ml-service" / "app" / "models"
REPORT_DIRECTORY = PROJECT_ROOT / "data" / "reports" / "model_evaluation"
MODEL_PATH = MODEL_DIRECTORY / "risk_profile_model.joblib"
METRICS_PATH = REPORT_DIRECTORY / "model_metrics.json"
FEATURE_IMPORTANCE_PATH = REPORT_DIRECTORY / "random_forest_feature_importance.csv"
RISK_LABELS = ["LOW", "MEDIUM", "HIGH"]
RANDOM_STATE = 42
MODEL_VERSION = "1.1.0"
PRIMARY_MODEL_NAME = "logistic_regression"

NUMERIC_FEATURES = [
    "age",
    "monthly_income",
    "monthly_expenses",
    "monthly_surplus",
    "savings",
    "existing_investments",
    "monthly_emi",
    "investment_horizon",
    "investment_experience",
    "reaction_to_market_loss",
    "risk_questionnaire_score",
    "savings_ratio",
    "expense_ratio",
    "emi_to_income_ratio",
    "investment_to_income_ratio",
]
CATEGORICAL_FEATURES = [
    "investment_frequency",
    "liquidity_preference",
    "investment_goal",
]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                NUMERIC_FEATURES,
            ),
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                CATEGORICAL_FEATURES,
            ),
        ]
    )


def build_models() -> dict[str, object]:
    return {
        "logistic_regression": LogisticRegression(
            max_iter=1_000, random_state=RANDOM_STATE
        ),
        "decision_tree": DecisionTreeClassifier(
            max_depth=8, min_samples_leaf=10, class_weight="balanced", random_state=RANDOM_STATE
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=300,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=RANDOM_STATE,
            n_jobs=-1,
        ),
    }


def evaluate_model(model: Pipeline, features: pd.DataFrame, target: pd.Series) -> dict[str, object]:
    predictions = model.predict(features)
    report = classification_report(
        target, predictions, labels=RISK_LABELS, output_dict=True, zero_division=0
    )
    return {
        "accuracy": accuracy_score(target, predictions),
        "precision_weighted": report["weighted avg"]["precision"],
        "recall_weighted": report["weighted avg"]["recall"],
        "f1_weighted": report["weighted avg"]["f1-score"],
        "classification_report": report,
        "predictions": predictions,
    }


def save_confusion_matrix(target: pd.Series, predictions: object, model_name: str) -> None:
    matrix = confusion_matrix(target, predictions, labels=RISK_LABELS)
    figure, axis = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        matrix,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=RISK_LABELS,
        yticklabels=RISK_LABELS,
        ax=axis,
    )
    axis.set(title=f"{model_name.replace('_', ' ').title()} Confusion Matrix", xlabel="Predicted", ylabel="Actual")
    figure.tight_layout()
    figure.savefig(REPORT_DIRECTORY / f"{model_name}_confusion_matrix.png", dpi=160)
    plt.close(figure)


def save_feature_importance(model: Pipeline) -> None:
    classifier = model.named_steps["classifier"]
    preprocessor = model.named_steps["preprocessor"]
    feature_importance = pd.DataFrame(
        {
            "feature": preprocessor.get_feature_names_out(),
            "importance": classifier.feature_importances_,
        }
    ).sort_values("importance", ascending=False)
    feature_importance.to_csv(FEATURE_IMPORTANCE_PATH, index=False)

    figure, axis = plt.subplots(figsize=(10, 7))
    sns.barplot(data=feature_importance.head(15), x="importance", y="feature", ax=axis, color="#1b9e77")
    axis.set_title("Random Forest Feature Importance")
    figure.tight_layout()
    figure.savefig(REPORT_DIRECTORY / "random_forest_feature_importance.png", dpi=160)
    plt.close(figure)


def main() -> None:
    sns.set_theme(style="whitegrid")
    dataset = pd.read_csv(DATA_PATH)
    features = dataset[FEATURES]
    target = dataset["risk_profile"]
    training_features, test_features, training_target, test_target = train_test_split(
        features,
        target,
        test_size=0.2,
        stratify=target,
        random_state=RANDOM_STATE,
    )

    MODEL_DIRECTORY.mkdir(parents=True, exist_ok=True)
    REPORT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    metrics: dict[str, dict[str, object]] = {}
    trained_models: dict[str, Pipeline] = {}

    for model_name, classifier in build_models().items():
        model = Pipeline(
            steps=[("preprocessor", build_preprocessor()), ("classifier", classifier)]
        )
        model.fit(training_features, training_target)
        evaluation = evaluate_model(model, test_features, test_target)
        predictions = evaluation.pop("predictions")
        metrics[model_name] = evaluation
        trained_models[model_name] = model
        save_confusion_matrix(test_target, predictions, model_name)

    primary_model = trained_models[PRIMARY_MODEL_NAME]
    joblib.dump(
        {
            "model": primary_model,
            "model_version": MODEL_VERSION,
            "model_name": PRIMARY_MODEL_NAME,
            "feature_columns": FEATURES,
            "risk_labels": RISK_LABELS,
        },
        MODEL_PATH,
    )
    save_feature_importance(trained_models["random_forest"])

    with METRICS_PATH.open("w", encoding="utf-8") as metrics_file:
        json.dump(metrics, metrics_file, indent=2)

    for model_name, evaluation in metrics.items():
        print(
            f"{model_name}: accuracy={evaluation['accuracy']:.3f}, "
            f"weighted_f1={evaluation['f1_weighted']:.3f}"
        )
    print(f"Saved primary model ({PRIMARY_MODEL_NAME}): {MODEL_PATH}")
    print(f"Saved evaluation artifacts: {REPORT_DIRECTORY}")


if __name__ == "__main__":
    main()