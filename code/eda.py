import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import gdown


def run_eda(): 
    # Téléchargement direct depuis Google Drive
    file_id = "1GYfZaeIMuXiY5Gb7vbAlWpqmqlY7JN4N"  # Remplace par ton propre ID
    url = f"https://drive.google.com/uc?id={file_id}"

    # Lire directement dans pandas sans enregistrer localement
    df = pd.read_csv(gdown.download(url, output=None, quiet=False))

# -------------------------------
# Normalisation des titres de job
# -------------------------------
    def normalize_job_title(title):
        title = str(title).lower()
        if 'data engineer' in title:
            return 'Data Engineer'
        elif 'data scientist' in title:
            return 'Data Scientist'
        elif 'data analyst' in title:
            return 'Data Analyst'
        elif 'machine learning' in title:
            return 'ML Engineer'
        elif 'business analyst' in title:
            return 'Business Analyst'
        elif 'software engineer' in title:
            return 'Software Engineer'
        elif 'cloud engineer' in title:
            return 'Cloud Engineer'
        else:
            return 'Other'

    df['job_title_short'] = df['job_title_short'].apply(normalize_job_title)

# -------------------------------
# Bar chart pour job_title_short
# -------------------------------
    counts = df['job_title_short'].value_counts()
    total = counts.sum()
    percentages = (counts / total) * 100

    plt.figure(figsize=(12, 6))
    bars = plt.bar(counts.index, percentages)
    plt.title('Job Title Distribution (Exact Percentage)')
    plt.ylabel('Percentage (%)')
    plt.xlabel('Job Title')

    for bar, pct in zip(bars, percentages):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'{pct:.2f}%', ha='center', va='bottom')

    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('data/target_job_bar.png')
    plt.close()

# -------------------------------
# Pie chart pour job_title_short
# -------------------------------
    plt.figure(figsize=(10, 10))
    plt.pie(
    counts,
    labels=counts.index,
    autopct='%1.1f%%',
    startangle=90,
    labeldistance=1.15,
    pctdistance=0.75,
    explode=[0.03]*len(counts),
    wedgeprops={'edgecolor': 'white'}
)
    plt.title('Job Title Distribution')
    plt.tight_layout()
    plt.savefig('data/target_job_pie.png')
    plt.close()

# -------------------------------
# Analyse catégorielle
# -------------------------------
    plot_df = df.sample(n=min(50000, len(df)), random_state=42)
    cat_cols = ['job_via','job_schedule_type','job_country','company_name']

    n_rows = len(cat_cols)
    fig, axes = plt.subplots(n_rows, 1, figsize=(14, 5*n_rows))
    axes = axes.flatten()

    for i, feature in enumerate(cat_cols):
        top_values = plot_df[feature].value_counts().nlargest(10).index
        sns.countplot(
        x=feature,
        hue='job_title_short',
        data=plot_df[plot_df[feature].isin(top_values)],
        ax=axes[i],
        palette='muted'
    )
        axes[i].set_title(f'Jobs by {feature}', fontsize=14)
        axes[i].tick_params(axis='x', rotation=45)
        axes[i].legend(title='Job Title', bbox_to_anchor=(1.05, 1), loc='upper left')

    plt.tight_layout()
    plt.savefig('data/categorical_impact.png')
    plt.close()


    df_plot = df.drop(['salary_hour_avg','salary_year_avg','salary_rate','search_location'], axis=1)
    sns.pairplot(df_plot.sample(1000), hue='job_title_short', diag_kind='kde', palette='husl')
    plt.savefig('data/multivariate_pairplot.png')
    plt.close()


    print("EDA terminé ✅ Les figures sont dans le dossier data/.")



if __name__ == "__main__":
    run_eda()
