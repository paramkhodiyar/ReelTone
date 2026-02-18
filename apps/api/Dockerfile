FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create directories for downloads and ringtones
RUN mkdir -p downloads ringtones

# Expose port
EXPOSE 8000

# Start the application
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
