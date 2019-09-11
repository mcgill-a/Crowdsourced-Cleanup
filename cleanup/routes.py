from flask_wtf import FlaskForm
from flask_wtf.file import FileField
from flask_pymongo import PyMongo
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
from .forms import SignupForm, LoginForm


@app.route('/', methods=['GET'])
def index():
	return render_template('index.html')

@app.route('/login', methods=['POST', 'GET'])
def login():
	if session.get('logged_in'):
		#output = "You are already logged in as " + session.get('email')
		#flash(output, 'warning')
		return redirect(url_for('index'))
	
	ip = request.environ['REMOTE_ADDR']
	form = LoginForm(request.form)
	if request.method =='POST' and form.validate():
		email = form.email.data
		password_entered = form.password.data

		result = users.find_one({'email' : re.compile(email, re.IGNORECASE)})

		if result is not None:
			if (bcrypt.checkpw(password_entered.encode('utf-8'), result['password'])):
		#	if (bcrypt.checkpw(password_entered, result['password'])):

				session['logged_in'] = True
				session['email'] = result.get('email')
				session['id'] = str(result.get('_id'))
				session['fullname'] = result.get('first_name') + " " + result.get('last_name')
				#flash('You are now logged in', 'success')
				return redirect(url_for('index'))
				
			else:
				print("Failed login attempt |", email, "| IP:", ip)
				error = "wrong_password"
				return render_template('login.html', form=form, error=error)
		else:
			error = "wrong_email"
			return render_template('login.html', form=form, error=error)
	return render_template('login.html', form=form)


@app.route('/signup', methods=['POST', 'GET'])
def signup():
	if session.get('logged_in'):
		#output = "You are already logged in as " + session.get('email')
		#flash(output, 'warning')
		return redirect(url_for('index'))
	
	form = SignupForm(request.form)
	if request.method == 'POST' and form.validate():
		# Set the user inputs
		# Force only the initial character in first name to be capitalised
		first_name = (form.firstname.data.lower()).capitalize()
		
		# Make sure the first letter is capitalised. Don't care about capitalisation on the rest
		last_name = form.lastname.data
		last_name_first_letter = last_name[0].capitalize()
		last_name_remaining_letters = last_name[1:]
		last_name = last_name_first_letter + last_name_remaining_letters

		email = form.email.data
		# Set the default inputs
		current_datetime = datetime.datetime.now()
		ip = request.environ['REMOTE_ADDR']
		account_level = 0

		# Check if the email address already exists
		existing_user = users.find_one({'email' : re.compile(email, re.IGNORECASE)})

		if existing_user is not None:
			flash('Account already exists', 'danger')
			return render_template('signup.html', form=form)
		if existing_user is None:
			hashpass = bcrypt.hashpw(request.form['password'].encode('utf-8'), bcrypt.gensalt())
			users.insert({
				'first_name' : first_name,
				'last_name' : last_name,
				'email' : email,
				'password' : hashpass,
				'created' : current_datetime,
				'last_updated' : current_datetime,
				'last_seen' : current_datetime,
				'last_ip' : ip,
				'account_level' : account_level,
			})

			# Retrieve the ID of the newly created user
			new_user = users.find_one({'email' : re.compile(email, re.IGNORECASE)})
			user_id = new_user['_id']

			print("INFO: New user has been created with email", email)
			flash('Account registered', 'success')
			return redirect(url_for('login'))
	else:
		return render_template('signup.html', form=form)


# Redirect logged out users with error message
def is_logged_in(f):
	@wraps(f)
	def wrap(*args, **kwargs):
		if 'logged_in' in session:
			return f(*args, **kwargs)
		else:
			flash('Access restricted. Please login first', 'danger')
			return redirect(url_for('login'))
	return wrap


@app.route('/logout')
def logout():
	if session.get('logged_in'):
		session.clear()
		#flash('You are now logged out', 'success')
		return redirect(url_for('index'))
	else:
		session.clear()
		return redirect(url_for('login'))