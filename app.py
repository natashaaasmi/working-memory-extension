import flask
from flask import Flask, jsonify, request, Response, send_from_directory
from openai import OpenAI 
from flask_cors import CORS
import os

client = OpenAI()

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type', 'Access-Control-Allow-Origin'
CORS(app)
PORT = int(os.environ.get('PORT', 8000))

@app.before_request # this is what worked
def basic_auth():
    if request.method.lower()=='options':
        return Response()
    
@app.after_request
def add_cors_headers(response):
    # Replace 'https://example.com' with the actual allowed origin
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# default route
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/add_image")
def add_image():
    return "Image added"

@app.route("/define", methods = ['POST'])
def define():
    if request.method == 'POST':
        input = request.json['input'].replace(" ", "")
        context = request.json['context'].replace(" ", "")
        system = f"""
            You are a computer program built to define any word at the reading level of the user: undergraduate. From this paragraph {input}, ask yourself which three words is the user least likely to know? Your job is to define all three of those words. Return a list of words and definitions following this JSON format: 
            {{
            "type":"definitions",
            "context":{context},
            "words":[
            {{"word": "word goes here", "definition": "definition goes here"}},
            ]
            }}
            
        """
        system_message = {
            "role":"system",
            "content":system
        }
        messages = [system_message]
        definitions = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=False,
            response_format={"type":"json_object"}
        )
        resp = definitions.choices[0].message.content
        print(f'Resp: {resp}, of type {type(resp)}')
        response = jsonify({'message':resp})
        # response = jsonify({'message':'hey there'})

    return response

@app.route("/summarize", methods=['GET','POST'])
def summarize():
    if request.method == 'GET':
        return PORT
    elif request.method == 'POST':
        input = request.json['input'].replace(" ", "")
        print(input)
        print(type(input))
        system = f"""
            You are a helpful assistant imitating the author of this text, and writing in the first person: {input}. Your job is to break down the text you've written back into its rough outline of important points. Recap the important points from the text in the author's voice. 
            Look out for concepts that the reader might want to learn more about. For each such concept, add an underscore to the end of that word like this: 'Archaeology developed out of antiquarianism_ in Europe during the 19th century'.
            When writing bullet points, instead of saying 'The text says...' or 'The author highlights..., just say the point. Remember, you're imitating the author, not acting as an outside observer. Do not speak about yourself in the third person! 

            ###
            Good summary: 'The sky is blue'
            
            Bad summary: 'The author says the sky is blue'
            Bad summary: 'The text provides an explanation of why the sky is blue'
            Bad summary: 'He highlights that the sky is blue'

            Good title: 'Jugurtha's early life'
            Bad title: 'Summary of Jugurtha's early life
            ###

            Return your recap following this JSON format:
            {{
            "type": "summary",
            "title":"Topic of this summary",
            "summary": [
                {{"point":"put your point here"}},
            ]
            }}
            
        """
        system_message = {
            "role":"system",
            "content":system
        }
        messages = [system_message]
        definitions = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=False,
            response_format={"type":"json_object"}
        )
        resp = definitions.choices[0].message.content
        print(f'Resp: {resp}, of type {type(resp)}')
        response = jsonify({'message':resp})
        # response = jsonify({'message':'hey there'})
        if response == None:
            response = jsonify({'message':'No response'})

    return response

@app.route("/getthepoint", methods=['POST'])
def getthepoint():
    if request.method == 'POST':
        print("Input: ", request.json['input'])
        print("Type of input: ", type(request.json['input']))
        input = request.json['input'].replace(" ", "")
        if len(input) > 1000:
            input = split_text(input)[0]
            print(input)
            # To do that, they first need to understand what the point of the text is, and what the implications are for what they want to learn.
        system = f"""
            You are a helpful assistant aiming to help the user understand what they read faster. Given the following text {input}, summarize it. Return a concise explanation of the text following this JSON format:
            {{
            "type": "getthepoint",
            "summary": "summary goes here"
            }}
            
        """
        system_message = {
            "role":"system",
            "content":system
        }
        messages = [system_message]
        definitions = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=False,
            response_format={"type":"json_object"}
        )
        resp = definitions.choices[0].message.content
        print(f'Resp: {resp}, of type {type(resp)}')
        response = jsonify({'message':resp})
        # response = jsonify({'message':'hey there'})
        if response == None:
            response = jsonify({'message':'No response'})

    return response

