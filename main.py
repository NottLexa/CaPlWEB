#!/usr/bin/env python3.11

from flask import Flask, render_template, request, redirect
#from orm import db_session
#import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'abcdef35q3pou9ihmglg7tjcdkoiy2ug'

@app.errorhandler(404)
def e404(error):
    return render_template('404.html'), error.code

@app.route('/')
@app.route('/index')
def page_index():
    return render_template('index.html')

@app.route('/api')
def capl_api():
    file = request.args.get('request', type = str, default = None)
    match file:
        case 'vi':
            with open('static/capl/version_info.json') as f: return f.read()
        case _:
            return 'false'

def main():
    app.run(port=80, host='127.0.0.1')

if __name__ == '__main__':
    main()