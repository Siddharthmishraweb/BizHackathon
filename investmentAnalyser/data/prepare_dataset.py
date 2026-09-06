"""Clean the raw risk-profile CSV and generate exploratory data-analysis charts."""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

from feature_engineering import add_derived_features


DATA_DIRECTORY = Path(__file__).parent
RAW_DATA_PATH = DATA_DIRECTORY / "raw" / "synthetic_risk_profiles.csv"
PROCESSED_DATA_PATH = DATA_DIRECTORY / "processed" / "risk_profiles_clean.csv"
FEATURED_DATA_PATH = DATA_DIRECTORY / "processed" / "risk_profiles_featured.csv"
REPORT_DIRECTORY = DATA_DIRECTORY / "reports"

NUMERIC_COLUMNS = [
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
]
CATEGORICAL_COLUMNS = [
    "investment_frequency",
    "liquidity_preference",
    "investment_goal",
]
RISK_ORDER = ["LOW", "MEDIUM", "HIGH"]


def clean_dataset(dataframe: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
    """Impute input values and restore financial consistency before analysis."""
    missing_before = dataframe.isna().sum().to_dict()
    cleaned = dataframe.copy()

    for column in NUMERIC_COLUMNS:
        cleaned[column] = pd.to_numeric(cleaned[column], errors="coerce")
        cleaned[column] = cleaned[column].fillna(cleaned[column].median())

    for column in CATEGORICAL_COLUMNS:
        cleaned[column] = cleaned[column].str.strip().str.upper()
        cleaned[column] = cleaned[column].fillna(cleaned[column].mode().iat[0])

    cleaned["risk_profile"] = cleaned["risk_profile"].str.strip().str.upper()
    cleaned = cleaned[cleaned["risk_profile"].isin(RISK_ORDER)].copy()
    cleaned["monthly_surplus"] = (
        cleaned["monthly_income"] - cleaned["monthly_expenses"] - cleaned["monthly_emi"]
    ).clip(lower=0)

    if cleaned.isna().any().any():
        raise ValueError("cleaned dataset still contains missing values")
    return cleaned, {column: int(count) for column, count in missing_before.items() if count}


def create_charts(dataframe: pd.DataFrame) -> None:
    REPORT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    sns.set_theme(style="whitegrid", palette="deep")

    profile_counts = dataframe["risk_profile"].value_counts().reindex(RISK_ORDER)
    figure, axis = plt.subplots(figsize=(7, 5))
    sns.barplot(x=profile_counts.index, y=profile_counts.values, ax=axis)
    axis.set(title="Risk Profile Distribution", xlabel="Risk Profile", ylabel="Respondents")
    figure.tight_layout()
    figure.savefig(REPORT_DIRECTORY / "risk_profile_distribution.png", dpi=160)
    plt.close(figure)

    correlation_columns = [
        "monthly_income",
        "monthly_expenses",
        "monthly_surplus",
        "savings",
        "existing_investments",
        "monthly_emi",
        "investment_horizon",
        "risk_questionnaire_score",
    ]
    figure, axis = plt.subplots(figsize=(11, 8))
    sns.heatmap(
        dataframe[correlation_columns].corr(),
        annot=True,
        cmap="RdYlBu_r",
        center=0,
        fmt=".2f",
        ax=axis,
    )
    axis.set_title("Financial and Behavioural Feature Correlations")
    figure.tight_layout()
    figure.savefig(REPORT_DIRECTORY / "feature_correlation_heatmap.png", dpi=160)
    plt.close(figure)

    figure, axes = plt.subplots(1, 2, figsize=(12, 5))
    sns.boxplot(data=dataframe, x="risk_profile", y="investment_horizon", order=RISK_ORDER, ax=axes[0])
    sns.boxplot(
        data=dataframe,
        x="risk_profile",
        y="risk_questionnaire_score",
        order=RISK_ORDER,
        ax=axes[1],
    )
    axes[0].set_title("Horizon by Risk Profile")
    axes[1].set_title("Questionnaire Score by Risk Profile")
    figure.tight_layout()
    figure.savefig(REPORT_DIRECTORY / "risk_profile_relationships.png", dpi=160)
    plt.close(figure)


def main() -> None:
    raw_dataset = pd.read_csv(RAW_DATA_PATH)
    cleaned_dataset, missing_before = clean_dataset(raw_dataset)
    featured_dataset = add_derived_features(cleaned_dataset)
    PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    cleaned_dataset.to_csv(PROCESSED_DATA_PATH, index=False)
    featured_dataset.to_csv(FEATURED_DATA_PATH, index=False)
    create_charts(cleaned_dataset)
    print(f"Cleaned {len(cleaned_dataset)} records.")
    print(f"Missing values imputed: {missing_before or 'none'}")
    print(f"Clean CSV: {PROCESSED_DATA_PATH}")
    print(f"Featured CSV: {FEATURED_DATA_PATH}")
    print(f"Charts: {REPORT_DIRECTORY}")


if __name__ == "__main__":
    main()