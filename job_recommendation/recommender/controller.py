import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

app = FastAPI()

# Global storage for recommendations
stored_recommendations = {
    "recommendations": [],
    "metadata": {}
}

# Define the data schema
class DataRow(BaseModel):
    """Schema for individual rows in the webhook payload"""
    pass  # Add your fields here

class WebhookPayload(BaseModel):
    """Schema for webhook data"""
    data: List[Dict[str, Any]]

def receive_df_from_webhook(payload: WebhookPayload) -> pd.DataFrame:
    """
    Convert webhook payload to a pandas DataFrame.
    
    Parameters:
    -----------
    payload : WebhookPayload
        The webhook data payload
        
    Returns:
    --------
    pd.DataFrame
        DataFrame created from webhook data
    """
    try:
        df = pd.DataFrame(payload.data)
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error converting to DataFrame: {str(e)}")

# FastAPI endpoint
@app.post("/webhook/dataframe")
async def webhook_endpoint(payload: WebhookPayload) -> dict:
    """
    Receive data from webhook and convert to DataFrame.
    
    Expected JSON format:
    {
        "data": [
            {"column1": value1, "column2": value2},
            {"column1": value3, "column2": value4}
        ]
    }
    """
    df = receive_df_from_webhook(payload)
    
    return {
        "status": "success",
        "rows_received": len(df),
        "columns": df.columns.tolist(),
        "shape": df.shape
    }

def send_data_to_file(df: pd.DataFrame, file_path: str, format: str = "json") -> bool:
    """
    Send/export DataFrame to another file in various formats.
    
    Parameters:
    -----------
    df : pd.DataFrame
        The DataFrame to export
    file_path : str
        Path where the file should be saved
    format : str
        File format - 'json', 'csv', 'excel', 'parquet', 'pickle'
        
    Returns:
    --------
    bool
        True if successful, False otherwise
    """
    try:
        if format.lower() == "json":
            df.to_json(file_path, orient="records", indent=2)
        elif format.lower() == "csv":
            df.to_csv(file_path, index=False)
        elif format.lower() == "excel":
            df.to_excel(file_path, index=False)
        elif format.lower() == "parquet":
            df.to_parquet(file_path, index=False)
        elif format.lower() == "pickle":
            df.to_pickle(file_path)
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        return True
    except Exception as e:
        print(f"Error sending data to file: {str(e)}")
        return False

