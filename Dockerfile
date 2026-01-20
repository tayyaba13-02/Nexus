# Build Frontend
FROM node:20-slim AS build-stage
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final Stage
FROM python:3.10-slim
WORKDIR /app

# Install ffmpeg, curl, and Node.js
RUN apt-get update && apt-get install -y ffmpeg curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Deno as an alternative JS runtime for yt-dlp
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# Use the ABSOLUTE LATEST version of yt-dlp from GitHub to get latest anti-bot fixes
RUN pip install --no-cache-dir -U git+https://github.com/yt-dlp/yt-dlp.git

# Copy backend code
COPY backend/ ./

# Copy built frontend to backend static directory
RUN mkdir -p static
COPY --from=build-stage /frontend/dist ./static

# Expose the port Hugging Face expects
EXPOSE 7860

# Command to run the app
# We use host 0.0.0.0 and port 7860 as required by Hugging Face
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
