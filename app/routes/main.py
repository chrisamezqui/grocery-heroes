from flask import Blueprint, render_template, request, redirect, url_for, jsonify
from app.extensions import db
from app.models import User

main = Blueprint('main', __name__)

@main.route('/', methods=['GET', 'POST'])
def index():
    return render_template('home.html')

@main.route('/helper')
def helper():
    local_helpees = User.query\
        .filter(User.longitude != None)\
        .filter(User.latitude != None)\
        .all()

    context = {
        'local_helpees' : local_helpees
    }

    return render_template('helper.html', **context)

@main.route('/helpee', methods=['GET', 'POST'])
def helpee():
    if request.method == 'POST':
        phone = request.form['phone']
        longitude = int(request.form['longitude'])
        latitude = int(request.form['latitude'])

        new_helpee = User(
            phone=phone,
            longitude=longitude,
            latitude=latitude
        )

        db.session.add(new_helpee)
        db.session.commit()

    return render_template('helpee.html')

##REST API FOR ADMIN##
@main.route('/admin/<string:phone>', methods=['GET', 'DELETE'])
def mod_db(phone):
    user = User.query.filter_by(phone=phone).first()
    if user is None:
        return 'No such number in database'
    if request.method == 'DELETE':
        db.session.delete(user)
        db.session.commit()
    json = jsonify(
            id=user.id,
            phone=user.phone,
            longitude=user.longitude,
            latitude=user.latitude
            )
    return json
