from .extensions import db

#latitude and longitude should function as primary keys
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    phone = db.Column(db.String(50), nullable=False)
