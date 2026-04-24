FROM python:3.11-slim

WORKDIR /app

COPY recommender/requirements.txt .
RUN pip install --no-cache-dir --timeout=300 -r requirements.txt

# Copy the recommender source + the scraped jobs dataset it reads at runtime
COPY recommender/ /app/
COPY job_scrapper/ /job_scrapper/

# service.py resolves JOBS_JSON_PATH as ``<recommender>/../job_scrapper/jobs.json``.
# With /app holding recommender/*.py and /job_scrapper next to it, that path
# resolves correctly inside the container.

EXPOSE 8001
CMD ["uvicorn", "controller:app", "--host", "0.0.0.0", "--port", "8001"]
