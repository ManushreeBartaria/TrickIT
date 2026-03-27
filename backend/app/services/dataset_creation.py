from app.database.connections import engine
import pandas as pd

def create_dataset_from_posts(output_file: str):

    query = """
    SELECT 
        content AS text,
        status AS label
    FROM posts
    WHERE status IN ('approved','rejected')
    ORDER BY id DESC
    """

    df = pd.read_sql(query, engine)

    df['label'] = df['label'].replace({
        'approved': 'educational',
        'rejected': 'non-educational'
    })

    df.to_csv(output_file, index=False)

    print(f"Dataset created successfully at {output_file}")