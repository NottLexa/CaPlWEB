from flask import Flask, render_template, request, redirect, send_file
import ntpath
import os
#from orm import db_session
import json
import base64
import subprocess

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
        with open(script_dir+'/static/capl/version_info.json') as f:
            return f.read()
    elif req in ['user_settings']:
        with open(script_dir+'/static/capl/settings.json') as f:
            return f.read()
    elif req in ['localization', 'locstrings']:
        with open(script_dir+'/static/capl/core/localization.json') as f:
            return f.read()
    elif req in ['sprite']:
        if file is not None and file.count('..') == 0:
            if ntpath.isfile(script_dir+'/static/capl/core/sprites/'+file):
                with open(script_dir+'/static/capl/core/sprites/'+file, 'rb') as f:
                    return base64.b64encode(f.read())
            else:
                return 'false'
        else:
            return 'false'
    elif req in ['sprites_list']:
        if file is not None and file.count('..') == 0:
            dir = script_dir+'/static/capl/core/sprites/'+(subfolder if subfolder is not None else '')
            if ntpath.isdir(dir):
                return json.dumps([{'type':'dir', 'name':x}
                                   if ntpath.isdir(dir+'/'+x)
                                   else {'type':'file', 'name':x}
                                   for x in os.listdir(dir)])
            else:
                return 'false'
        else:
            return 'false'
    elif req in ['get_corecontent_folder']:
        path = script_dir+'/static/capl/core/corecontent'
        return json.dumps(os.listdir(path))
    elif req in ['get_corecontent_file']:
        if file is not None and file.count('..') == 0:
            if ntpath.isfile(script_dir+'/static/capl/core/corecontent/'+file):
                if file.endswith('.png'):
                    with open(script_dir+'/static/capl/core/corecontent/'+file, 'rb') as f:
                        return base64.b64encode(f.read())
                else:
                    with open(script_dir+'/static/capl/core/corecontent/'+file) as f:
                        return f.read()
            else:
                return 'false'
        else:
            return 'false'
    elif req in ['compile_corecontent_cell']:
        if file is not None and file.count('..') == 0:
            path = script_dir+'/static/capl/core/corecontent/'+file
            if ntpath.isfile(path):
                popen_request = 'node '+script_dir+'/static/capl/cpl2json.js '+f'"{script_dir}/core/corecontent/{file}"'
                print(popen_request)
                return os.popen(popen_request).read()
            else:
                return 'false'
        else:
            return 'false'
    else:
        return 'false'

def main():
    app.run(port=80, host='127.0.0.1')

if __name__ == '__main__':
    main()