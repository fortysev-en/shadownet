FROM python:3.11

ENV PYTHONUNBUFFERED=1

WORKDIR /backend
COPY requirements.txt requirements.txt
COPY ./entrypoint.sh .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
COPY . .

ENTRYPOINT [ "sh", "entrypoint.sh" ]