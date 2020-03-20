from .extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(50), nullable=False)
    longitude = db.Column(db.Integer)
    latitude = db.Column(db.Integer)
