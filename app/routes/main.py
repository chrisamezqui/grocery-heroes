from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from app.extensions import db
from app.models import User
from app.settings import *
from sqlalchemy import and_
import math
from random import uniform

main = Blueprint('main', __name__)

@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('home.html'), 200

@main.route('/helpee', methods=['GET', 'POST'])
def helpee():
    if request.method == 'POST':
        phone = request.form['phone']
        longitude = float(request.form['longitude'])
        latitude = float(request.form['latitude'])

        #scramble coordinates
        theta = uniform(-math.pi, math.pi)
        length = uniform(0, SCRAMBLE_RADIUS)
        longitude += math.sin(theta) * length
        latitude += math.cos(theta) * length

        #avoid exact duplicates in the database
        user = User.query.filter(and_(User.longitude==longitude, User.latitude==latitude, User.phone==phone)).first()
        if user is not None:
            return jsonify(success=False)

        new_helpee = User(
            phone=phone,
            longitude=longitude,
            latitude=latitude
        )

        db.session.add(new_helpee)
        db.session.commit()

        return jsonify(success=True), 200

    return render_template('helpee.html'), 200

@main.route('/helper', methods=['GET', 'DELETE'])
def helper():
    if request.method == 'DELETE':
        longitude = float(request.form['longitude'])
        latitude = float(request.form['latitude'])
        phone = request.form['phone']

        user = User.query.filter(and_(User.longitude==longitude, User.latitude==latitude, User.phone==phone)).first()
        print(request.form, user)
        if user is not None:
            db.session.delete(user)
            db.session.commit()

        return jsonify(success=True), 200

    context = {
        'gmapi_key' : GOOGLE_MAPS_API_KEY
    }
    return render_template('helper.html', **context)

@main.route('/requests', methods=['GET'])
def requests():
    local_requests = User.query\
        .filter(User.longitude != None)\
        .filter(User.latitude != None)\
        .all()

    formatted_requests = [{'longitude' : request.longitude, 'latitude' : request.latitude, 'phone': request.phone} for request in local_requests]
    return jsonify(localRequests=formatted_requests), 200
