import os
import re
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


dataset = os.path.join(os.path.dirname(__file__), 'dataset.csv')
data = pd.read_csv(dataset, encoding='latin1', usecols=[0,1,2,3], header=0)

data['label'] = (
    data['label']
    .astype(str)
    .str.lower()
    .str.strip()
    .replace({'non_educational': 'non-educational'})
)

data = data[data['label'] != 'label']

data['combined_text'] = (
    data['text'].astype(str) + ' ' +
    data['keywords'].astype(str) + ' ' +
    data['category'].astype(str)
)

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z ]', ' ', text)
    return text

data['updated_text'] = data['combined_text'].apply(clean_text)

X_text = data['updated_text']
y = data['label']

vectorizer = TfidfVectorizer(
    max_features=1500,
    min_df=3,
    max_df=0.85,
    ngram_range=(1,2)
)

X_tfidf = vectorizer.fit_transform(X_text)

selector = SelectKBest(chi2, k=800)
X_selected = selector.fit_transform(X_tfidf, y)

X_train, X_test, y_train, y_test = train_test_split(
    X_selected,
    y,
    test_size=0.3,
    stratify=y,
    random_state=42
)

model = LogisticRegression(
    C=0.5,
    penalty='l2',
    max_iter=1000
)

cv_scores = cross_val_score(model, X_selected, y, cv=5)
print("CV Accuracy:", cv_scores.mean())

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred))

joblib.dump(model, 'lr_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')
joblib.dump(selector, 'chi_selector.pkl')
