from .extensions import db

#latitude and longitude should function as primary keys
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    longitude = db.Column(db.Float, primary_key=True)
    latitude = db.Column(db.Float, primary_key=True)
    phone = db.Column(db.String(50), nullable=False)
