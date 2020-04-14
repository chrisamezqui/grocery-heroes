import os

SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
SECRET_KEY = os.environ.get('SECRET_KEY')
SQLALCHEMY_TRACK_MODIFICATIONS = False
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
SCRAMBLE_RADIUS_METERS = 200 #meters
SCRAMBLE_RADIUS = SCRAMBLE_RADIUS_METERS / 100000 #degrees
