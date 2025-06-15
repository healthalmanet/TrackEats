import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_PATH = os.path.join(BASE_DIR, 'data', 'indian_dishes_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'ml_diet', 'model.pkl')


def train_model():
    df = pd.read_csv(DATASET_PATH)

    # Features to train on (based on your dataset columns)
    features = df[['Calories', 'Protein', 'Carbs', 'Fats', 'Fiber']]
    labels = df['Goal']  # weight loss, maintenance, weight gain

    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"✅ Model saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train_model()
