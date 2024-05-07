FROM python:3.12.3-slim

WORKDIR /app
ADD . /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential cmake \
    git python3-dev && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000
CMD ["python","main.py"]