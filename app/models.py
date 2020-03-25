from .extensions import db

#latitude and longitude should function as primary keys.. maybe adjust this later. 
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(50), nullable=False)
    longitude = db.Column(db.Float)
    latitude = db.Column(db.Float)
