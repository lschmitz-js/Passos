FROM python:3.11-slim
WORKDIR /app

COPY collector/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY collector/collect.py ./collect.py

ENV PYTHONUNBUFFERED=1
CMD ["python", "collect.py", "--loop"]
