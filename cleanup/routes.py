from flask_wtf import FlaskForm
from flask_wtf.file import FileField
from flask_pymongo import PyMongo
import os, json, copy, bcrypt, re
import base64
import colour
from .sample_files import incidents
from os.path import join
from bson.objectid import ObjectId
from functools import wraps
from flask import Flask, render_template, request, redirect, jsonify, session, abort, flash, url_for
from cleanup import app, login_manager, users, images
from operator import itemgetter
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import configparser, logging, os, json, random, re, string, datetime, bcrypt, urllib, hashlib, bson, math
from PIL import Image, ExifTags
import time
import re
from json import dumps
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer
from .forms import SignupForm, LoginForm, UploadForm


@app.route('/', methods=['GET'])
def index():
	return render_template('index.html')


@app.route('/login', methods=['POST', 'GET'])
def login():
	if session.get('logged_in'):
		#output = "You are already logged in as " + session.get('email')
		#flash(output, 'warning')
		print(session.get('email') + " is already logged in")
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
				print(session.get('email') + " has logged in")
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

# Getting pin data for AJAX
@app.route('/pins', methods=['GET'])
def pins():
	# Find pin from given pin id in GET arguments
	pin_id = request.args.get('pin')
	data = images.find_one({'_id':pin_id});
	# If no pins can be found return 404
	if (data is None):
		return '404'
	return jsonify(data)

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

def get_img_metadata(imageFile, callback):
	# Get metadata form of image
	image = Image(imageFile)

	# Extract the location from image metadata
	latitude = image.gps_latitude
	longitude = image.gps_longitude
	datetime = image.datetime_original
	callback(latitude, longitude, datetime)

@app.route('/logout')
def logout():
	if session.get('logged_in'):
		session.clear()
		#flash('You are now logged out', 'success')
		return redirect(url_for('index'))
	else:
		session.clear()
		return redirect(url_for('login'))


@app.route('/upload/', methods=['POST', 'GET'])
@is_logged_in
def upload():
	current_user = None
	if session.get('logged_in'):
		current_user = users.find_one({'_id' : ObjectId(session.get('id'))})
	else:
		flash('Access restricted. Please login first', 'danger')
		return redirect(url_for('login'))
	
	upload_form = UploadForm()
	id = str(current_user['_id'])
	if id is not None and bson.objectid.ObjectId.is_valid(id):
		user = users.find_one({'_id' : ObjectId(id)})

		if str(current_user['_id']) == id:
			if request.method == 'POST' and upload_form.validate():
				
				# If a file was provided by the user then upload and store it
				# Then store the name of the new file in the user profile DB
				if upload_form.image.data:
					image = store_uploaded_image(upload_form.image.data, str(user['_id']))
				

				# Create incident dictionary				
				incident = {
					'uploader' : ObjectId(id),
					'image_before' : image_before,
					'image_after' : image_after,
					'status' : status,
					'lat' : lat,
					'lon' : lon,
					'date_created' : date_created,
					'value' : value,
					'cleaner' : cleaner,
					'incident_type' : incident_type
				}
				print(incident)
				content.insert(incident)

				flash("Image uploaded successfully", "success")
				return redirect('/')

			elif request.method == 'GET' and user is not None:
				upload_form.image.data = ""

			
			return render_template('upload.html', current_user=current_user, upload_form=upload_form, incidents=incidents)
		else:
			flash("Access restricted. You do not have permission to do that", 'danger')
			return redirect(url_for('index'))

	return redirect(url_for('index'))


def get_next_filename(picture_path):
	max = 0
	files = [f for f in os.listdir(picture_path) if os.path.isfile(f)]

	for f in files:
		f = os.path.splitext(f)[0]
		f_num = int(f)
		if f_num > max:
			max = f_num
	
	return max + 1


def extract_number(f):
    s = re.findall("\d+$",f)
    return (int(s[0]) if s else -1,f)


def store_uploaded_image(form_pic, profile_user_id):
	_, ext = os.path.splitext(form_pic.filename)
	picture_fn = profile_user_id

	picture_path = os.path.join(app.root_path, 'static','resources','user-content', profile_user_id)
	print(picture_path)
	print(" ")
	print(" ")
	if not os.path.exists(picture_path):
		os.makedirs(picture_path)

	print(" ")
	final_location = picture_path + '/' + str(get_next_filename(picture_path)) + ext
	print("FINAL LOCATION: " + final_location)
	print(" ")
	# Set the image width and height to reduce large image file sizes
	file_size = (200, 200)
	img = Image.open(form_pic)
	img.thumbnail(file_size)

	img.save(final_location)

	return final_location