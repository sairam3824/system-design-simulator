
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# build-essential is needed for compiling some python packages if wheels aren't valid
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade pip and install dependencies with a higher timeout to prevent network flakes
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt --timeout 100 && \
    python -m spacy download en_core_web_sm

COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
