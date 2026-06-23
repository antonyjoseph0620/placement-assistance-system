"""
Prediction Service — scikit-learn based placement prediction.
Trains a RandomForestClassifier on student data and predicts placement outcomes.
"""

import logging
from typing import Optional, Dict
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

from models.student import StudentProfile

logger = logging.getLogger(__name__)

# Feature columns used for prediction
FEATURE_COLUMNS = [
    "cgpa", "tenth_percentage", "twelfth_percentage",
    "aptitude_score", "communication_score", "technical_score",
    "coding_score", "projects_completed", "internships",
    "certifications", "attendance", "backlogs",
]


class PredictionService:
    """Placement prediction using Random Forest classifier."""

    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.accuracy = 0.0
        self.feature_importances = {}

    def train(self, csv_path: str) -> bool:
        """
        Train the placement prediction model from CSV data.
        """
        try:
            logger.info(f"Loading training data from: {csv_path}")
            df = pd.read_csv(csv_path)

            # Validate required columns
            required_cols = FEATURE_COLUMNS + ["placed"]
            missing = [c for c in required_cols if c not in df.columns]
            if missing:
                logger.error(f"Missing columns in CSV: {missing}")
                return False

            # Prepare features and target
            X = df[FEATURE_COLUMNS].values
            y = df["placed"].values

            # Split for evaluation
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

            # Train Random Forest
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1,
            )
            self.model.fit(X_train, y_train)

            # Evaluate
            self.accuracy = self.model.score(X_test, y_test)
            logger.info(f"Model accuracy: {self.accuracy:.2%}")

            # Store feature importances
            importances = self.model.feature_importances_
            self.feature_importances = {
                name: round(float(imp), 4)
                for name, imp in zip(FEATURE_COLUMNS, importances)
            }
            logger.info(f"Feature importances: {self.feature_importances}")

            self.is_trained = True
            return True

        except Exception as e:
            logger.error(f"Training error: {e}")
            self.is_trained = False
            return False

    def predict(self, profile: StudentProfile) -> Dict:
        """
        Predict placement outcome for a student profile.
        Returns prediction label, probability, and feature importance.
        """
        if not self.is_trained:
            return self._rule_based_prediction(profile)

        try:
            # Prepare feature vector
            features = np.array([[
                profile.cgpa,
                profile.tenth_percentage,
                profile.twelfth_percentage,
                profile.aptitude_score,
                profile.communication_score,
                profile.technical_score,
                profile.coding_score,
                profile.projects_completed,
                profile.internships,
                profile.certifications,
                profile.attendance,
                profile.backlogs,
            ]])

            # Predict
            prediction = self.model.predict(features)[0]
            probabilities = self.model.predict_proba(features)[0]

            # Get probability of positive class (placed)
            placed_prob = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])

            return {
                "prediction": "Placed" if prediction == 1 else "Not Placed",
                "probability": round(placed_prob, 4),
                "feature_importance": self.feature_importances,
            }

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return self._rule_based_prediction(profile)

    def _rule_based_prediction(self, profile: StudentProfile) -> Dict:
        """
        Fallback rule-based prediction when ML model isn't available.
        Uses weighted scoring based on evaluation criteria.
        """
        score = 0.0
        max_score = 100.0

        # CGPA (20% weight)
        score += (profile.cgpa / 10) * 20

        # Academic scores (10% weight)
        score += (profile.tenth_percentage / 100) * 5
        score += (profile.twelfth_percentage / 100) * 5

        # Skill scores (30% weight)
        score += (profile.technical_score / 100) * 10
        score += (profile.coding_score / 100) * 10
        score += (profile.aptitude_score / 100) * 5
        score += (profile.communication_score / 100) * 5

        # Experience (20% weight)
        score += min(profile.projects_completed / 5, 1.0) * 8
        score += min(profile.internships / 2, 1.0) * 7
        score += min(profile.certifications / 3, 1.0) * 5

        # Attendance (5% weight)
        score += (profile.attendance / 100) * 5

        # Backlogs penalty (15% weight)
        backlog_penalty = min(profile.backlogs * 5, 15)
        score -= backlog_penalty

        probability = max(0, min(score / max_score, 1.0))
        prediction = "Placed" if probability >= 0.5 else "Not Placed"

        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "feature_importance": {
                "cgpa": 0.20,
                "technical_score": 0.15,
                "coding_score": 0.15,
                "projects_completed": 0.10,
                "internships": 0.10,
                "aptitude_score": 0.08,
                "communication_score": 0.07,
                "certifications": 0.05,
                "attendance": 0.05,
                "backlogs": 0.05,
            },
        }

    def format_prediction_result(self, result: Dict) -> str:
        """Format prediction result as readable string for LLM context."""
        return (
            f"Prediction: {result['prediction']}\n"
            f"Probability: {result['probability'] * 100:.1f}%"
        )


# Global singleton
prediction_service = PredictionService()
