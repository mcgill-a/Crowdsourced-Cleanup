from flask_wtf import FlaskForm
from flask_wtf.file import FileField
import os, json, copy, bcrypt
import base64
import colour
from os.path import join
from flask import Flask, render_template, request, redirect, jsonify, session, abort, flash, url_for
from cleanup import app, login_manager
from operator import itemgetter
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from PIL import Image, ExifTags
from datetime import datetime, date
import time
import re
from json import dumps
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer


@app.route('/', methods=['GET'])
def index():
	return render_template('index.html')