@app.route('/quiz', methods=['POST'])
def quiz():
    # generate a quiz from the information
    if (request.method == 'POST'):
        print(request.json['input'])
        print(request.json['previousQuizzes'])
        input = request.json['input'].replace(" ", "")
        previous_quizzes = request.json['previousQuizzes']
        print(f'Input: {input}, Previous quizzes: {previous_quizzes}')
        system = f"""
            You are a helpful assistant that generates quizzes that helps reader to engage with what they just read. Given a text, pay attention to the portions that are likely to be important or interesting to the reader when learning about the topic as a whole, rather than fun facts or trivia. Generate a difficult question with a single answer that helps the reader engage with one of those portions. When generating questions, make sure you're asking about things you haven't asked about before.
            
            For example, you can ask them what a certain word means, ask them why a certain phenomenon happens, or what the definition of a particular concept is. If you are dealing with a technical text, make sure to ask precise technical questions. 

            Make sure to phrase the question and answer in a way that reader will be able to use it as a spaced repetition flashcard outside the context of the specific text, even after months have passed. 

            Text: {input}
            Previous quizzes: {previous_quizzes}

            Return a list of questions and answers following this JSON format:
            {{
                "type": "quiz",
                "question": "question goes here",
                "answer": "answer goes here",
            }}
        """
        system_message = {
            "role":"system",
            "content":system
        }
        messages = [system_message]
        try:
            quiz = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                stream=False,
                response_format={"type":"json_object"}
            )
            resp = quiz.choices[0].message.content
            print(f'Resp: {resp}, of type {type(resp)}')
            response = jsonify({'message':resp})
            if response == None:
                response = jsonify({'message':'No response'})
        except Exception as e:
            response = jsonify({'message': 'No response', 'error': str(e)})
    return response

@app.route('/ask_gpt', methods=['POST'])
def ask_gpt():
    if (request.method == 'POST'):
        input = request.json['input'].replace(" ", "")
        context = request.json['context'].replace(" ", "")
        print(f"Input: {input}, Context: {context}")
        system = f"""
            You are a text assistant meant to answer the user's in-depth questions about a topic using specific references from the text: {context}. Return an answer to the user's question {input} following this JSON format: 
            {{
                "type":"askgpt",
                "answer":"Your answer goes here"
            }}
        """
        system_message = {
            "role":"system",
            "content": system
        }
        messages = [system_message]
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages = messages,
            stream=False,
            response_format = {"type":"json_object"} 
        )
        response = resp.choices[0].message.content
        print("Response: ", response)
        json_response = jsonify({"message":response})
    return json_response

@app.route('/more_resources', methods=['POST'])
def more_resources():
    if (request.method == "POST"):
        input = request.json['input'].replace(" ", "")
        system = f"""
            Given this text {input} that the user is reading, recommend more resources for them in the form of valid links that they can click on. Aim for things that are interesting and allow them to dig deeper into the topic. Return each link following this JSON format: 
            {{
                "type":"links",
                "links": [
                    {{
                        "link":"link goes here", 
                        "text":"text for user to click on goes here"
                    }}
                ]
            }}
        """
    system_message = {
        "role":"system",
        "content":system
    }
    messages = [system_message]
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=False,
        response_format= {"type":"json_object"}
    )
    response = resp.choices[0].message.content
    print("Response: ")
    print(response)
    final_resp = jsonify({'message':response})
    return final_resp

@app.route('/simplify', methods=['POST'])
def simplify():
    if (request.method == "POST"):
        print("Input", request.json['input'])
        print("Type of input", type(request.json['input']))
        input = request.json['input'].replace(" ", "")
        system = f"""
            Given this text {input} that the user is reading, translate into simpler language that a 15 year old can understand. Make sure you're translating the content of the text, rather than summarizing what it's about. Return your answer following this JSON format: 
            {{
                "type":"simplify",
                "answer": "your answer goes here"
            }}
        """
    system_message = {
        "role":"system",
        "content":system
    }
    messages = [system_message]
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=False,
        response_format= {"type":"json_object"}
    )
    response = resp.choices[0].message.content
    print("Response: ")
    print(response)
    final_resp = jsonify({'message':response})
    return final_resp

def split_text(text,length=1000):
    '''Splits text into chunks of 1000 characters by default'''
    text_list = []
    temp_string = ""
    for char in text:
        temp_string += char
        if len(temp_string) > length:
            text_list.append(temp_string)
            temp_string = ""
            
    return text_list


if __name__ == '__main__':
    print("PORT: ", PORT)
    app.run(port=PORT,debug=True)
