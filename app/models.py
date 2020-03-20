from flask_login import UserMixin
from werkzeug.security import generate_password_hash

from .extensions import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    volunteer = db.Column(db.Boolean, nullable=False)
    recipient = db.Column(db.Boolean, nullable=False)

    # @property
    # def unhashed_password(self):
    #     raise AttributeError('Cannot view unhashed password!')
    #
    # @unhashed_password.setter
    # def unhashed_password(self, unhashed_password):
    #     self.password = generate_password_hash(unhashed_password)

class Recipient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    longitude = db.Column(db.Integer)
    latitude = db.Column(db.Integer)
