FROM python:alpine3.19

WORKDIR /app
ADD . /app

RUN pip install -r requirements.txt

EXPOSE 5000
CMD ["python","main.py"]