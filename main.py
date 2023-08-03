from flask import Flask, render_template, request, redirect, send_file
import ntpath
import os
#from orm import db_session
import json

script_dir = ntpath.dirname(__file__)

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
    req = request.args.get('request', type = str, default = None)
    file = request.args.get('file', type = str, default = None)
    subfolder = request.args.get('subfolder', type = str, default = None)
    mime = request.args.get('mime', type = str, default = None)
    if req in ['vi', 'version_info']:
        with open(script_dir+'/'+'static/capl/version_info.json') as f: return f.read()
    if req in ['user_settings']:
        with open(script_dir+'/'+'static/capl/user_settings.json') as f: return f.read()
    if req in ['localization', 'locstrings']:
        with open(script_dir+'/'+'static/capl/core/localization.json') as f: return f.read()
    if req in ['sprites']:
        return send_file(script_dir+'/'+'static/capl/core/sprites/'+file, mimetype=mime)
    if req in ['sprites_lists']:
        dir = script_dir+'/'+'static/capl/core/sprites/'+(subfolder if subfolder is not None else '')
        return json.dumps({'results': os.listdir(dir)})
    else:
        return 'false'

def main():
    app.run(port=80, host='127.0.0.1')

if __name__ == '__main__':
    main()