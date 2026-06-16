"""
TF-IDF Vectorization module for resume and job description text comparison.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List, Tuple
import numpy as np
from utils.logger import get_logger

logger = get_logger(__name__)

# Singleton vectorizer instance
_vectorizer = None


def get_vectorizer() -> TfidfVectorizer:
    """Get or create the TF-IDF vectorizer."""
    global _vectorizer
    if _vectorizer is None:
        _vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95,
            sublinear_tf=True,
        )
    return _vectorizer


def vectorize_texts(texts: List[str]) -> np.ndarray:
    """
    Vectorize a list of texts using TF-IDF.

    Args:
        texts: List of text documents to vectorize.

    Returns:
        TF-IDF matrix as numpy array.
    """
    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95,
        sublinear_tf=True,
    )

    tfidf_matrix = vectorizer.fit_transform(texts)
    logger.info(f"Vectorized {len(texts)} documents, {tfidf_matrix.shape[1]} features")

    return tfidf_matrix


def vectorize_pair(text1: str, text2: str) -> Tuple[np.ndarray, np.ndarray]:
    """
    Vectorize two texts for comparison.

    Returns:
        Tuple of (vector1, vector2) as numpy arrays.
    """
    vectorizer = TfidfVectorizer(
        max_features=5000,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
    )

    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    return tfidf_matrix[0], tfidf_matrix[1]


def get_top_keywords(text: str, top_n: int = 20) -> List[Tuple[str, float]]:
    """
    Get the top N keywords from a text based on TF-IDF scores.

    Returns:
        List of (keyword, score) tuples.
    """
    vectorizer = TfidfVectorizer(
        max_features=1000,
        stop_words="english",
        ngram_range=(1, 2),
    )

    tfidf_matrix = vectorizer.fit_transform([text])
    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.toarray()[0]

    # Sort by score
    keyword_scores = list(zip(feature_names, scores))
    keyword_scores.sort(key=lambda x: x[1], reverse=True)

    return keyword_scores[:top_n]
