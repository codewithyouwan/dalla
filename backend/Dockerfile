FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5175:5175

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5175", "--reload"]