from flask import Flask, jsonify, request, Response
from openai import OpenAI
from flask_cors import CORS

client = OpenAI()

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type', 'Access-Control-Allow-Origin'
CORS(app)

@app.before_request
def basic_auth():
    if request.method.lower() == 'options':
        return Response()
    
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route("/")
def index():
    return "<p>Hello</p>"

@app.route("/get_topics", methods=['POST'])
def get_topics():
    if request.method == 'POST':
        input = request.json['input'].replace(" ", "")
        topic = request.topic
        system = f"""
            For this topic {topic}, recommend 10 links for an undergrad to learn more about it. 
        """