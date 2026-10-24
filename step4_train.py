
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
import joblib

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "embeddings"
MODELS = ROOT / "models"
MODELS.mkdir(parents=True, exist_ok=True)

# Load the embeddings saved by step3_extract.py
train = np.load(DATA / "train_features.npz")
dev = np.load(DATA / "dev_features.npz")

X_train, y_train = train["X"], train["y"]
X_dev, y_dev = dev["X"], dev["y"]

print("Training samples:", X_train.shape)
print("Development samples:", X_dev.shape)
print("Labels: 0 = bonafide, 1 = spoof")

classifiers = {
    "Logistic Regression": make_pipeline(
        StandardScaler(),
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42,
        ),
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    ),
}

results = []

for name, model in classifiers.items():
    print(f"\n{'=' * 55}")
    print("Training:", name)

    model.fit(X_train, y_train)
    predictions = model.predict(X_dev)
    probabilities = model.predict_proba(X_dev)[:, 1]

    accuracy = accuracy_score(y_dev, predictions)
    auc = roc_auc_score(y_dev, probabilities)

    print(f"Accuracy: {accuracy:.4f}")
    print(f"ROC-AUC:  {auc:.4f}")
    print("\nConfusion matrix:")
    print("Rows = actual [bonafide, spoof]")
    print("Columns = predicted [bonafide, spoof]")
    print(confusion_matrix(y_dev, predictions, labels=[0, 1]))

    print("\nClassification report:")
    print(
        classification_report(
            y_dev,
            predictions,
            labels=[0, 1],
            target_names=["bonafide", "spoof"],
            zero_division=0,
        )
    )

    model_path = MODELS / (
        "logistic_regression.joblib"
        if name == "Logistic Regression"
        else "random_forest.joblib"
    )
    joblib.dump(model, model_path)
    print("Saved model:", model_path)

    results.append((name, accuracy, auc))

print("\nSummary")
for name, accuracy, auc in results:
    print(f"{name}: accuracy={accuracy:.4f}, ROC-AUC={auc:.4f}")

print("\nBaseline training completed.")