@app.post("/send-data")
async def send_data_endpoint(payload: WebhookPayload, format: str = "json") -> dict:
    """
    Receive data and send it to a file.
    
    Query parameters:
    - format: 'json', 'csv', 'excel', 'parquet', 'pickle' (default: json)
    - filename: output filename (default: output.{format})
    """
    try:
        df = receive_df_from_webhook(payload)
        file_path = f"../data/output.{format}"
        
        success = send_data_to_file(df, file_path, format)
        
        if success:
            return {
                "status": "success",
                "message": f"Data sent to {file_path}",
                "rows": len(df),
                "format": format
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save data")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class ProfilePayload(BaseModel):
    """Schema for user profile data from webhook"""
    data: List[Dict[str, Any]]

def receive_profile_from_webhook(payload: ProfilePayload) -> pd.DataFrame:
    """
    Receive user profile data from webhook and convert to DataFrame.
    
    Parameters:
    -----------
    payload : ProfilePayload
        The profile data payload containing user information
        
    Returns:
    --------
    pd.DataFrame
        DataFrame with user profile data
    """
    try:
        profile_df = pd.DataFrame(payload.data)
        return profile_df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error converting profile to DataFrame: {str(e)}")

@app.post("/webhook/profile")
async def profile_webhook_endpoint(payload: ProfilePayload) -> dict:
    """
    Receive user profile data from webhook for job recommendations.
    
    Expected JSON format:
    {
        "data": [
            {"skill": "Python", "experience": 5, "desired_salary": 80000},
            {"skill": "JavaScript", "experience": 3, "desired_salary": 70000}
        ]
    }
    """
    profile_df = receive_profile_from_webhook(payload)
    
    return {
        "status": "success",
        "profile_rows": len(profile_df),
        "columns": profile_df.columns.tolist(),
        "dataframe": profile_df.to_dict(orient="records")  # Return actual DataFrame as JSON
    }

def get_job_recommendations(profile_df: pd.DataFrame, jobs_df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    """
    Generate job recommendations based on user profile and available jobs.
    
    Parameters:
    -----------
    profile_df : pd.DataFrame
        User profile with skills and experience
    jobs_df : pd.DataFrame  
        Available jobs with required skills
    top_n : int
        Number of top recommendations to return
        
    Returns:
    --------
    pd.DataFrame
        Ranked job recommendations with match scores
    """
    from difflib import SequenceMatcher
    import re
    
    def preprocess_skills(skills_list):
        if not isinstance(skills_list, list):
            return []
        normalized = []
        for skill in skills_list:
            skill = str(skill).lower().strip()
            skill = re.sub(r'[^a-z0-9\-\.]', '', skill)
            if skill:
                normalized.append(skill)
        return list(set(normalized))
    
    def calculate_skill_match_score(user_skills, job_skills):
        if not job_skills or not user_skills:
            return 0.0
        
        job_skills_set = set(preprocess_skills(job_skills))
        exact_matches = len(user_skills & job_skills_set)
        partial_matches = 0
        
        for user_skill in user_skills:
            for job_skill in job_skills_set:
                if user_skill not in job_skill and job_skill not in user_skill:
                    similarity = SequenceMatcher(None, user_skill, job_skill).ratio()
                    if similarity > 0.6:
                        partial_matches += 1
                        break
        
        total_score = (exact_matches * 0.8 + partial_matches * 0.4)
        max_possible = len(job_skills_set)
        return min(total_score / max_possible, 1.0) if max_possible > 0 else 0.0
    
    # Extract user skills
    user_skills = set(profile_df['skill'].astype(str).str.lower().tolist())
    user_skills = set(preprocess_skills(list(user_skills)))
    
    recommendations = []
    
    for idx, job in jobs_df.iterrows():
        job_skills = job['skills'] if isinstance(job['skills'], list) else []
        skill_score = calculate_skill_match_score(user_skills, job_skills)
        
        matched_skills = list(set(preprocess_skills(job_skills)) & user_skills)
        total_required = len(preprocess_skills(job_skills)) if job_skills else 1
        requirement_score = len(matched_skills) / total_required
        
        final_score = (skill_score * 0.6) + (requirement_score * 0.4)
        
        recommendations.append({
            'job_title': job['title'],
            'company': job['company'],
            'location': job['location'],
            'link': job['link'],
            'skills_matched': matched_skills,
            'skills_needed': preprocess_skills(job_skills),
            'match_score': round(final_score, 3)
        })
    
    recommendations_df = pd.DataFrame(recommendations).sort_values('match_score', ascending=False)
    return recommendations_df.head(top_n)

@app.post("/webhook/recommendations")
async def get_recommendations_endpoint(payload: ProfilePayload, top_n: int = 5) -> dict:
    """
    Get job recommendations for a user profile from webhook.
    
    Expected JSON format:
    {
        "data": [
            {"skill": "Python", "experience_years": 5},
            {"skill": "Data Analysis", "experience_years": 4}
        ]
    }
    """
    try:
        profile_df = receive_profile_from_webhook(payload)
        jobs_df = pd.read_json('../job_scrapper/jobs.json')
        
        recommendations = get_job_recommendations(profile_df, jobs_df, top_n)
        
        return {
            "status": "success",
            "recommendations_count": len(recommendations),
            "recommendations": recommendations.to_dict(orient="records"),
            "top_match": {
                "job_title": recommendations.iloc[0]['job_title'] if len(recommendations) > 0 else None,
                "match_score": float(recommendations.iloc[0]['match_score']) if len(recommendations) > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating recommendations: {str(e)}")

def send_recommendations_to_controller(recommendations_list: List[Dict[str, Any]]) -> dict:
    """
    Store recommendations in controller memory for webhook retrieval.
    
    Parameters:
    -----------
    recommendations_list : List[Dict]
        List of recommendation dictionaries from notebook
        
    Returns:
    --------
    dict
        Confirmation with status
    """
    global stored_recommendations
    
    try:
        stored_recommendations["recommendations"] = recommendations_list
        stored_recommendations["metadata"] = {
            "count": len(recommendations_list),
            "timestamp": pd.Timestamp.now().isoformat(),
            "status": "ready"
        }
        
        return {
            "status": "success",
            "count": len(recommendations_list),
            "message": "Recommendations stored successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.get("/webhook/get-recommendations")
async def get_recommendations_webhook() -> dict:
    """
    Retrieve stored recommendations via webhook.
    
    Response:
    {
        "status": "success",
        "recommendations": [...],
        "metadata": {...}
    }
    """
    global stored_recommendations
    
    if not stored_recommendations["recommendations"]:
        raise HTTPException(status_code=404, detail="No recommendations available")
    
    return {
        "status": "success",
        "recommendations": stored_recommendations["recommendations"],
        "metadata": stored_recommendations["metadata"],
        "count": len(stored_recommendations["recommendations"])
    }

@app.post("/webhook/send-recommendations")
async def send_recommendations_response(client_url: str = None) -> dict:
    """
    Send recommendations via webhook to a client URL.
    
    Parameters:
    -----------
    client_url : str (query param)
        Optional webhook URL to send recommendations to
        
    Response:
    {
        "status": "success",
        "recommendations_sent": count,
        "target": client_url
    }
    """
    global stored_recommendations
    
    if not stored_recommendations["recommendations"]:
        raise HTTPException(status_code=404, detail="No recommendations to send")
    
    # If client_url provided, you could forward to it here
    # For now, just confirm the recommendations are available
    
    return {
        "status": "success",
        "recommendations_sent": len(stored_recommendations["recommendations"]),
        "recommendations": stored_recommendations["recommendations"],
        "target": client_url or "GET /webhook/get-recommendations",
        "metadata": stored_recommendations["metadata"]
    }