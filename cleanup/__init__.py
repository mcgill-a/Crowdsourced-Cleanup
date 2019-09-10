import os
from flask import Flask, session
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_login import LoginManager

app = Flask(__name__)
app.debug = True

# Load config file
app.config.from_pyfile("config/defaults.py")
# Setup server using config variables
app.secret_key = app.config['SECRET_KEY']

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

CORS(app)
socketio = SocketIO(app)

from cleanup import routes
