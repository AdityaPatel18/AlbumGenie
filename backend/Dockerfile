FROM python:3.9-slim
WORKDIR /app
RUN apt-get update && apt-get install -y \
    libopencv-dev \
    python3-opencv \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt tf-keras scikit-learn

COPY faceNetWeights.h5 .

COPY decode.py .
CMD ["uvicorn", "decode:app", "--host", "0.0.0.0", "--port", "8000"]