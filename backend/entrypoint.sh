#!/bin/sh

python manage.py wait_for_db
python manage.py makemigrations --no-input
python manage.py migrate --no-input --run-syncdb
python manage.py create_default_superuser
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
