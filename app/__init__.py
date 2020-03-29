from flask import Flask

from .commands import create_tables
from .extensions import db
from .models import User
from .routes.main import main
from flask_socketio import SocketIO

socketio = None

def create_app(config_file='settings.py'):
    app = Flask(__name__)
    
    global socketio
    socketio = SocketIO(app)

    app.config.from_pyfile(config_file)

    db.init_app(app)

    app.register_blueprint(main)

    app.cli.add_command(create_tables)

    # return socketio
    return app
