from flask import Flask, render_template, request, redirect, send_file
import ntpath
import os
#from orm import db_session
import json
import base64
import subprocess

cache = {'compiled_cells':{}}

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

@app.route('/capl')
@app.route('/capl/index')
def page_capl_index():
    return render_template('capl/index.html')

@app.route('/capl/play')
def page_play():
    return render_template('capl/play.html')

@app.route('/capl/api')
def capl_api():
    req = request.args.get('request', type = str, default = None)
    file = request.args.get('file', type = str, default = None)
    subfolder = request.args.get('subfolder', type = str, default = None)
    mime = request.args.get('mime', type = str, default = None)
    name = request.args.get('name', type = str, default = None)
    addon = request.args.get('addon', type = str, default = None)

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
        if file is None or file.count('..') != 0:
            return 'false'
        if not ntpath.isfile(script_dir+'/static/capl/core/sprites/'+file):
            return 'false'
        with open(script_dir+'/static/capl/core/sprites/'+file, 'rb') as f:
            return base64.b64encode(f.read())

    elif req in ['sprites_list']:
        if subfolder is None or subfolder.count('..') != 0:
            return 'false'
        dir = script_dir+'/static/capl/core/sprites/'+(subfolder if subfolder is not None else '')
        if not ntpath.isdir(dir):
            return 'false'
        return json.dumps([{'type':'dir', 'name':x}
                           if ntpath.isdir(dir+'/'+x)
                           else {'type':'file', 'name':x}
                           for x in os.listdir(dir)])

    elif req in ['get_corecontent_folder']:
        return json.dumps(os.listdir(script_dir+'/static/capl/core/corecontent'))

    elif req in ['get_corecontent_file']:
        if file is None or file.count('..') != 0:
            return 'false'
        path = script_dir+'/static/capl/core/corecontent/'+file
        if not ntpath.isfile(path):
            return 'false'
        if file.endswith('.png'):
            with open(path, 'rb') as f:
                return base64.b64encode(f.read())
        else:
            with open(path+file) as f:
                return f.read()

    elif req in ['compile_corecontent_cell']:
        if file is None or file.count('..') != 0:
            return 'false'
        path = script_dir+'/static/capl/core/corecontent/'+file
        if not ntpath.isfile(path):
            return 'false'
        if file in cache['compiled_cells']:
            return cache['compiled_cells'][file]
        else:
            popen_request = 'node '+script_dir+'/static/capl/cpl2json.js '+f'"./core/corecontent/{file}"'
            popen_return = os.popen(popen_request).read()
            cache['compiled_cells'][file] = popen_return
            return popen_return

    elif req in ['addon_list']:
        return json.dumps(os.listdir(script_dir+'/static/capl/data/addons'))

    elif req in ['addon_folder']:
        if addon is None or addon.count('..') != 0:
            return 'false'
        path = script_dir+'/static/capl/data/addons/'+addon
        if not ntpath.isdir(path):
            return 'false'
        return json.dumps(os.listdir(path))

    elif req in ['compile_addon_cell']:
        if file is None or file.count('..') != 0:
            return 'false'
        if addon is None or addon.count('..') != 0:
            return 'false'
        fullname = addon+'/'+file
        path = script_dir+'/static/capl/data/addons/'+fullname
        if not ntpath.isfile(path):
            return 'false'
        if fullname in cache['compiled_cells']:
            return cache['compiled_cells'][fullname]
        else:
            popen_request = 'node '+script_dir+'/static/capl/cpl2json.js '+f'"./data/addons/{fullname}"'
            popen_return = os.popen(popen_request).read()
            cache['compiled_cells'][fullname] = popen_return
            return popen_return

    else:
        return 'false'

def main():
    app.run(port=80, host='127.0.0.1')

if __name__ == '__main__':
    main()