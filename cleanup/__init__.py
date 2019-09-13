import os
from flask import Flask, session
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from flask_bootstrap import Bootstrap

app = Flask(__name__)
app.debug = True

# Load config file
app.config.from_pyfile("config/defaults.py")
# Setup server using config variables
app.secret_key = app.config['SECRET_KEY']

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

bootstrap = Bootstrap(app)
CORS(app)
socketio = SocketIO(app)

# MongoDB
mongo = PyMongo(app)
print("MongoDB connected successfully")
users = mongo.db.users
content = mongo.db.content
feed = mongo.db.feed
totals = mongo.db.totals
reports = mongo.db.reports

from cleanup import routes
