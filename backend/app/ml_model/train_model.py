import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report,confusion_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import os
import spacy

dataset = os.path.join(os.path.dirname(__file__), 'dataset.csv')
data=pd.read_csv(dataset,encoding='latin1', usecols=[0,1,2,3], header=0)
print(data.head())

nlp=spacy.load('en_core_web_sm')
cleaned_texts_list=[]
cleaned_texts=""
data['combined_text']=data['text'].astype(str)+' '+data['keywords'].astype(str)+' '+data['category'].astype(str)
print(data['combined_text'].size)
for text in data['combined_text']:
    doc=nlp(text)
    tokens=[token.lemma_.lower() for token in doc if not token.is_stop and token.is_alpha]
    cleaned_texts=" ".join(tokens)
    cleaned_texts_list.append(cleaned_texts)
data['updated_text']=cleaned_texts_list     
print(data['updated_text'].head()) 
print(data['label'].unique())
data['label']=data['label'].astype(str).str.lower().str.strip()
data['label']=data['label'].replace({'non_educational':'non-educational'}) 
data=data[data['label'].astype(str).str.lower()!="label"]
print(data['label'].unique())

new_data=pd.DataFrame(data,columns=['updated_text','label'])      
vector=TfidfVectorizer(max_features=5000) 
vector_matrix=vector.fit_transform(new_data['updated_text'])

X_train, X_test, y_train, y_test = train_test_split(vector_matrix, new_data['label'], test_size=0.3, random_state=42)  

model=MultinomialNB()
model.fit(X_train,y_train)  
y_predicted=model.predict(X_test)

print("accuracy score=", accuracy_score(y_test,y_predicted))
print("confusion matrix", confusion_matrix(y_test,y_predicted))
print("classification_report",classification_report(y_test,y_predicted))

joblib.dump(model, os.path.join(os.path.dirname(__file__), 'model.pkl'))
joblib.dump(vector, os.path.join(os.path.dirname(__file__), 'vectorizer.pkl'))


    
          
           
