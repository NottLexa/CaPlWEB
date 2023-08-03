(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
    Copyright © 2023 Alexey Kozhanov

    =====

    This file is part of Casual Playground.

    Casual Playground is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

    Casual Playground is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
Casual Playground. If not, see <https://www.gnu.org/licenses/>.
*/

//#region [IMPORT & INIT]
var platform, api_server, httpGetAsync, getapi;
var engine, comp, ccc, ents, fs, path, vi;
var version, dvlp_stage, dvlp_build;
var scale, WIDTH, HEIGHT, WIDTH2, HEIGHT2, canvas_element, display;
const init1 = async function ()
{
    platform = document.getElementById('script').hasAttribute('platform')
        ? document.getElementById('script').getAttribute('platform') : 'WEB';
    api_server = 'http://185.251.88.244/api';
    console.log('Platform: '+platform);
    httpGetAsync = async function(theUrl)
    {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.onload = ()=>{
                if (xhr.readyState === 4 && xhr.status === 200) resolve(xhr.response);
                else reject({status: xhr.status, statusText: xhr.statusText});
            }
            xhr.onerror = ()=>{reject({status: xhr.status, statusText: xhr.statusText})};
            xhr.open("GET", theUrl, true); // true for asynchronous
            xhr.send(null);
        });
    }
    getapi = async function(request, options={})
    {
        options.request = request;
        let options_array = [];
        Objects.keys(options).forEach((key)=>{options_array.push(key+'='+options[key])})
        return httpGetAsync(api_server+'?'+options_array.join('&'));
    };

    window.onerror = function(msg, url, linenumber)
    {
        alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
        if (platform === 'NODE') nw.Window.get().close();
        return true;
    }
    engine = require('./core/nle.cjs');
    comp = require('./core/compiler.cjs');
    ccc = require('./core/compiler_conclusions_cursors.cjs');
    ents = require('./core/entities/entities.cjs')
    if (platform === 'NODE')
    {
        fs = require('fs');
        path = require('path');
        try { vi = JSON.parse(fs.readFileSync('./version_info.json', {encoding: "utf8"})); }
        catch (err) {
            vi = {
                version_info: {
                    version: "Unknown Version",
                    stage: "Unknown Stage",
                    build: 0,
                },
                devtools: false,
            };
        }
        version = vi.version_info.version;
        dvlp_stage = vi.version_info.stage;
        dvlp_build = ''+vi.version_info.build;
        document.getElementById('window-name').innerText = `Casual Playground - ${dvlp_stage} ${version}`;
    }
    else
    {
        vi = {
            version_info: {
                version: "Unknown Version",
                stage: "Unknown Stage",
                build: 0,
            },
            devtools: false,
        };
        try {
            vi = JSON.parse(await getapi('vi'));
        }
        catch (err) {
            console.log(err.message);
        }
        version = vi.version_info.version;
        dvlp_stage = vi.version_info.stage;
        dvlp_build = ''+vi.version_info.build;
        document.title = `Casual Playground - ${dvlp_stage} ${version}`;
    }

    console.log('\n'+
        ' _____                       _    ______ _                                             _ \n' +
        '/  __ \\                     | |   | ___ \\ |                                           | |\n' +
        '| /  \\/ __ _ ___ _   _  __ _| |   | |_/ / | __ _ _   _  __ _ _ __ ___  _   _ _ __   __| |\n' +
        '| |    / _` / __| | | |/ _` | |   |  __/| |/ _` | | | |/ _` | \'__/ _ \\| | | | \'_ \\ / _` |\n' +
        '| \\__/\\ (_| \\__ \\ |_| | (_| | |   | |   | | (_| | |_| | (_| | | | (_) | |_| | | | | (_| |\n' +
        ' \\____/\\__,_|___/\\__,_|\\__,_|_|   \\_|   |_|\\__,_|\\__, |\\__, |_|  \\___/ \\__,_|_| |_|\\__,_|\n' +
        '                                                  __/ | __/ |                            \n' +
        '                                                 |___/ |___/                             \n' +
        'by:                                                                            version:  \n' +
        '  Alexey Kozhanov' +
        (' '.repeat(72-version.length-4-dvlp_build.length)) + `${version} [#${dvlp_build}]`    + '\n' +
        (' '.repeat(89-dvlp_stage.length))                  + dvlp_stage                       + '\n')

    scale = 100;
    WIDTH = 16*scale;
    HEIGHT = 9*scale;
    WIDTH2 = Math.floor(WIDTH/2);
    HEIGHT2 = Math.floor(HEIGHT/2);
    canvas_element = document.getElementById('CasualPlaygroundCanvas');
    display = new engine.Display(document, canvas_element, WIDTH, HEIGHT);
    if (platform === 'NODE')
    {
        var top_panel = document.getElementById('top_panel');
        var text_window = document.getElementById('text_window');
        var button_max = document.getElementById('button_max');
        display.resizeCanvas(engine.default_room, nw.Window.get().cWindow.width, nw.Window.get().cWindow.height);
        var resize_window1 = function (width, height)
        {
            display.resizeCanvas(gvars[0].current_room, width, height-top_panel.offsetHeight);
        };
        var resize_window2 = function ()
        {
            let [w, h] = [nw.Window.get().width, nw.Window.get().height];
            display.resizeCanvas(gvars[0].current_room, w, h-top_panel.offsetHeight);
            [w, h] = [nw.Window.get().cWindow.tabs[0].width, nw.Window.get().cWindow.tabs[0].height];
            display.resizeCanvas(gvars[0].current_room, w, h-top_panel.offsetHeight);
        };
        nw.Window.get().on
        (
            'resize',
            resize_window1
        );
        nw.Window.get().on
        (
            'restore',
            function()
            {
                resize_window2();
                button_max.onclick = function(){nw.Window.get().maximize()};
                button_max.children[0].style = 'text-shadow: initial; transform: translate(0)';
            }
        );
        nw.Window.get().on
        (
            'maximize',
            function()
            {
                resize_window2();
                button_max.onclick = function(){nw.Window.get().restore()};
                button_max.children[0].style = 'text-shadow: -4px 4px; transform: translate(2px, -2px)';
            }
        );
        nw.Window.get().resizeTo(Math.round(window.screen.width*3/4),
            Math.round(window.screen.height*3/4) + top_panel.offsetHeight);
        nw.Window.get().moveTo(Math.round(window.screen.width/8),
            Math.round(window.screen.height/8) - Math.round(top_panel.offsetHeight/2));
        nw.Window.get().show();
    }
};
//#endregion

//#region [LOADING FUNCTIONS]
var get_text_width, get_locstring, arraysEqual, roundRect, rgb_to_style, cut_string;
var load_modlist, load_mod, load_img, load_images;
const init2 = async function ()
{
    get_text_width = function(txt, font)
    {
        text_window.style.font = font;
        text_window.innerHTML = txt;
        return text_window.offsetWidth;
    };

    get_locstring = function(locstring_id)
    {
        let nodes = locstring_id.split('/');
        let pth = locstrings;
        for (let i=0; i<nodes.length; i++)
        {
            let dir = nodes[i];
            if (pth.hasOwnProperty(dir))
            {
                if (i === nodes.length-1)
                    return pth[dir].hasOwnProperty(loc)
                        ? pth[dir][loc]
                        : pth[dir].__noloc;
                else pth = pth[dir];
            }
            else return '';
        }
    }

    arraysEqual = function(a, b)
    {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    roundRect = function(ctx, x, y, width, height, radius, stroke = false)
    {
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
        }
        let half = stroke ? Math.round(ctx.lineWidth/2) : 0;
        ctx.beginPath();
        ctx.moveTo(x + radius.tl + half, y + half);
        ctx.lineTo(x + width - radius.tr - half, y + half);
        ctx.quadraticCurveTo(x + width - half, y + half,
            x + width - half, y + radius.tr + half);
        ctx.lineTo(x + width - half, y + height - radius.br - half);
        ctx.quadraticCurveTo(x + width - half, y + height - half,
            x + width - radius.br - half, y + height - half);
        ctx.lineTo(x + radius.bl + half, y + height - half);
        ctx.quadraticCurveTo(x + half, y + height - half,
            x + half, y + height - radius.bl - half);
        ctx.lineTo(x + half, y + radius.tl + half);
        ctx.quadraticCurveTo(x + half, y + half,
            x + radius.tl + half, y + half);
        ctx.closePath();
        if (stroke) ctx.stroke();
        else ctx.fill();
    };

    rgb_to_style = (r,g,b) => `rgb(${r}, ${g}, ${b})`;

    cut_string = function(string, font, upto)
    {
        if (get_text_width(string, font) <= upto) return string;

        let [left, right] = [0, string.length];
        let mid = 0;
        while (right-left !== 1)
        {
            mid = Math.floor((left+right)/2);
            let txt_slice = string.slice(0, Math.max(0, mid-3))+'...';
            if (get_text_width(txt_slice, font) > upto) right = mid;
            else left = mid;
        }
        return string.slice(0, Math.max(0, mid-3))+'...';
    };

    if (platform === 'NODE')
    {
        load_modlist = function(modsfolder)
        {
            return fs.readdirSync(modsfolder, {encoding: "utf8"})
                .filter(filepath => fs.lstatSync(path.join(modsfolder, filepath)).isDirectory());
        };
        load_mod = function(modfolder, mod_origin, official)
        {
            let mods = {};
            for (let filename of fs.readdirSync(modfolder, {encoding: "utf8"}))
            {
                let filepath = path.join(modfolder, filename);
                if (fs.lstatSync(filepath).isFile())
                {
                    if (filepath.slice(-4).toLowerCase() === '.cpl') {
                        let f = fs.readFileSync(filepath, {encoding: "utf8"});
                        let [moddata, concl, cur] = comp.get(f);
                        if (!ccc.correct_concl(concl)) {
                            logger.push([
                                comp.LoggerClass.ERROR,
                                new Date(),
                                `Couldn't load ${filepath}`,
                                `CasualPlayground Compiler encountered an error: ${concl.code}`,
                                concl.full_conclusion(),
                                cur.highlight(),
                                cur.string(),
                            ])
                        }
                        let modname = filename.slice(0, -4);
                        moddata.origin = mod_origin;
                        moddata.official = official;
                        let imgpath = filepath.slice(0, -4) + '.png';
                        if (fs.existsSync(imgpath) && fs.lstatSync(imgpath).isFile())
                        {
                            moddata.texture = new Image();
                            moddata.texture_ready = false;
                            moddata.texture.onload = function()
                            {
                                moddata.texture_ready = true;
                                gvars[0].update_board_fully = true;
                                gvars[0].update_objmenu = true;
                            };
                            moddata.texture.src = imgpath;
                        }
                        if (official) mods[modname] = moddata;
                        else mods[`${mod_origin}/${modname}`] = moddata;

                    }
                }
            }
            return mods;
        };
        load_img = function(path)
        {
            let img = new Image();
            img.src = path;
            return img;
        };
        load_images = function(folder, preload=false)
        {
            let loaded = {};
            for (let folder_element of fs.readdirSync(folder))
            {
                let element_path = path.join(folder, folder_element);
                let name = path.parse(folder_element).name;
                if (fs.lstatSync(element_path).isDirectory())
                    loaded[folder_element] = load_images(element_path, preload);
                else
                {
                    loaded[name] = load_img(element_path);
                    if (preload) loaded[name].onload = ()=>{};
                }
            }
            return loaded;
        };
    }
    else
    {
        load_modlist = ()=>{};
        load_mod = ()=>{};
        load_img = function(path)
        {
            let img = new Image();
            img.src = path;
            return img;
        }
        load_images = async function(folder, preload)
        {
            let loaded = {};
            for (let folder_element of JSON.parse(await getapi('sprites_list', {subfolder: folder})))
            {
                if (folder_element.type === 'dir')
                    loaded[folder_element.name] = load_images(await getapi('sprites_list',
                        {subfolder: folder+'%2F'+folder_element.name}), preload);
                else
                {
                    loaded[folder_element.name] = load_img(await getapi('sprite',
                        {file: folder+'%2F'+folder_element.name}));
                    if (preload) loaded[folder_element.name].onload = ()=>{};
                }
            }
            return loaded;
        }
    }
};
//#endregion

//#region [SETTINGS]
var user_settings, loc, locstrings, corefolder, modsfolder, sprites, gvars;

const init3 = async function ()
{
    if (platform === 'NODE')
    {
        user_settings = JSON.parse(fs.readFileSync('./settings.json', {encoding:"utf8"}));
        loc = user_settings.localization;
        locstrings = JSON.parse(fs.readFileSync('./core/localization.json', {encoding:"utf8"})).localization;

        corefolder = path.join('core', 'corecontent');
        modsfolder = path.join('data', 'addons');
        if (!fs.existsSync(corefolder)) fs.mkdirSync(corefolder);
        if (!fs.existsSync(modsfolder)) fs.mkdirSync(modsfolder);

        sprites = load_images('./core/sprites', true);
    }
    else
    {
        user_settings = JSON.parse(await getapi('user_settings'));
        loc = user_settings.localization;
        locstrings = JSON.parse(await getapi('localization'))

        sprites = await load_images('./core/sprites', true);
    }

    let fontsize = scale*2;
    gvars = [{'objdata':{}, // = {'grass':{CELLDATA}, 'dirt':{CELLDATA}, ...}
              'idlist':[], // = ['grass', 'dirt', ...]
              'logger':[],
              'board_width':32,
              'board_height':32,
              'linecolor_infield': [26, 26, 26],
              'linecolor_outfield': [102, 102, 102],
              'selection_color': [55, 55, 200],
              'cellbordersize': 0.125,
              'cell_fill_on_init': 'grass',
              'history_max_length': user_settings.history_max_length,
              'scale': scale,
              'WIDTH': WIDTH,
              'WIDTH2': WIDTH2,
              'HEIGHT': HEIGHT,
              'HEIGHT2': HEIGHT2,
              'fontsize': fontsize,
              'fontsize_bigger':  Math.floor(32*fontsize/scale),
              'fontsize_big':     Math.floor(24*fontsize/scale),
              'fontsize_default': Math.floor(16*fontsize/scale),
              'fontsize_small':   Math.floor(12*fontsize/scale),
              'fontsize_smaller': Math.floor( 8*fontsize/scale),
              'deltatime': 0.0,
              'prevtime': 0.0,
              'scroll_delta': 0.0,
              'update_board': false,
              'update_board_fully': false,
              'update_selection': false,
              'update_objmenu': false,
              'current_instrument': {'type': 'none'},
              'globalkeys': {},
              'mx': 0,
              'my': 0,
              'get_locstring': get_locstring,
              'display': display,
              'roundRect': roundRect,
              'rgb_to_style': rgb_to_style,
              'loc': loc,
              'cut_string': cut_string,
              'load_mod': load_mod,
              'load_modlist': load_modlist,
              'modsfolder': modsfolder,
              'get_text_width': get_text_width,
              'current_room': engine.default_room,
              'sprites': sprites,
              'arraysEqual': arraysEqual,
              'has_focus': false,
              'platform': platform,
              'document': document,
              'running': true,
              },
             {}];

    var idlist = gvars[0].idlist;
    var objdata = gvars[0].objdata;
    var logger = gvars[0].logger;

    let coremods;
    if (platform === 'NODE')
    {
        coremods = load_mod(corefolder, 'Casual Playground', 1);
    }
    idlist.push(...Object.keys(coremods));
    objdata = {...objdata, ...coremods};
    gvars[0].objdata = objdata;

    console.log(Object.keys(objdata));
    console.log(idlist);
    console.log(idlist.map((value, index) => [index, value]));
};
//#endregion

//#region [ROOMS]
const init4 = async function ()
{
    gvars[0].global_console = ents.EntGlobalConsole.create_instance(gvars);

    gvars[0].field_board = ents.EntFieldBoard.create_instance(gvars);
    gvars[0].field_sui = ents.EntFieldSUI.create_instance(gvars);
    gvars[0].field_sh = ents.EntFieldSH.create_instance(gvars);

    gvars[0].mm_intro = ents.EntMMIntro.create_instance(gvars);
    gvars[0].mm_bg = ents.EntMMBG.create_instance(gvars);
    gvars[0].mm_controller = ents.EntMMController.create_instance(gvars);
    gvars[0].mm_startmenu = ents.EntMMStartMenu.create_instance(gvars);

    gvars[0].room_field = new engine.Room([ents.EntGlobalConsole, ents.EntFieldBoard, ents.EntFieldSUI,
        ents.EntFieldSH]);
    gvars[0].room_mainmenu = new engine.Room([ents.EntGlobalConsole, ents.EntMMIntro, ents.EntMMController,
        ents.EntMMBG, ents.EntMMStartMenu, ents.EntMMButton]);
};
//#endregion

//#region [FINISHING UP]
const init5 = async function ()
{
    gvars[0].current_room = gvars[0].room_mainmenu;
    gvars[0].current_room.do_start();
    document.addEventListener('keydown', function(event)
    {
        gvars[0].current_room.do_kb_down(event);
        gvars[0].globalkeys[event.code] = true;
        switch (event.code)
        {
            case 'ShiftLeft':
            case 'ShiftRight':
                gvars[0].globalkeys.Shift = true;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                gvars[0].globalkeys.Ctrl = true;
                break;
            case 'AltLeft':
            case 'AltRight':
                gvars[0].globalkeys.Alt = true;
                break;
            case 'MetaLeft':
            case 'MetaRight':
                gvars[0].globalkeys.Meta = true;
                break;
        }
        if (vi.devtools && event.code === 'Enter' && event.altKey) nw.Window.get().showDevTools();
    });
    document.addEventListener('keyup', function(event)
    {
        gvars[0].current_room.do_kb_up(event);
        gvars[0].globalkeys[event.code] = false;
        switch (event.code)
        {
            case 'ShiftLeft':
            case 'ShiftRight':
                gvars[0].globalkeys.Shift = false;
                break;
            case 'ControlLeft':
            case 'ControlRight':
                gvars[0].globalkeys.Ctrl = false;
                break;
            case 'AltLeft':
            case 'AltRight':
                gvars[0].globalkeys.Alt = false;
                break;
            case 'MetaLeft':
            case 'MetaRight':
                gvars[0].globalkeys.Meta = false;
                break;
        }
    });
    canvas_element.addEventListener('mousemove', function(event)
    {
        gvars[0].mx = (event.offsetX-display.offset_x) * display.cw() / (display.sw()-(2*display.offset_x));
        gvars[0].my = (event.offsetY-display.offset_y) * display.ch() / (display.sh()-(2*display.offset_y));
        gvars[0].current_room.do_mouse_move();
    });
    canvas_element.addEventListener('mousedown', function(event)
    {
        switch (event.button)
        {
            case engine.LMB:
                gvars[0].globalkeys.LMB = true;
                break;
            case engine.RMB:
                gvars[0].globalkeys.RMB = true;
                break;
            case engine.MMB:
                gvars[0].globalkeys.MMB = true;
                break;
        }
        gvars[0].current_room.do_mouse_down(event.button);
    });
    canvas_element.addEventListener('mouseup', function(event)
    {
        switch (event.button)
        {
            case engine.LMB:
                gvars[0].globalkeys.LMB = false;
                break;
            case engine.RMB:
                gvars[0].globalkeys.RMB = false;
                break;
            case engine.MMB:
                gvars[0].globalkeys.MMB = false;
                break;
        }
        gvars[0].current_room.do_mouse_up(event.button);
    });
    canvas_element.addEventListener('wheel', function(event)
    {
        gvars[0].scroll_delta = event.deltaY;
        if (event.deltaY > 0) gvars[0].current_room.do_mouse_down(engine.WHEELDOWN);
        else gvars[0].current_room.do_mouse_down(engine.WHEELUP);
    });
};

const mainloop = async function (time)
{
    if (gvars[0].running)
    {
        gvars[0].deltatime = (time - gvars[0].prevtime)/1000;
        gvars[0].prevtime = time;
        gvars[0].has_focus = document.hasFocus();
        display.clear();
        gvars[0].current_room.do_step(display.buffer);
        display.render();
        window.requestAnimationFrame(mainloop);
    }
};
//#endregion

//#region [RUN]
const run = async function ()
{
    await init1();
    await init2();
    await init3();
    await init4();
    await init5();
    window.requestAnimationFrame(mainloop);
};
run();
//#endregion
},{"./core/compiler.cjs":3,"./core/compiler_conclusions_cursors.cjs":4,"./core/entities/entities.cjs":7,"./core/nle.cjs":17,"fs":18,"path":19}],2:[function(require,module,exports){
/*
    Copyright © 2023 Alexey Kozhanov

    =====

    This file is part of Casual Playground.

    Casual Playground is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

    Casual Playground is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
Casual Playground. If not, see <https://www.gnu.org/licenses/>.
*/

var parser_version = 1;

const copy = function(board, selection_array, idlist)
{
    let selection = selection_array;
    let selected_cells = [];
    let palette = [];
    let minx = board[0].length;
    let miny = board.length;
    for (let iy = 0; iy < board.length; iy++)
    {
        for (let ix = 0; ix < board[0].length; ix++)
        {
            if (selection[iy].get(ix))
            {
                minx = Math.min(ix, minx);
                miny = Math.min(iy, miny);
                let cellid = board[iy][ix].cellid;
                selected_cells.push([ix,iy,idlist[cellid]]);
                palette.push(idlist[cellid]);
            }
        }
    }
    if (selected_cells.length === 0) return [null, 'Selection is empty'];
    palette = Array.from(new Set(palette));
    let backpalette = {};
    for (let key in palette) backpalette[palette[key]] = key;
    let ret = parser_version+'|'+palette.join(',')+'|';
    for (let i=0; i < selected_cells.length; i++)
    {
        ret += [selected_cells[i][0]-minx, selected_cells[i][1]-miny,
            backpalette[selected_cells[i][2]]].join(',');
        if (i !== selected_cells.length-1) ret += ';';
    }
    return [ret, 'Successfully copied!'];
};

const paste = function(text, objdata)
{
    try
    {
        if (!text.includes('|')) return null;
        let paste_version = text.slice(0, text.indexOf('|'));
        if (isNaN(paste_version)) return null;
        paste_version = Number(paste_version);
        if (paste_version < paste_parsers.length) return paste_parsers[paste_version](text, objdata);
        return [null, 'Non existing copy-paste version'];
    }
    catch (err)
    {
        return [null, 'An unexpected error occurred while parsing: '+err.message]
    }
};

const paste1 = function(text, objdata)
{
    let ret = {};
    let parts = text.split('|');
    let palette = parts[1].split(',');
    for (let i of palette) if (!(i in objdata)) return [null, 'Some cells from clipboard are not loaded in this session'];
    let cells = parts[2].split(';');
    let w = 0;
    let h = 0;
    for (let cell of cells)
    {
        let [cx,cy,cd] = cell.split(',');
        if (!ret.hasOwnProperty(Number(cy))) ret[Number(cy)] = {};
        ret[Number(cy)][Number(cx)] = palette[Number(cd)];
        w = Math.max(Number(cx)+1, w);
        h = Math.max(Number(cy)+1, h);
    }
    return [{pastedata: ret, pastewidth: w, pasteheight: h}, 'Successfully pasted to the current instrument!'];
};

var paste_parsers = [()=>[null, 'Non existing copy-paste version'], paste1];

module.exports = {copy, paste};
},{}],3:[function(require,module,exports){
/*
    Copyright © 2023 Alexey Kozhanov

    =====

    This file is part of Casual Playground.

    Casual Playground is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

    Casual Playground is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
Casual Playground. If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require('fs');
const path = require('path');
//const desync = require('deasync');

//import * as CPLv1_0_0 from './compiler_versions/CPLv1.0.0/main.cjs';
const ccc = require('./compiler_conclusions_cursors.cjs');
const ctt = require('./compiler_task_types.cjs');
const csc = require('./compiler_string_constants.cjs');

const Globals = {
    REPLY_DEFAULT: 0,
};

const DEFAULT = {
    version: '1.0.0',
    type: 'CELL',
    name: 'Cell',
    desc: 'No description given.',
    notexture: [255, 255, 255],
    localization: {},
    script: {
        create: undefined,
        step: undefined,
    },
};

const LoggerClass = {
    types: ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    DEBUG: 0,
    INFO: 1,
    WARNING: 2,
    ERROR: 3,
    CRITICAL: 4,
};

const get = function(code = '')
{
    if (code === '') return [{}, new ccc.CompilerConclusion(1), new ccc.CompilerCursor()];
    let l = 0;
    let version = '';
    if (code.slice(l, l+7) === 'VERSION')
    {
        l += 7;
        while (code.charAt(l) === ' ') l += 1;
        while (!('\n\r'.includes(code.charAt(l)))) version += code.charAt(l++);
    }
    else return [{}, new ccc.CompilerConclusion(2), new ccc.CompilerCursor()];

    let compilers = fs.readdirSync(path.join('core', 'compiler_versions'));
    let compiler;
    if (compilers.includes(version)) // exact compiler name
        {}//compiler = path.join('core', 'compiler_version', version);
    else if ([...version].every(letter => csc.s_num.has(letter)))
    {
        let versions_filtered = compilers.filter(value => value.startsWith(`CPLv${version}`))
            .sort((a, b)=>(a-b));
        if (versions_filtered.length === 0)
            return [{}, new ccc.CompilerConclusion(3), new ccc.CompilerCursor(code, 0, 0)];
        version = versions_filtered[versions_filtered.length-1];
    }

    let ret;

    try {
        let compiler_path = path.join('core', 'compiler_versions', version);

        let compiler = require(compiler_path);

        ret = compiler.get(code, l);

        if (ret[0].hasOwnProperty('script'))
        {
            for (let i in ret[0].script)
            {
                if (ret[0].script[i] === undefined)
                    ret[0].script[i] = (caller)=>{};
                else
                {
                    let jsc = compiler.jsconvert(ret[0].script[i]);
                    jsc = new Function('caller', 'ctt', jsc);
                    ret[0].script[i] = (caller)=>{jsc(caller, ctt)};
                }

            }
        }
    }
    catch (err) {
        ret = [{}, new ccc.CompilerConclusion(200),
            new ccc.CompilerCursor(err.message+'\n'+err.fileName+'\n'+err.lineNumber)];
    }
    return [{...DEFAULT, ...ret[0]}, ret[1], ret[2]];
}

const Cell = function(
    technical_values = {},
    cellid = 0,
    board = [],
    globals = [],
    )
{
    this.techvars = {
        X: 0,
        Y: 0,
    };
    this.techvars = {
        ...this.techvars,
        ...technical_values
    };
    this.cellid = cellid;
    this.locals = {};
    this.board = board;
    this.globals = globals;
    this.tasks = [];
    this.code = this.globals[0].objdata[this.globals[0].idlist[this.cellid]];
    this.code.script.create(this);
    //if (this.code.script.create !== undefined) this.code.script.create.exec(this);

    this.step = function()
    {
        this.code.script.step(this);
        //if (this.code.script.step !== undefined) this.code.script.step.exec(this);
    }

    this.reply = function(
        type = Globals.REPLY_DEFAULT,
        message = '',
        )
    {
        switch (type)
        {
            case Globals.REPLY_DEFAULT:
                this.globals[0]['logger'].push([
                    LoggerClass.DEBUG,
                    Date.now(),
                    `Reply from Cell[${this.techvars['X']}, ${this.techvars['Y']}]` +
                    ` (${this.globals[0]['idlist'][this.cellid]})`,
                    ...message.split('\n'),
                ])
                break;
        }
    }

    this.reset = function(cellid = 0)
    {
        this.cellid = cellid;
        this.locals = {};
        this.tasks = [];
        this.code = this.globals[0].objdata[this.globals[0].idlist[this.cellid]];
        this.code.script.create(this);
    }
}

module.exports = {LoggerClass, get, Cell};
},{"./compiler_conclusions_cursors.cjs":4,"./compiler_string_constants.cjs":5,"./compiler_task_types.cjs":6,"fs":18,"path":19}],4:[function(require,module,exports){
/*
    Copyright © 2023 Alexey Kozhanov

    =====

    This file is part of Casual Playground.

    Casual Playground is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

    Casual Playground is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
Casual Playground. If not, see <https://www.gnu.org/licenses/>.
*/

const CompilerCursor = function(codetxt = null, ...indexes)
{
    if (typeof codetxt === 'string')
    {
        if (indexes.length === 0)
        {
            this.sl = 0;
            this.el = -1;
            this.sh = 0;
            this.eh = -1;
            this.txt = codetxt;
        }
        else
        {
            switch (indexes.length)
            {
                case 1:
                    codetxt = '';
                    this.sl = codetxt.lastIndexOf('\n', 0, indexes[0]) + 1;
                    this.el = codetxt.indexOf('\n', indexes[0]);
                    this.sh = 0;
                    this.eh = -1;
                    break;
                case 2:
                    this.sl = indexes[0];
                    this.el = indexes[1];
                    this.sh = 0;
                    this.eh = -1;
                    break;
                case 3:
                    this.sl = indexes[0];
                    this.el = indexes[1];
                    this.sh = indexes[2];
                    this.eh = indexes[2];
                    break;
                default:
                    this.sl = indexes[0];
                    this.el = indexes[1];
                    this.sh = indexes[2];
                    this.eh = indexes[3];
                    break;
            }
            this.txt = codetxt.slice(this.sl, this.el);
        }
    }
    else
    {
        this.sl = 0;
        this.el = -1;
        this.sh = 0;
        this.eh = -1;
        this.txt = '<Not specified where>';
    }

    this.start = () => this.sl;
    this.end = () => this.el;
    this.string = () => this.txt;
    this.highlight = (sym = 'v') => (' '.repeat((this.sl-this.sh)))+(sym.repeat((this.eh-this.sh+1)));
    this.__repr__ = () => `<CompCur[${this.sl}:${this.el}]>`;
    this.__str__ = () => `<CompilerCursor[${this.sl}:${this.el}]: "${this.txt}">`;
}

const compconcl_get_description = function (code) {
    let group = Math.floor(code/100);
    let errid = code % 100;
    if (group < compconcl_ids.length && errid < compconcl_ids[group].length)
    {
        return compconcl_ids[group][errid];
    }
    else return 'Unknown Code';
}

var compconcl_ids = [
    // 0-- / Success conclusions
    Object.values({
        0: 'Success',
        1: 'Success (warning, outdated version of mod)',
    }),
    // 1-- / Format errors
    Object.values({
        0: 'Not a .mod file',
        1: 'Empty file',
        2: 'Version of code is not stated in the start of .mod file (might be unreadable encoding, use UTF-8)',
        3: 'Unknown version of mod',
    }),
    // 2-- / Syntax error
    Object.values({
        0: 'Syntax error: no specified reason',
        1: 'Syntax error: unclosed brackets or quote marks',
        2: 'Syntax error: impossible usage of backslash in quote marks',
        3: 'Syntax error: unexpected symbol/expression',
        4: 'Syntax error: unclosed math operation',
        5: 'Syntax error: undefinable code line',
        6: 'Syntax error: encountered higher tab where it mustn\'t be',
        7: 'Syntax error: unexpected ELSEIF statement (maybe you put something between IF and ELSEIF?)',
        8: 'Syntax error: unexpected ELSE statement (maybe you put something between IF and ELSE?)',
        9: 'Syntax error: unexpected ELSE statement (maybe you put ELSE twice?)',
       10: 'Syntax error: specified mod was not found',
    }),
    // 3-- / Value error
    Object.values({
        0: 'Value error: no specified reason',
        1: 'Value error: unidentifiable value',
        2: 'Value error: trying to write read-only variable',
        3: 'Value error: trying to read non-existent variable',
        4: 'Value error: put value is of incorrect type'
    }),
    // 4-- / Runtime error
    Object.values({
        0: 'Runtime error: no specified reason',
    }),
];

const CompilerConclusion = function(conclusion_code)
{
    this.code = conclusion_code;
    this.description = compconcl_get_description(this.code);
    this.__repr__ = () => `<CompCon[${this.code}]>`;
    this.__str__ = () => `<CompilerConclusion: ${this.code}>`;
    this.full_conclusion = () => `< CompilerConclusion with ID ${this.code}\n  ---\n  ${this.description} >`;
    this.short_conclusion = () => `<CompilerConclusion with ID ${this.code}: ${this.description}>`;
}

const correct_concl = (conclusion) => conclusion.code === 0;

module.exports = {CompilerConclusion, CompilerCursor, correct_concl};
},{}],5:[function(require,module,exports){
const whitespace = ' \t\n\r\v\f';
const ascii_lowercase = 'abcdefghijklmnopqrstuvwxyz';
const ascii_uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ascii_letters = ascii_lowercase + ascii_uppercase;
const digits = '0123456789';
const naming = digits + ascii_letters;
const punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
const printable = naming + punctuation + whitespace;

const s_dig = new Set(digits);
const s_num = new Set([...s_dig, '.']);
const s_ascl = new Set(ascii_lowercase);
const s_ascu = new Set(ascii_uppercase);
const s_asc = new Set([...s_ascl, ...s_ascu]);
const s_nam = new Set([...s_dig, ...s_asc, '_']);
const s_nonam = new Set([...s_dig, '_']);

module.exports = {
    whitespace, ascii_lowercase, ascii_uppercase, ascii_letters, digits, naming, punctuation,
    printable, s_dig, s_num, s_ascl, s_ascu, s_asc, s_nam, s_nonam,
};

/*export {
    whitespace, ascii_lowercase, ascii_uppercase, ascii_letters, digits, naming, punctuation,
    printable, s_dig, s_num, s_ascl, s_ascu, s_asc, s_nam, s_nonam,
};*/
},{}],6:[function(require,module,exports){
const [SET_CELL] = Array(1).keys();

module.exports = {SET_CELL};
},{}],7:[function(require,module,exports){
var global_console = require("./global/console.cjs");
var field_board = require("./field/board.cjs");
var field_sui = require("./field/standard_ui.cjs");
var field_sh = require("./field/selection_handler.cjs");
var mm_intro = require("./mainmenu/intro.cjs");
var mm_bg = require("./mainmenu/background.cjs");
var mm_controller = require("./mainmenu/controller.cjs");
var mm_button = require("./mainmenu/button.cjs");
var mm_startmenu = require("./mainmenu/startmenu.cjs");
var EntGlobalConsole = global_console.EntGlobalConsole;
var EntFieldBoard = field_board.EntFieldBoard;
var EntFieldSUI = field_sui.EntFieldSUI;
var EntFieldSH = field_sh.EntFieldSH;
var EntMMIntro = mm_intro.EntMMIntro;
var EntMMBG = mm_bg.EntMMBG;
var EntMMController = mm_controller.EntMMController;
var EntMMButton = mm_button.EntMMButton;
var EntMMStartMenu = mm_startmenu.EntMMStartMenu;

module.exports = {EntGlobalConsole, EntFieldBoard, EntFieldSUI, EntFieldSH, EntMMIntro, EntMMBG, EntMMController,
    EntMMButton, EntMMStartMenu};
},{"./field/board.cjs":8,"./field/selection_handler.cjs":9,"./field/standard_ui.cjs":10,"./global/console.cjs":11,"./mainmenu/background.cjs":12,"./mainmenu/button.cjs":13,"./mainmenu/controller.cjs":14,"./mainmenu/intro.cjs":15,"./mainmenu/startmenu.cjs":16}],8:[function(require,module,exports){
const engine = require("../../nle.cjs");
const comp = require('../../compiler.cjs');
const ctt = require('../../compiler_task_types.cjs');

const EntFieldBoard = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        // target.cameraspeed = Math.round(Math.log2(Math.pow(2, 9)*scale/100));
        target.mincamspeed = Math.round(Math.log2(Math.pow(2, 6)*target.gvars[0].scale/100));
        target.maxcamspeed = Math.round(Math.log2(Math.pow(2, 14)*target.gvars[0].scale/100));
        // target.hsp = 0;
        // target.vsp = 0;
        target.acceleration = 8;
        target.zoomspeed = 1;

        target.get_tpt = (n) => ((n%9 !== 0)
            ? ((10**(Math.floor(n/9)))*(n%9))
            : 10**((Math.floor(n/9))-1)*9) / 1000;
        target.tpt_min = 1;
        target.tpt_max = 60;

        target.text_size_default_origin = target.gvars[0].fontsize_default;
        target.text_size_default = target.text_size_default_origin;
        target.text_size_small_origin = target.gvars[0].fontsize_small;
        target.text_size_small = target.text_size_small_origin;

        target.history = [];
        target.history.pointer = -1;
        target.history.add_record = function(record)
        {
            target.history.splice(++target.history.pointer, target.history.length, record);
            for (let i=0;i<=(target.history.length-target.gvars[0].history_max_length); i++) target.history.shift();
        };

        // See other initiations in room_start
    },
    room_start: function(target)
    {
        target.board_width = target.gvars[0].board_width;
        target.board_height = target.gvars[0].board_height;

        target.viewscale_origin = 16;
        target.viewscale = target.viewscale_origin;

        this.board_center_view(target);
        target.cameraspeed = Math.round(Math.log2(Math.pow(2, 9)*target.gvars[0].scale/100));
        target.hsp = 0;
        target.vsp = 0;

        target.board = [];
        for (let y = 0; y<target.board_height; y++)
        {
            target.board.push([]);
            for (let x = 0; x<target.board_width; x++)
            {
                let celldata = new comp.Cell(
                    {'X': x, 'Y': y},
                    target.gvars[0].idlist.indexOf(target.gvars[0].cell_fill_on_init),
                    target.board,
                    target.gvars,
                );
                target.board[target.board.length-1].push(celldata);
            }
        }
        target.selection = [];
        for (let i=0; i<target.board_height; i++) target.selection.push(new engine.Bitarray());
        target.selection[0].set(0, 1); target.selection[0].set(2, 1); target.selection[0].set(4, 1);
        target.linecolor_infield = target.gvars[0].linecolor_infield;
        target.linecolor_outfield = target.gvars[0].linecolor_outfield;
        target.cells_to_redraw = [];
        target.surfaces = {board: document.createElement('canvas').getContext('2d'),
            grid:  document.createElement('canvas').getContext('2d'),
            selection:  document.createElement('canvas').getContext('2d')};
        target.surfaces.board.canvas.style.imageRendering = 'pixelated';
        target.surfaces.grid.canvas.style.imageRendering  = 'pixelated';
        target.surfaces.selection.canvas.style.imageRendering  = 'pixelated';
        target.gvars[0].update_board_fully = true;
        this.draw_board(target);

        target.time = 0.0;
        target.tpt_power = 28;
        target.timepertick = 1.0;
        target.time_paused = false;
        target.time_elapsed = 0.0;

        target.board_step_executed = false;
        target.board_step_finished = false;
        target.board_tasks_executed = false;

        target.history.splice(0,target.history.length);
        target.history.pointer = -1;
    },
    step: function(target)
    {
        let deltatime = target.gvars[0].deltatime;
        let globalkeys = target.gvars[0].globalkeys;
        if (!globalkeys.Shift && globalkeys.Equal) this.board_zoom_in(target, target.zoomspeed*deltatime);
        if (!globalkeys.Shift && globalkeys.Minus) this.board_zoom_out(target, target.zoomspeed*deltatime);

        let limitspeed = 2**target.cameraspeed;
        let acc = limitspeed*target.acceleration;

        let right = 0, left = 0, down = 0, up = 0;

        if (!(globalkeys.Ctrl || globalkeys.Alt || globalkeys.Shift))
        {
            right = ~~(globalkeys.ArrowRight||globalkeys.KeyD);
            left = ~~(globalkeys.ArrowLeft||globalkeys.KeyA);
            down = ~~(globalkeys.ArrowDown||globalkeys.KeyS);
            up = ~~(globalkeys.ArrowUp||globalkeys.KeyW);
        }

        let hmov = right - left;
        let vmov = down - up;

        if (hmov !== 0)
            target.hsp = engine.clamp(target.hsp + deltatime*acc*hmov, -limitspeed, limitspeed);
        else
            target.hsp = engine.clamp(target.hsp - deltatime*acc*Math.sign(target.hsp),
                Math.min(target.hsp, 0), Math.max(0, target.hsp));
        if (vmov !== 0)
            target.vsp = engine.clamp(target.vsp + deltatime*acc*vmov, -limitspeed, limitspeed);
        else
            target.vsp = engine.clamp(target.vsp - deltatime*acc*Math.sign(target.vsp),
                Math.min(target.vsp, 0), Math.max(0, target.vsp));

        target.viewx += deltatime*target.hsp;
        target.viewy += deltatime*target.vsp;

        if (target.gvars[0].globalkeys.LMB && !target.gvars[0].field_sui.show) this.board_do_instrument(target);

        if (!target.time_paused) target.time += deltatime;
        if (target.time > target.timepertick)//&&(!target.board_tasks_executed)&&(!target.board_step_executed))
        {
            while (target.board_step_executed) {}
            target.board_step_executed = true;
            /*let promise = new Promise(((resolve, reject) => {
                this.board_step(target);
                target.board_step_executed = false;
            }));
            target.board_step_finished = true;*/
            (async function async_step(board_step_func){
                while (target.board_tasks_executed) {}
                board_step_func(target);
                target.board_step_executed = false;
                target.board_step_finished = true;
            })(this.board_step);
        }
    },
    step_after: function(target)
    {
        if (target.time > target.timepertick)//&&(!target.board_tasks_executed)&&(!target.board_step_executed)&&(target.board_step_finished))
        {
            target.time = 0;
            while (target.board_tasks_executed) {}
            target.board_tasks_executed = true;
            (async function async_tasks(board_tasks_func){
                while (!target.board_step_finished) {}
                board_tasks_func(target);
                target.board_tasks_executed = false;
                target.board_step_finished = false;
            })(this.board_tasks);
            /*let promise = new Promise(((resolve, reject) => {
                this.board_tasks(target);
                target.board_tasks_executed = false;
                target.board_step_finished = false;
            }));*/
        }
        if (target.gvars[0].update_board || target.gvars[0].update_board_fully) this.draw_board(target);
        if (target.gvars[0].update_selection) this.draw_selection(target);
    },
    draw: function(target, surface)
    {
        let bordersize = Math.floor(target.viewscale * target.gvars[0].cellbordersize);
        let cellsize = target.viewscale + bordersize;
        let ox = -target.viewx%cellsize;
        let oy = -target.viewy%cellsize;
        let lx = Math.ceil(surface.canvas.width/cellsize);
        let ly = Math.ceil(surface.canvas.height/cellsize);
        let realx = -target.viewx - (target.viewx > 0);
        let realy = -target.viewy - (target.viewy > 0);
        /*let realx, realy;
        if (target.viewx > 0) { realx = -target.viewx-1; }
        else { realx = -target.viewx; }
        if (target.viewy > 0) { realy = -target.viewy-1; }
        else { realy = -target.viewy; }*/
        surface.drawImage(target.surfaces.board.canvas, realx, realy);
        surface.drawImage(target.surfaces.grid.canvas, realx, realy);
        surface.drawImage(target.surfaces.selection.canvas, realx, realy);

        let linex, liney, startx, starty, endx, endy;
        surface.fillStyle = target.gvars[0].rgb_to_style(...target.linecolor_outfield);

        for (let ix = -1; ix < lx; ix++)
        {
            linex = ox+(ix*cellsize);
            starty = engine.clamp(0, -target.viewy, -target.viewy+(cellsize*target.board_height));
            endy = engine.clamp(surface.canvas.height, -target.viewy, -target.viewy+(cellsize*target.board_height));
            if (!((linex+target.viewx < 0) || (linex+target.viewx > (cellsize*target.board_width))))
            {
                if (starty-2 > 0) surface.fillRect(linex, 0, bordersize, starty);
                if (surface.canvas.height > endy)
                    surface.fillRect(linex, endy+bordersize, bordersize, surface.canvas.height-endy)
            }
            else surface.fillRect(linex, 0, bordersize, surface.canvas.height);
        }
        for (let iy = -1; iy < ly; iy++)
        {
            liney = oy+(iy*cellsize)
            startx = engine.clamp(0, -target.viewx, -target.viewx+(cellsize*target.board_width));
            endx = engine.clamp(surface.canvas.width, -target.viewx, -target.viewx+(cellsize*target.board_width));
            if (!((liney+target.viewy < 0) || (liney+target.viewy > (cellsize*target.board_height))))
            {
                if (startx-2 > 0) surface.fillRect(0, liney, startx, bordersize);
                if (surface.canvas.width > endx)
                    surface.fillRect(endx+bordersize, liney, surface.canvas.width-endx, bordersize);
            }
            else surface.fillRect(0, liney, surface.canvas.width, bordersize);
        }

        // speed
        engine.draw_text(surface, surface.canvas.width-2, surface.canvas.height-2,
            `Max speed: ${Math.pow(2, target.cameraspeed)}`, 'fill', target.text_size_default, 'right', 'bottom', 'white',
            '"Source Sans Pro"');
        /*engine.draw_text(surface, WIDTH-2, HEIGHT-fontsize_default,
            `hsp: ${Math.round(target.hsp)} / vsp: ${Math.round(target.vsp)}`,
            'fill', fontsize_default, 'right', 'bottom', 'white');*/

        // time per tick
        engine.draw_text(surface,
            5, -5 + surface.canvas.height - target.text_size_default,
            `${target.timepertick}s`+(target.time_paused ? ' | Paused' : ''),
            'fill', target.text_size_default, 'left', 'top', 'white', '"Source Sans Pro"');

        // time elapsed
        let clr = target.time_elapsed <= target.timepertick ? 'white' : rgb_to_style(17*14, 17, 17);
        engine.draw_text(surface,
            5, -10 + surface.canvas.height - target.text_size_default - 2*target.text_size_small,
            `${Math.round(target.time_elapsed*100000)/100000} s`,
            'fill', target.text_size_small, 'left', 'top', clr, '"DejaVu Sans Mono"');
        engine.draw_text(surface,
            5, -10 + surface.canvas.height - target.text_size_default - target.text_size_small,
            `${Math.round(target.time_elapsed/(target.board_width*target.board_height)*100000)/100000} s/cell`,
            'fill', target.text_size_small, 'left', 'top', clr, '"DejaVu Sans Mono"');
    },
    kb_down: function(target, key)
    {
        let globalkeys = target.gvars[0].globalkeys;
        switch (key.code)
        {
            case 'KeyQ':
                target.cameraspeed = engine.clamp(target.cameraspeed-1, target.mincamspeed, target.maxcamspeed);
                break;
            case 'KeyE':
                target.cameraspeed = engine.clamp(target.cameraspeed+1, target.mincamspeed, target.maxcamspeed);
                break;
            case 'KeyC':
                if (!globalkeys.Ctrl && !globalkeys.Shift && !globalkeys.Alt)
                {
                    this.board_center_view(target);
                    target.hsp = 0;
                    target.vsp = 0;
                }
                break;
            case 'Space':
                target.time_paused = !target.time_paused;
                break;
            case 'KeyR':
                target.tpt_power = Math.max(target.tpt_min, target.tpt_power-1);
                target.timepertick = target.get_tpt(target.tpt_power);
                break;
            case 'KeyT':
                target.tpt_power = Math.max(target.tpt_min, target.tpt_power+1);
                target.timepertick = target.get_tpt(target.tpt_power);
                break;
            case 'Escape':
                engine.change_current_room(room_mainmenu);
                break;
            case 'Equal':
                if (globalkeys.Shift) current_instrument.scale++;
                break;
            case 'Minus':
                if (globalkeys.Shift)
                    current_instrument.scale = Math.max(current_instrument.scale-1, 1);
                break;
            case 'KeyZ':
                if (globalkeys.Ctrl)
                {
                    if (globalkeys.Shift) // redo
                    {
                        if (target.history.pointer < target.history.length-1)
                        {
                            let record = target.history[++target.history.pointer];
                            for (let action of record)
                            {
                                switch (action.type)
                                {
                                    case "cell_changed":
                                        target.board[action.y][action.x].reset(action.new);
                                        target.cells_to_redraw.push([action.x, action.y]);
                                        target.gvars[0].update_board = true;
                                        break;
                                }
                            }
                            logger.push([
                                comp.LoggerClass.INFO,
                                new Date(),
                                'Redo.',
                            ]);
                        }
                    }
                    else // undo
                    {
                        if (target.history.pointer > -1)
                        {
                            let record = target.history[target.history.pointer--];
                            for (let action of record)
                            {
                                switch (action.type)
                                {
                                    case "cell_changed":
                                        target.board[action.y][action.x].reset(action.old);
                                        target.cells_to_redraw.push([action.x, action.y]);
                                        target.gvars[0].update_board = true;
                                        break;
                                }
                            }
                            logger.push([
                                comp.LoggerClass.INFO,
                                new Date(),
                                'Undo.',
                            ]);
                        }
                    }
                }
                break;
        }
    },
    mouse_up: function(target, mb)
    {
        if (target.gvars[0].globalkeys.LMB && !target.gvars[0].field_sui.show) this.board_do_instrument_end(target);
    },
    mouse_down: function(target, mb)
    {
        let globalkeys = target.gvars[0].globalkeys;
        let current_instrument = target.gvars[0].current_instrument;
        if (!target.gvars[0].field_sui.show)
        {
            let setkey = true;
            switch (mb)
            {
                case engine.WHEELUP:
                    if (globalkeys.Shift && current_instrument.hasOwnProperty('scale'))
                        current_instrument.scale++;
                    else if (!(globalkeys.Ctrl || globalkeys.Shift || globalkeys.Alt))
                        this.board_zoom_in(target, 1);
                    break;
                case engine.WHEELDOWN:
                    if (globalkeys.Shift && current_instrument.hasOwnProperty('scale'))
                        current_instrument.scale = Math.max(current_instrument.scale-1, 1);
                    else if (!(globalkeys.Ctrl || globalkeys.Shift || globalkeys.Alt))
                        this.board_zoom_out(target, 1);
                    break;
            }
        }
        if (target.gvars[0].globalkeys.LMB && !target.gvars[0].field_sui.show) this.board_do_instrument_start(target);
    },
    board_step: function(target)
    {
        let start = Date.now();
        for (let y = 0; y < target.board_height; y++)
        {
            for (let x = 0; x < target.board_width; x++)
            {
                try {target.board[y][x].step();}
                catch (err)
                {
                    let concl = new ccc.CompilerConclusion(400);
                    let cur = new ccc.CompilerCursor();
                    logger.push([
                        comp.LoggerClass.ERROR,
                        new Date(),
                        `Runtime error for cell (${x}, ${y}) with CellID #${idlist[target.board[y][x].cellid]}`,
                        `CasualPlayground Compiler encountered an error: ${concl.code}`,
                        err.name, err.message,
                        concl.full_conclusion(),
                        cur.highlight(),
                        cur.string(),
                    ])
                }
            }
        }
        target.time_elapsed = (Date.now() - start)/1000;
    },
    board_tasks: function(target)
    {
        let taskcount = 0;
        let history_record = [];
        for (let y = 0; y < target.board_height; y++)
        {
            for (let x = 0; x < target.board_width; x++)
            {
                for (let args of target.board[y][x].tasks)
                {
                    switch (args[0])
                    {
                        case ctt.SET_CELL:
                            let [_x, _y, _cellid] = args.slice(1);
                            history_record.push({type: "cell_changed", old: target.board[_y][_x].cellid,
                                new: _cellid, x: _x, y: _y});
                            target.board[_y][_x].reset(_cellid);
                            target.cells_to_redraw.push([_x, _y]);
                            target.gvars[0].update_board = true;
                            break;
                    }
                    taskcount++;
                }
                target.board[y][x].tasks = [];
            }
        }
        if (history_record.length > 0) target.history.add_record(history_record);
    },
    draw_board: function(target)
    {
        let bw = target.board_width;
        let bh = target.board_height;
        let bordersize = Math.floor(target.viewscale * target.gvars[0].cellbordersize);
        let cellsize = target.viewscale+bordersize;
        let surface_board = target.surfaces.board;
        let surface_grid = target.surfaces.grid;
        let surface_selection = target.surfaces.selection;
        let update_cell = function(ix, iy)
        {
            surface_board.imageSmoothingEnabled = false;
            surface_grid.imageSmoothingEnabled = false;
            let cx = (ix*cellsize)+bordersize;
            let cy = (iy*cellsize)+bordersize;
            let celldata = target.board[iy][ix].code;
            surface_board.fillStyle = target.gvars[0].rgb_to_style(...target.linecolor_infield);
            surface_board.fillRect(cx-bordersize/2, cy-bordersize/2, cellsize, cellsize);
            if (celldata.hasOwnProperty('texture') && celldata.texture_ready)
            {
                surface_board.drawImage(celldata.texture, cx, cy, target.viewscale, target.viewscale);
            }
            else
            {
                surface_board.fillStyle = target.gvars[0].rgb_to_style(...celldata.notexture);
                //surface.fillStyle = rgb_to_style(109, 183, 65);
                surface_board.fillRect(cx, cy, target.viewscale, target.viewscale);
            }
        }
        if (target.gvars[0].update_board_fully)
        {
            surface_board.canvas.width = (cellsize*bw)+bordersize;
            surface_board.canvas.height = (cellsize*bh)+bordersize;
            for (let ix = 0; ix < bw; ix++) for (let iy = 0; iy < bh; iy++) update_cell(ix, iy);

            surface_grid.canvas.width = (cellsize*bw)+bordersize;
            surface_grid.canvas.height = (cellsize*bh)+bordersize;
            surface_grid.clearRect(0, 0, surface_grid.canvas.width, surface_grid.canvas.height);
            surface_grid.fillStyle = target.gvars[0].rgb_to_style(...target.linecolor_infield);
            for (let ix = 0; ix <= bw; ix++)
                surface_grid.fillRect(ix*cellsize, 0, bordersize, surface_grid.canvas.height);
            for (let iy = 0; iy <= bh; iy++)
                surface_grid.fillRect(0, iy*cellsize, surface_grid.canvas.width, bordersize);

            surface_selection.imageSmoothingEnabled = false;
            surface_selection.canvas.width = (cellsize*bw)+bordersize;
            surface_selection.canvas.height = (cellsize*bh)+bordersize;
            this.draw_selection(target);
        }
        else
        {
            for (let coord of target.cells_to_redraw) update_cell(...coord);
        }
        target.cells_to_redraw = [];
        target.gvars[0].update_board = false;
        target.gvars[0].update_board_fully = false;
    },
    draw_selection: function(target)
    {
        let bw = target.board_width;
        let bh = target.board_height;
        let bordersize = Math.floor(target.viewscale * target.gvars[0].cellbordersize);
        let cellsize = target.viewscale+bordersize;
        let surface_selection = target.surfaces.selection;
        surface_selection.clearRect(0,0,surface_selection.canvas.width,surface_selection.canvas.height);
        let color = target.gvars[0].selection_color;
        surface_selection.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`;
        for (let ix = 0; ix < bw; ix++)
        {
            for (let iy = 0; iy < bh; iy++)
            {
                if (target.selection[iy].get(ix))
                {
                    let cx = (ix*cellsize)+bordersize;
                    let cy = (iy*cellsize)+bordersize;
                    surface_selection.fillRect(cx, cy, target.viewscale, target.viewscale);
                }
            }
        }
        update_selection = false;
    },
    board_center_view: function(target)
    {
        let [x, y] = this.board_get_center(target);
        target.viewx = x;
        target.viewy = y;
    },
    board_zoom_in: function(target, mul)
    {
        let mx = target.gvars[0].mx;
        let my = target.gvars[0].my;
        let oldvs = target.viewscale;
        target.viewscale = Math.floor(engine.clamp(
            target.viewscale + engine.clamp(Math.floor(0.2 * mul * target.viewscale), 1, 64),
            2, 64));
        let newvs = target.viewscale;
        let ratio = newvs/oldvs;

        target.viewx = ((target.viewx+mx) * ratio) - mx;
        target.viewy = ((target.viewy+my) * ratio) - my;

        target.gvars[0].update_board_fully = true;
        this.draw_board(target);
    },
    board_zoom_out: function(target, mul)
    {
        let mx = target.gvars[0].mx;
        let my = target.gvars[0].my;
        let oldvs = target.viewscale;
        target.viewscale = Math.floor(engine.clamp(
            target.viewscale - engine.clamp(Math.floor(0.2 * mul * target.viewscale), 1, 64),
            2, 64));
        let newvs = target.viewscale;
        let ratio = newvs/oldvs;

        target.viewx = ((target.viewx+mx) * ratio) - mx;
        target.viewy = ((target.viewy+my) * ratio) - my;

        target.gvars[0].update_board_fully = true;
        this.draw_board(target);
    },
    board_get_center: function(target)
    {
        let display = target.gvars[0].display;
        let cellsize = target.viewscale * (target.gvars[0].cellbordersize+1);
        let w = cellsize*target.board_width + (target.viewscale * target.gvars[0].cellbordersize);
        let h = cellsize*target.board_height + (target.viewscale * target.gvars[0].cellbordersize);
        return [(w-display.cw())/2, (h-display.ch())/2];
    },
    board_do_instrument: function(target)
    {
        let current_instrument = target.gvars[0].current_instrument;
        let bordersize = Math.floor(target.viewscale*target.gvars[0].cellbordersize);
        let cellsize = bordersize + target.viewscale;
        let rx = target.gvars[0].mx + target.viewx - bordersize;
        let ry = target.gvars[0].my + target.viewy - bordersize;
        let cx = Math.floor(rx/cellsize);
        let cy = Math.floor(ry/cellsize);
        let maxcx = target.board_width;
        let maxcy = target.board_height;
        let history_record = [];
        let commands = {
            "selection_brush": (ix,iy)=>{target.selection[iy].set(ix, 1); update_selection = true},
            "brush": (ix,iy)=>{
                if (current_instrument.hasOwnProperty('cell') && current_instrument.cell !== target.board[iy][ix].cellid)
                {
                    history_record.push({type: "cell_changed", old: target.board[iy][ix].cellid,
                        new: current_instrument.cell, x: ix, y: iy});
                    target.board[iy][ix].reset(current_instrument.cell);
                    target.cells_to_redraw.push([ix, iy]);
                }
            },
        };
        switch (current_instrument.type)
        {
            case 'brush':
            case 'selection_brush':
                scale = current_instrument.scale-1;
                if (((rx % cellsize) < target.viewscale) && ((ry % cellsize) < target.viewscale))
                {
                    for (let ix = cx-scale; ix < cx+scale+1; ix++)
                    {
                        for (let iy = cy-scale; iy < cy+scale+1; iy++)
                        {
                            if ((0 <= ix) && (ix < maxcx) && (0 <= iy) && (iy < maxcy))
                            {
                                let command = commands[current_instrument.type];
                                if (current_instrument.shape === 'round')
                                {
                                    let dx = ix-cx;
                                    let dy = iy-cy;
                                    if (Math.round(Math.sqrt(dx*dx + dy*dy)) <= scale) command(ix,iy);
                                } else command(ix,iy);
                            }
                        }
                    }
                    this.draw_board(target);
                }
                break;
        }
        if (history_record.length > 0) target.history.add_record(history_record);
    },
    board_do_instrument_start: function(target)
    {
        let current_instrument = target.gvars[0].current_instrument;
        let bordersize = Math.floor(target.viewscale*target.gvars[0].cellbordersize);
        let cellsize = bordersize + target.viewscale;
        let rx = target.gvars[0].mx + target.viewx - bordersize;
        let ry = target.gvars[0].my + target.viewy - bordersize;
        let cx = Math.floor(rx/cellsize);
        let cy = Math.floor(ry/cellsize);
        let maxcx = target.board_width;
        let maxcy = target.board_height;
        let commands = {
            "paste": (ox,oy)=>{
                if (current_instrument.hasOwnProperty('pastedata'))
                {
                    let pw = current_instrument.pastewidth;
                    let ph = current_instrument.pasteheight;
                    let hx = Math.floor(pw/2); let hy = Math.floor(ph/2);
                    for (let ix=0; ix<pw; ix++)
                    {
                        for (let iy=0; iy<ph; iy++)
                        {
                            let jx = ox+ix-hx;
                            let jy = oy+iy-hy;
                            if ((0 <= jx) && (jx < maxcx) && (0 <= jy) && (jy < maxcy))
                            {
                                if (current_instrument.pastedata.hasOwnProperty(iy))
                                {
                                    if (current_instrument.pastedata[iy].hasOwnProperty(ix))
                                    {
                                        let cellid = idlist.indexOf(current_instrument.pastedata[iy][ix]);
                                        target.board[jy][jx].reset(cellid);
                                        target.cells_to_redraw.push([jx, jy]);
                                    }
                                }
                            }
                        }
                    }
                }
            },
        };
        switch (current_instrument.type)
        {
            case 'paste':
                if (((rx % cellsize) < target.viewscale) && ((ry % cellsize) < target.viewscale))
                {
                    let command = commands[current_instrument.type];
                    command(cx,cy);
                    this.draw_board(target);
                }
        }
    },
    board_do_instrument_end: function(target)
    {
        // placeholder
    },
    canvas_resize: function(target, width, height)
    {
        let measure = Math.min(height/target.gvars[0].HEIGHT, width/target.gvars[0].WIDTH);
        target.viewscale = target.viewscale_origin * measure;
        target.text_size_default = target.text_size_default_origin * measure;
        target.text_size_small = target.text_size_small_origin * measure;

        target.gvars[0].update_board_fully = true;
    },
});

module.exports = {EntFieldBoard};
},{"../../compiler.cjs":3,"../../compiler_task_types.cjs":6,"../../nle.cjs":17}],9:[function(require,module,exports){
const engine = require("../../nle.cjs");
const comp = require('../../compiler.cjs');
const clippar = require('../../clipboard_parser.cjs');

const EntFieldSH = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
    },
    kb_down: function(target, key)
    {
        let globalkeys = target.gvars[0].globalkeys;
        let fieldboard = target.gvars[0].field_board;
        let idlist = target.gvars[0].idlist;
        let objdata = target.gvars[0].objdata;
        let logger = target.gvars[0].logger;
        switch (key.code)
        {
            case 'KeyC':
                if (globalkeys.Ctrl && !globalkeys.Shift && !globalkeys.Alt)
                {
                    let ret = clippar.copy(fieldboard.board, fieldboard.selection, idlist);
                    if (ret !== null) navigator.clipboard.writeText(ret[0]);
                    console.log(ret[1]);
                    target.gvars[0].logger.push([comp.LoggerClass.INFO, new Date(), ret[1]]);
                }
                break;
            case 'KeyV':
                if (globalkeys.Ctrl && !globalkeys.Shift && !globalkeys.Alt)
                {
                    target.gvars[0].current_instrument.type = 'paste';
                    navigator.clipboard.readText().then((clipboardtext)=>{
                        let ret = clippar.paste(clipboardtext, objdata);
                        for (let k in ret[0]) target.gvars[0].current_instrument[k] = ret[0][k];
                        console.log(ret[1]);
                        logger.push([comp.LoggerClass.INFO, new Date(), ret[1]]);
                    });
                }
                break;
            case 'KeyS':
                if (globalkeys.Ctrl)
                {
                    let ret = engine.save(
                        engine.create_text_blob(clippar.copy(fieldboard.board, fieldboard.selection, idlist)[0]),
                        'untitled.cpd');
                    console.log(ret);
                    logger.push([comp.LoggerClass.INFO, new Date(), ret]);
                }
                break;
            case 'KeyO':
                if (globalkeys.Ctrl)
                {
                    let input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = false;
                    input.addEventListener('change', ()=>{
                        let reader = new FileReader();
                        reader.addEventListener('load', ()=>{
                            target.gvars[0].current_instrument.type = 'paste';
                            let ret = clippar.paste(reader.result, objdata);
                            for (let k in ret[0]) target.gvars[0].current_instrument[k] = ret[0][k];
                            console.log('Successfully opened area!');
                            logger.push([comp.LoggerClass.INFO, new Date(), 'Successfully opened area!']);
                        });
                        reader.readAsText(input.files[0]);
                        input.remove();
                    });
                    input.click();
                }
                break;
        }
    },
});

module.exports = {EntFieldSH};
},{"../../clipboard_parser.cjs":2,"../../compiler.cjs":3,"../../nle.cjs":17}],10:[function(require,module,exports){
const engine = require("../../nle.cjs");

const EntFieldSUI = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        let scale = target.gvars[0].scale;
        let display = target.gvars[0].display;
        target.show_step = 0.0;
        target.show = false;

        target.element_number = 5; // number of objects in one line
        target.window_spacing_origin = Math.round(20*scale/100); // space between object menu's edge and objects
        target.window_spacing = target.window_spacing_origin;
        target.window_margin_origin = Math.round(16*scale/100); // space between object menu and the game window's edge
        target.window_margin = target.window_margin_origin;
        target.display_scale_origin = Math.round(80*scale/100); // the size of each object's image in object menu
        target.display_scale = target.display_scale_origin;
        target.window_border_origin = 4; // thickness of borders
        target.window_border = target.window_border_origin;
        target.objmenu_heading_size_origin = 48; // size of object menu title
        target.objmenu_heading_size = target.objmenu_heading_size_origin;
        target.instrmenu_heading_size_origin = 36; // size of instrument menu title
        target.instrmenu_heading_size = target.instrmenu_heading_size_origin;
        target.instrmenu_heading_size_minimized_origin = 28; // size of minimized instrument menu title
        target.instrmenu_heading_size_minimized = target.instrmenu_heading_size_minimized_origin;
        target.instrmenu_imgbox_ratio = 0.9;
        target.border_width_origin = 5;
        target.border_width = target.border_width_origin;
        target.object_name_size_origin = target.gvars[0].fontsize_smaller;
        target.object_name_size = target.object_name_size_origin;
        target.descmenu_name_size_origin = target.gvars[0].fontsize_big;
        target.descmenu_name_size = target.descmenu_name_size_origin;
        target.descmenu_properties_size_origin = target.gvars[0].fontsize_smaller;
        target.descmenu_properties_size = target.descmenu_properties_size_origin;
        target.descmenu_description_size_origin = target.gvars[0].fontsize_smaller;
        target.descmenu_description_size = target.descmenu_description_size_origin;
        target.descmenu_border_origin = Math.round(4*scale/100);
        target.descmenu_border = target.descmenu_border_origin;
        target.descmenu_padding_origin = Math.round(8*scale/100);
        target.descmenu_padding = target.descmenu_padding_origin;
        target.descmenu_divider_origin = Math.round(12*scale/100);
        target.descmenu_divider = target.descmenu_divider_origin;
        let en = target.element_number;
        let ws = target.window_spacing;
        let wm = target.window_margin;
        let ds = target.display_scale;
        let wb = target.window_border;
        target.width_part = Math.round((display.cw() - 4*wm)/3); // equal parts of screen's width (currently a third)
        target.objmenu_height = display.ch() - (2*wm); // object menu height
        target.instrmenu_height = display.ch()/3 - (3*wm); // instrument menu height
        target.instrmenu_height_minimized = wb+ws+target.instrmenu_heading_size_minimized;
        target.hotbar_height = target.width_part/10;
        target.element_border = Math.round((target.width_part-(2*ws)-(en*ds))/(en-1));

        target.desc_window_width_origin = 256+128;
        target.desc_window_width =  target.desc_window_width_origin;
        target.desc_window_surface = target.gvars[0].document.createElement('canvas').getContext('2d');
        target.desc_window_id = -1;
        target.desc_window_show = false;
        target.desc_window_offset = [0,0];

        target.objmenu_surface = this.draw_objmenu(target);

        /*target.objmenu_surface = target.gvars[0].document.createElement('canvas').getContext('2d'); // object menu
        target.objmenu_surface.canvas.width = target.width_part;
        target.objmenu_surface.canvas.height = target.objmenu_height;*/

        /*target.instrmenu_surface = target.gvars[0].document.createElement('canvas').getContext('2d'); // instrument menu
        target.instrmenu_surface.canvas.width = target.width_part;
        target.instrmenu_surface.canvas.height = target.instrmenu_height;*/
    },
    room_start: function(target)
    {
        let display = target.gvars[0].display;
        target.hotbar = Array(10);
        for (let i = 0; i<10;i++) target.hotbar[i] = {type:'none'};
        target.hotbar_slot = 1;
        target.gvars[0].current_instrument = target.hotbar[target.hotbar_slot]

        this.canvas_resize(target, display.cw(), display.ch()); // is needed for some reason
    },
    step: function(target)
    {
        let new_step = engine.linear_interpolation(target.show_step, Math.floor(target.show), 3);
        if (target.show_step !== new_step)
        {
            target.show_step = new_step;

            if (Math.round(target.show_step * 1000) / 1000 === 0.0) target.show_step = 0;
            else if (Math.round(target.show_step * 1000) / 1000 === 1.0) target.show_step = 1;
            this.mouse_move(target);
        }

        if (target.gvars[0].update_objmenu) target.objmenu_surface = this.draw_objmenu(target);
    },
    draw: function(target, surface)
    {
        let wm = target.window_margin;
        let ih = target.instrmenu_height;
        let ihm = target.instrmenu_height_minimized;
        if (target.show_step !== 0.0)
        {
            surface.fillStyle = `rgba(0,0,0,${target.show_step/2})`;
            surface.fillRect(0,0,surface.canvas.width,surface.canvas.height);
            let [ds, eb, ws] = [target.display_scale, target.element_border, target.window_spacing];
            let measure = Math.floor(target.width_part*1.5);
            let phase_offset = Math.floor(measure*target.show_step)-measure;
            surface.drawImage(target.objmenu_surface.canvas, phase_offset+wm, wm);
            if (target.desc_window_show && target.show)
                surface.drawImage(target.desc_window_surface.canvas, ...target.desc_window_offset);
            target.objmenu_surface.canvas.remove();
        }
        let instrmenu = this.draw_instrmenu(target);
        surface.drawImage(instrmenu.canvas, surface.canvas.width-wm-target.width_part,
            surface.canvas.height+((1-target.show_step)*(ih+wm))-ihm-wm-target.instrmenu_height);
        instrmenu.canvas.remove();

        let instr_hb = this.draw_instrument_hotbar(target);
        surface.drawImage(instr_hb.canvas, wm+wm+target.width_part, surface.canvas.height-wm-target.hotbar_height);
        instr_hb.canvas.remove();
    },
    kb_down: function(target, key)
    {
        switch (key.code)
        {
            case 'Tab':
                if (target.gvars[0].globalkeys.Shift)
                {
                    if (target.gvars[0].current_instrument.hasOwnProperty('shape'))
                        target.gvars[0].current_instrument.shape =
                            (target.gvars[0].current_instrument.shape === 'round' ? 'square' : 'round');
                }
                else target.show = !target.show;
                break;
            case 'F1': // none
                target.gvars[0].current_instrument.type = 'none';
                break;
            case 'F2': // selection / selection brush
                switch (target.gvars[0].current_instrument.type)
                {
                    case 'selection':
                        target.gvars[0].current_instrument.type = 'selection_brush';
                        break;
                    case 'selection_brush':
                    default:
                        target.gvars[0].current_instrument.type = 'selection';
                        target.gvars[0].current_instrument.scale = target.gvars[0].current_instrument.hasOwnProperty('scale')
                            ? target.gvars[0].current_instrument.scale : 1;
                        target.gvars[0].current_instrument.shape = target.gvars[0].current_instrument.hasOwnProperty('shape')
                            ? target.gvars[0].current_instrument.scale : 'square';
                        break;
                }
                break;
            case 'F3': // brush
            case 'F4': // line
                target.gvars[0].current_instrument.type = (key.code === 'F3' ? 'brush' : 'line');
                target.gvars[0].current_instrument.scale = target.gvars[0].current_instrument.hasOwnProperty('scale')
                    ? target.gvars[0].current_instrument.scale : 1;
                target.gvars[0].current_instrument.shape = target.gvars[0].current_instrument.hasOwnProperty('shape')
                    ? target.gvars[0].current_instrument.scale : 'square';
                break;
            default:
                if (key.code.slice(0, 5) === 'Digit')
                {
                    target.hotbar_slot = Number(key.code[5]);
                    target.gvars[0].current_instrument = target.hotbar[target.hotbar_slot];
                }
                break;
        }
    },
    mouse_move: function(target)
    {
        let mx = target.gvars[0].mx;
        let my = target.gvars[0].my;
        if (target.show)
        {
            let ci = this.mouse_on_cell(target);
            if (ci !== null)
            {
                if (!target.gvars[0].arraysEqual(target.desc_window_id, [0, ci]))
                {
                    target.desc_window_surface = this.draw_desc_window(target, ci);
                    target.desc_window_id = [0, ci];
                }
                target.desc_window_show = true;
                target.desc_window_offset = [mx+16, my+16];
            }
            else target.desc_window_show = false;
        }
    },
    mouse_down: function(target, buttonid)
    {
        if (target.show)
        {
            let ci = this.mouse_on_cell(target);
            if (ci !== null)
            {
                switch (buttonid)
                {
                    case engine.LMB:
                        target.hotbar[target.hotbar_slot] =
                            {
                                type: 'brush',
                                cell: ci,
                                shape: target.gvars[0].current_instrument.hasOwnProperty('shape')
                                    ? target.gvars[0].current_instrument.shape
                                    : 'square',
                                scale: target.gvars[0].current_instrument.hasOwnProperty('scale')
                                    ? target.gvars[0].current_instrument.scale
                                    : 1,
                            };
                        target.gvars[0].current_instrument = target.hotbar[target.hotbar_slot];
                        break;
                }
            }
        }
        if (target.gvars[0].globalkeys.Ctrl)
        {
            switch (buttonid)
            {
                case engine.WHEELDOWN:
                    target.hotbar_slot = engine.wrap(target.hotbar_slot+1, 0, 9);
                    target.gvars[0].current_instrument = target.hotbar[target.hotbar_slot];
                    break;
                case engine.WHEELUP:
                    target.hotbar_slot = engine.wrap(target.hotbar_slot-1, 0, 9);
                    target.gvars[0].current_instrument = target.hotbar[target.hotbar_slot];
                    break;
            }
        }
    },
    mouse_on_cell: function(target)
    {
        let [ds, eb, ws, ons] = [target.display_scale, target.element_border, target.window_spacing,
            target.object_name_size];
        let [hs, wm] = [target.objmenu_heading_size, target.window_margin];
        let mx = target.gvars[0].mx;
        let my = target.gvars[0].my;
        let measure = Math.floor(target.width_part*1.5);
        let phase_offset = Math.floor(measure*target.show_step)-measure;
        let inoneline = target.element_number;
        let mousex = mx-phase_offset-wm-ws;
        let mousey = my-wm-ws;
        let [detectwidth, detectheight] = [ds + eb, ds + ons + eb];
        let ci = Math.floor(mousex/detectwidth)
            + (Math.floor((mousey-ws-hs)/detectheight) * inoneline);
        let cx = ((ds + eb)*(ci%inoneline));
        let cy = (ws + hs) + ((ds + eb + ons)*Math.floor(ci/inoneline));
        if (cx <= mousex && mousex <= cx + ds)
            if (cy <= mousey && mousey <= cy + ds)
                if (ci < target.gvars[0].idlist.length && ci >= 0)
                    return ci;
        return null;
    },
    draw_desc_window: function(target, cellid)
    {
        let objdata = target.gvars[0].objdata;
        let idlist = target.gvars[0].idlist;
        let loc = target.gvars[0].loc;
        let get_locstring = target.gvars[0].get_locstring;
        let get_text_width = target.gvars[0].get_text_width;
        let roundRect = target.gvars[0].roundRect;
        idlist = target.gvars[0].idlist;
        //let widths = [];
        let cellname = idlist[cellid];
        let [border, padding, divider] = [target.descmenu_border, target.descmenu_padding, target.descmenu_divider];
        let padding2 = padding*2;
        let canvaswidth = target.desc_window_width - padding2;
        let name_size =  target.descmenu_name_size;
        let properties_size = target.descmenu_properties_size;
        let description_size = target.descmenu_description_size;
        //let space_scale = 1/3;

        let celldata = objdata[cellname];
        let localization = celldata.localization;
        let name_string = localization.hasOwnProperty(loc) ? localization[loc].name : celldata.name;
        let origin_string = celldata.origin;
        let origin_color = celldata.official ? 'lime' : 'white';
        let from_string = get_locstring('descwin/from');
        let desc_string = localization.hasOwnProperty(loc) ? localization[loc].desc : celldata.desc;

        let border_color = '#4d4d4d';
        let bg_color = 'rgba(0,0,0,0.5)';

        let surface = target.gvars[0].document.createElement('canvas').getContext('2d');
        surface.font = `${name_size}px sans-serif`;
        let txt_size1 = get_text_width(name_string, surface.font);//surface.measureText(name_string);
        name_size = name_size * Math.min(1, canvaswidth / txt_size1);

        let linewidth = 0;
        let y_offset = 0;
        let lines = [''];
        surface.font = `${description_size*100}px sans-serif`;
        for (let letter of desc_string)
        {
            let letter_width = get_text_width(letter, surface.font)/100;//surface.measureText(letter).width;
            //widths.push(letter_width);
            if (linewidth + letter_width > canvaswidth)
            {
                linewidth = 0;
                lines.push(['']);
                y_offset += description_size;
            }
            lines[lines.length-1] += letter;
            linewidth += letter_width;
        }

        surface.canvas.width = target.desc_window_width;
        surface.canvas.height = name_size + properties_size + divider + padding2 +
            y_offset + description_size + properties_size;
        surface.globalCompositeOperation = 'destination-atop';
        surface.fillStyle = bg_color;
        roundRect(surface, 0, 0, surface.canvas.width, surface.canvas.height,
            8, false);
        surface.globalCompositeOperation = 'source-over';
        surface.strokeStyle = border_color;
        surface.lineWidth = border;
        roundRect(surface, 0, 0, surface.canvas.width, surface.canvas.height,
            8, true);

        let y = padding;
        engine.draw_text(surface, padding, y, name_string, 'fill', name_size,
            'left', 'top', 'white', '"Source Sans Pro"');

        y += name_size + Math.floor(divider/2);
        engine.draw_line(surface, padding, y, target.desc_window_width - padding,
            y, border_color, border);

        y += Math.floor(divider/2);
        surface.font = `${description_size}px`;
        for (let line of lines)
        {
            let x = padding;
            engine.draw_text(surface, x, y, line, 'fill', description_size,
                'left', 'top', 'white', '"Source Sans Pro"');
            x += get_text_width(line, surface.font);//surface.measureText(line);
            y += description_size;
        }

        y += Math.floor(divider/2);
        engine.draw_line(surface, padding, y, target.desc_window_width - padding,
            y, border_color, border);

        y += Math.floor(divider/2);
        engine.draw_text(surface, target.desc_window_width - padding, y,  origin_string, 'fill', properties_size,
            'right', 'top', origin_color, '"Source Sans Pro"');
        engine.draw_text(surface, padding, y, from_string, 'fill', properties_size, 'left', 'top', origin_color,
            '"Source Sans Pro"');

        /*let ow = 0;
        for (let w of widths)
        {
            let x = ow+padding;
            let y = padding+divider+name_size;
            engine.draw_line(surface, x, y, x+w, y, `hsl(${(10*ow) % 360}, 100%, 50%)`);
            ow += w;
        }*/

        return surface;
    },
    draw_objmenu: function(target)
    {
        let objdata = target.gvars[0].objdata;
        let idlist = target.gvars[0].idlist;
        let loc = target.gvars[0].loc;
        let ctx = target.gvars[0].document.createElement('canvas').getContext('2d');
        ctx.canvas.width = target.width_part;
        ctx.canvas.height = target.objmenu_height;

        let ws = target.window_spacing;
        let ds = target.display_scale;
        let eb = target.element_border;
        let wb = target.window_border;
        let wb2 = wb/2;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let alphabg = target.gvars[0].document.createElement('canvas').getContext('2d');
        let roundRect = target.gvars[0].roundRect;
        alphabg.canvas.width = ctx.canvas.width;
        alphabg.canvas.height = ctx.canvas.height;
        alphabg.fillStyle = '#1a1a1a';
        roundRect(alphabg, wb2, wb2, target.width_part-wb, target.objmenu_height-wb, target.border_width);
        alphabg.strokeStyle = '#7f7f7f';
        alphabg.lineWidth = wb;
        roundRect(alphabg, wb2, wb2, target.width_part-wb, target.objmenu_height-wb, target.border_width, true);
        alphabg.globalCompositeOperation = 'destination-in';
        alphabg.fillStyle = 'rgba(0, 0, 0, 0.8)';
        alphabg.fillRect(0, 0, alphabg.canvas.width, alphabg.canvas.height);
        alphabg.globalCompositeOperation = 'source-over';

        ctx.drawImage(alphabg.canvas, 0, 0);

        alphabg.canvas.remove();

        let textsize = target.objmenu_heading_size;
        engine.draw_text(ctx, ws, ws+Math.round(textsize/2), 'Objects', 'fill', textsize,
            'left', 'center', 'white', '"Source Sans Pro"', 'italic');

        let oy = ws+textsize;

        let inoneline = target.element_number; //Math.floor(target.cellmenu_width / (ds + eb));
        let ci = -1
        for (let o of idlist)
        {
            let obj = objdata[o];
            switch (obj.type)
            {
                case 'CELL':
                    ci++;
                    let cx = ws + ((ds + eb) * (ci % inoneline));
                    let cy = ws + oy + ((ds + eb + target.object_name_size) * Math.floor(ci/inoneline));
                    ctx.imageSmoothingEnabled = false;
                    if (obj.hasOwnProperty('texture') && obj.texture_ready)
                        ctx.drawImage(obj.texture, cx, cy, ds, ds);
                    else
                    {
                        ctx.fillStyle = target.gvars[0].rgb_to_style(...obj.notexture);
                        ctx.fillRect(cx, cy, ds, ds);
                    }

                    let name_string = (obj.localization.hasOwnProperty(loc)
                        ? obj.localization[loc].name
                        : obj.name);

                    engine.draw_text(ctx, cx + (ds/2), cy + ds + (eb/2),
                        target.gvars[0].cut_string(name_string, `${target.object_name_size}px "Source Sans Pro"`, ds),
                        'fill', target.object_name_size, 'center', 'top', 'white', '"Source Sans Pro"');
                    break;
            }
        }

        return ctx;
    },
    draw_instrmenu: function(target)
    {
        let objdata = target.gvars[0].objdata;
        let idlist = target.gvars[0].idlist;
        let get_text_width = target.gvars[0].get_text_width;
        let get_locstring = target.gvars[0].get_locstring;
        let cut_string = target.gvars[0].cut_string;
        let rgb_to_style = target.gvars[0].rgb_to_style;
        let roundRect = target.gvars[0].roundRect;
        let sprites = target.gvars[0].sprites;
        let ctx = target.gvars[0].document.createElement('canvas').getContext('2d');
        ctx.canvas.width = target.width_part;
        ctx.canvas.height = target.instrmenu_height;

        let ws = target.window_spacing;
        let ws2 = Math.round(ws/2);
        let ds = target.display_scale;
        let eb = target.element_border;
        let wb = target.window_border;
        let wb2 = Math.round(wb/2);
        let ih = target.instrmenu_height;
        let ihm = target.instrmenu_height_minimized;
        let ihs = target.instrmenu_heading_size;
        let ihsm = target.instrmenu_heading_size_minimized;
        let ss = target.show_step;

        ctx.clearRect(0, 0,
            ctx.canvas.width, ctx.canvas.height);

        let alphabg = target.gvars[0].document.createElement('canvas').getContext('2d');
        alphabg.canvas.width = ctx.canvas.width;
        alphabg.canvas.height = ctx.canvas.height;
        alphabg.fillStyle = '#1a1a1a';
        roundRect(alphabg, wb2, wb2, target.width_part-wb, target.instrmenu_height-wb, 5);
        alphabg.strokeStyle = '#7f7f7f';
        alphabg.lineWidth = wb;
        roundRect(alphabg, wb2, wb2, target.width_part-wb, target.instrmenu_height-wb, 5, true);
        alphabg.globalCompositeOperation = 'destination-in';
        alphabg.fillStyle = 'rgba(0, 0, 0, 0.8)';
        alphabg.fillRect(0, 0, alphabg.canvas.width, alphabg.canvas.height);
        alphabg.globalCompositeOperation = 'source-over';

        ctx.drawImage(alphabg.canvas, 0, 0);

        alphabg.canvas.remove();

        let textsize = ihsm+(ss*(ihs-ihsm)); //target.instrmenu_heading_size;

        let instr_name_length = get_text_width(get_locstring(`instrument/${target.gvars[0].current_instrument.type}`),
            `italic ${textsize}px "Source Sans Pro"`);

        engine.draw_text(ctx, target.width_part - (ws2+(ss*(ws2-wb))), wb+ws2+(ss*(-wb+ws2)),
            get_locstring(`instrument/${target.gvars[0].current_instrument.type}`),
            'fill', textsize, 'right', 'top', 'white', '"Source Sans Pro"', 'italic');

        let oy = textsize + ws2 + (ss*ws2); // instrument image box offset
        let img_box = ihm - ws + (ss*(ih - 2*ws - oy - ihm + ws)); // size of instrument image box

        let local_ws = Math.round(ws/(2-ss));

        let rounded_image = function(image)
        {
            let ctx1 = target.gvars[0].document.createElement('canvas').getContext('2d');
            ctx1.canvas.width = img_box;
            ctx1.canvas.height = img_box;
            ctx.fillStyle = 'white';
            roundRect(ctx1, 0, 0, img_box, img_box, 2+(ss*(8-2)));
            let ctx2 = target.gvars[0].document.createElement('canvas').getContext('2d');
            ctx2.canvas.width = img_box;
            ctx2.canvas.height = img_box;
            ctx2.imageSmoothingEnabled = false;
            ctx2.drawImage(image, 0, 0, img_box, img_box);
            ctx1.globalCompositeOperation = 'source-atop';
            ctx1.drawImage(ctx2.canvas, 0, 0);
            ctx1.globalCompositeOperation = 'source-over';
            ctx2.canvas.remove();
            return ctx1;
        }

        switch (target.gvars[0].current_instrument.type)
        {
            case 'brush':
                let string = get_locstring(`instrument/shape/${target.gvars[0].current_instrument.shape}`)
                    +` [${target.gvars[0].current_instrument.scale}] | `+idlist[target.gvars[0].current_instrument.cell];
                let string_limit = target.width_part-instr_name_length-ws-(ss*ws)-((1-ss)*img_box);
                engine.draw_text(ctx, ws2+(ss*ws2)+((1-ss)*(ihm-ws2)), wb+ws2+(ss*(-wb+ws2)) + Math.round(textsize)/2,
                    cut_string(string, '"Source Sans Pro"', string_limit / 0.8),
                    'fill', textsize*0.8, 'left', 'center', 'white', '"Source Sans Pro"');
                if (target.gvars[0].current_instrument.hasOwnProperty('cell'))
                {
                    let ctx1;
                    let celldata = objdata[idlist[target.gvars[0].current_instrument.cell]];
                    if (celldata.hasOwnProperty('texture') && celldata.texture_ready)
                        ctx1 = rounded_image(celldata.texture);
                    else
                    {
                        let ctx2 = target.gvars[0].document.createElement('canvas').getContext('2d');
                        ctx2.canvas.width = img_box; ctx2.canvas.height = img_box;
                        ctx2.fillStyle = rgb_to_style(...celldata.notexture);
                        ctx2.fillRect(0, 0, img_box, img_box);
                        ctx1 = rounded_image(ctx2.canvas);
                        ctx2.canvas.remove()
                    }
                    ctx.drawImage(ctx1.canvas, local_ws, local_ws + (ss*oy));
                    ctx1.canvas.remove();
                    ctx.fillStyle = `rgba(0, 0, 0, ${(1-ss)*0.25})`;
                }
                else ctx.fillStyle = 'rgba(102, 102, 102, 0.5)';
                roundRect(ctx, local_ws, local_ws + (ss*oy), img_box, img_box, 2+(ss*(8-2)));
                break;
            case 'paste':
                if (target.gvars[0].current_instrument.hasOwnProperty('pastedata'))
                {
                    let ctx2 = target.gvars[0].document.createElement('canvas').getContext('2d');
                    ctx2.canvas.width = img_box; ctx2.canvas.height = img_box;
                    let pw = target.gvars[0].current_instrument.pastewidth; let ph = target.gvars[0].current_instrument.pasteheight;
                    let pmax = Math.max(pw, ph);
                    let ps = img_box/pmax;
                    for (let ix=0; ix<pw; ix++)
                    {
                        for (let iy=0; iy<ph; iy++)
                        {
                            if (target.gvars[0].current_instrument.pastedata.hasOwnProperty(iy))
                            {
                                if (target.gvars[0].current_instrument.pastedata[iy].hasOwnProperty(ix))
                                {
                                    let nid = target.gvars[0].current_instrument.pastedata[iy][ix];
                                    if (objdata.hasOwnProperty(nid))
                                    {
                                        if (objdata[nid].hasOwnProperty('texture'))
                                            ctx2.drawImage(objdata[nid].texture, ps*(pmax-pw)/2 + ps*ix,
                                                ps*(pmax-ph)/2 + ps*iy, ps, ps);
                                        else
                                        {
                                            ctx2.fillStyle = rgb_to_style(...objdata[nid].notexture);
                                            ctx2.fillRect(ps*(pmax-pw)/2 + ps*ix, ps*(pmax-ph)/2 + ps*iy, ps, ps);
                                        }
                                    }
                                }
                            }

                        }
                    }
                    let ctx1 = rounded_image(ctx2.canvas);
                    ctx.drawImage(ctx1.canvas, local_ws, local_ws + (ss*oy));
                    ctx1.canvas.remove();
                    ctx2.canvas.remove();
                }
                else
                {
                    ctx.fillStyle = 'rgba(102, 102, 102, 0.5)';
                    roundRect(ctx, local_ws, local_ws + (ss*oy), img_box, img_box, 2+(ss*(8-2)));
                }
                break;
            default:
                ctx.fillStyle = 'rgba(102, 102, 102, 0.5)';
                roundRect(ctx, local_ws, local_ws + (ss*oy), img_box, img_box, 2+(ss*(8-2)));
                break;
        }

        let iip = img_box * (1-target.instrmenu_imgbox_ratio);

        ctx.imageSmoothingEnabled = false;
        if (sprites.instruments.hasOwnProperty(target.gvars[0].current_instrument.type))
        {
            ctx.drawImage(sprites.instruments[target.gvars[0].current_instrument.type],
                local_ws+iip, local_ws+(target.show_step*oy)+iip, img_box-iip-iip, img_box-iip-iip);
        }
        return ctx;
    },
    draw_instrument_hotbar: function(target)
    {
        let objdata = target.gvars[0].objdata;
        let idlist = target.gvars[0].idlist;
        let get_text_width = target.gvars[0].get_text_width;
        let rgb_to_style = target.gvars[0].rgb_to_style;
        let roundRect = target.gvars[0].roundRect;
        let sprites = target.gvars[0].sprites;
        let ctx = target.gvars[0].document.createElement('canvas').getContext('2d');
        ctx.canvas.width = target.width_part;
        ctx.canvas.height = target.hotbar_height;

        let wb = target.window_border;
        let wb2 = wb/2;

        let ox = 0

        ctx.lineWidth = wb;
        ctx.imageSmoothingEnabled = false;
        for (let i=1; i<=10; i++)
        {
            let mi = i%10;
            ctx.strokeStyle = mi === target.hotbar_slot ? '#7f7f7f' : '#1a1a1a';
            ctx.strokeRect(ox+wb2, wb2, target.hotbar_height-wb, target.hotbar_height-wb);

            let instrument = target.hotbar[mi];

            switch (instrument.type) {
                case 'brush':
                    if (instrument.hasOwnProperty('cell'))
                    {
                        let celldata = objdata[idlist[instrument.cell]];
                        if (celldata.hasOwnProperty('texture') && celldata.texture_ready)
                            ctx.drawImage(celldata.texture,
                                ox+wb, wb, target.hotbar_height-(2*wb), target.hotbar_height-(2*wb));
                        else
                        {
                            ctx.fillStyle = rgb_to_style(...celldata.notexture);
                            ctx.fillRect(ox+wb, wb, target.hotbar_height-(2*wb), target.hotbar_height-(2*wb));
                        }
                    }
                    else
                    {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                        ctx.fillRect(ox+wb, wb, target.hotbar_height-(2*wb), target.hotbar_height-(2*wb));
                    }
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    switch (instrument.shape)
                    {
                        case 'round':
                            ctx.beginPath();
                            ctx.ellipse(ox + target.hotbar_height / 2, target.hotbar_height / 2,
                                (target.hotbar_height-(4*wb)) / 2, (target.hotbar_height-(4*wb)) / 2,
                                0, 0, 2 * Math.PI);
                            ctx.fill();
                            break;
                        case 'square':
                        default:
                            ctx.fillRect(ox+(2*wb), 2*wb, target.hotbar_height-(4*wb), target.hotbar_height-(4*wb));
                            break;
                    }
                    let textsize = target.hotbar_height-(4*wb);
                    let textwidth = get_text_width('' + instrument.scale, `${textsize}px "Montserrat"`);
                    engine.draw_text(ctx, ox + target.hotbar_height / 2, target.hotbar_height / 2, '' + instrument.scale,
                        'fill', textsize * Math.min(1, textsize / textwidth), 'center', 'center',
                        'rgba(255, 255, 255, 0.5)', '"Montserrat"');
                    break;
                case 'paste':
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillRect(ox+wb, wb, target.hotbar_height-(2*wb), target.hotbar_height-(2*wb));
                    if (instrument.hasOwnProperty('pastedata'))
                    {
                        let pw = instrument.pastewidth; let ph = instrument.pasteheight;
                        let pmax = Math.max(pw, ph);
                        let ps = (target.hotbar_height-(2*wb))/pmax;
                        for (let ix=0; ix<pw; ix++)
                        {
                            for (let iy=0; iy<ph; iy++)
                            {
                                if (instrument.pastedata.hasOwnProperty(iy))
                                {
                                    if (instrument.pastedata[iy].hasOwnProperty(ix))
                                    {
                                        let nid = instrument.pastedata[iy][ix];
                                        ctx.fillStyle = rgb_to_style(...objdata[nid].notexture);
                                        ctx.fillRect(ox + wb + ps*(pmax-pw)/2 + ps*ix,
                                            wb + ps*(pmax-ph)/2 + ps*iy, ps, ps);
                                    }
                                }

                            }
                        }
                    }
                    break;
                default:
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillRect(ox+wb, wb, target.hotbar_height-(2*wb), target.hotbar_height-(2*wb));
                    break;
            }

            if (sprites.instruments.hasOwnProperty(instrument.type))
                ctx.drawImage(sprites.instruments[instrument.type],
                    ox+(2*wb), 2*wb, target.hotbar_height-(4*wb), target.hotbar_height-(4*wb));

            engine.draw_text(ctx, ox + target.hotbar_height - Math.round(1.5*wb), Math.round(1.5*wb), `${mi}`,
                'fill', (target.hotbar_height-(2*wb))/2, 'right', 'top', 'rgba(255, 255, 255, 0.5)', '"Montserrat"');

            ox += target.hotbar_height;
        }

        return ctx;
    },
    canvas_resize: function(target, width, height)
    {
        let display = target.gvars[0].display;
        let measure = Math.min(height/target.gvars[0].HEIGHT, width/target.gvars[0].WIDTH);
        target.window_spacing = target.window_spacing_origin * measure;
        target.window_margin = target.window_margin_origin * measure;
        target.display_scale = target.display_scale_origin * measure;
        target.window_border = target.window_border_origin * measure;
        target.objmenu_heading_size = target.objmenu_heading_size_origin * measure;
        target.instrmenu_heading_size = target.instrmenu_heading_size_origin * measure;
        target.instrmenu_heading_size_minimized = target.instrmenu_heading_size_minimized_origin * measure;
        target.border_width = target.border_width_origin * measure;
        target.object_name_size = target.object_name_size_origin * measure;
        target.descmenu_name_size = target.descmenu_name_size_origin * measure;
        target.descmenu_properties_size = target.descmenu_properties_size_origin * measure;
        target.descmenu_description_size = target.descmenu_description_size_origin * measure;
        target.descmenu_border = target.descmenu_border_origin * measure;
        target.descmenu_padding = target.descmenu_padding_origin * measure;
        target.descmenu_divider = target.descmenu_divider_origin * measure;

        let en = target.element_number;
        let ws = target.window_spacing;
        let wm = target.window_margin;
        let ds = target.display_scale;
        let wb = target.window_border;
        target.width_part = Math.round((display.cw() - 4*wm)/3); // equal parts of screen's width (currently a third)
        target.objmenu_height = display.ch() - (2*wm); // object menu height
        target.instrmenu_height = display.ch()/3 - (3*wm); // instrument menu height
        target.instrmenu_height_minimized = wb+ws+target.instrmenu_heading_size_minimized;
        target.hotbar_height = target.width_part/10;
        target.element_border = Math.round((target.width_part-(2*ws)-(en*ds))/(en-1));

        target.desc_window_width =  target.desc_window_width_origin * measure;
        target.objmenu_surface = this.draw_objmenu(target);
    },
});

module.exports = {EntFieldSUI};
},{"../../nle.cjs":17}],11:[function(require,module,exports){
(function (global){(function (){
const engine = require("../../nle.cjs");
const comp = require('../../compiler.cjs');

const lead0 = function(number, targetlength)
{
    number = number.toString();
    while (number.length < targetlength) number = "0" + number;
    return number;
}

const EntGlobalConsole = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        target.log = [];
        target.logger_i = 0;
        target.showtimes = [];
        target.max_showtime = 7.0;
        target.fade_at_showtime = 2.0;
        target.showtimes_start_at = 0;

        target.fps_size_origin = target.gvars[0].fontsize_default/6;
        target.fps_size = target.fps_size_origin;

        target.log_size_origin = target.gvars[0].fontsize_default/6;
        target.log_size = target.log_size_origin;

        target.padding_size_origin = 2;
        target.padding_size = target.padding_size_origin;

        target.fps_records_number = 100;
        target.fps_records = new Array(target.fps_records_number).fill(0);
        target.fps_records_index = 0;
    },
    step: function (target)
    {
        let deltatime = target.gvars[0].deltatime;
        for (let i = target.showtimes_start_at; i<target.showtimes.length; i++)
        {
            target.showtimes[i] = Math.max(target.showtimes[i]-deltatime, 0.0);
            if (target.showtimes[i] === 0.0)
            {
                target.showtimes_start_at++;
            }
        }

        while (target.logger_i < target.gvars[0].logger.length)
        {
            let log = target.gvars[0].logger[target.logger_i];
            let type_string = comp.LoggerClass.types[log[0]];//'ERROR';
            let h = log[1].getHours();
            let m = log[1].getMinutes();
            let s = log[1].getSeconds();
            let time_string = lead0(h, 2) + ':' + lead0(m, 2) + ':' + lead0(s, 2);
            let prefix = `[${type_string} ${time_string}]` + ' ';
            let prefix_l = prefix.length;
            //process.stdout.write(prefix + log[2]);
            global.console.log(prefix + log[2]);
            target.log.push(prefix + log[2]);
            target.showtimes.push(target.max_showtime);
            for (let line of log.slice(3))
            {
                //process.stdout.write(' '.repeat(prefix_l) + line);
                global.console.log(' '.repeat(prefix_l) + line);
                target.log.push(' '.repeat(prefix_l) + line);
                target.showtimes.push(target.max_showtime);
            }
            target.logger_i++;
        }

        target.fps_records[target.fps_records_index] = (deltatime !== 0) ? Math.round(1/deltatime) : 0;
        target.fps_records_index = (target.fps_records_index+1) % target.fps_records_number;
    },
    draw_after: function (target, surface)
    {
        engine.draw_text(surface, surface.canvas.width-target.padding_size, target.padding_size,
            `${Math.round(target.fps_records.reduce((s, a)=> s + a, 0) / target.fps_records_number)} FPS`,
            'fill', target.fps_size, 'right', 'top', 'white', '"DejaVu Sans Mono"');

        for (let i = target.showtimes_start_at; i < target.log.length; i++)
        {
            let si = i - target.showtimes_start_at;
            let alpha = Math.min(1.0, target.showtimes[i]/target.fade_at_showtime);
            let color = `rgba(255, 255, 255, ${alpha})`;
            engine.draw_text(surface, target.padding_size,
                surface.canvas.height-100+((i-target.log.length)*target.log_size),
                target.log[i], 'fill', target.log_size, 'left', 'bottom', color, '"DejaVu Sans Mono"');
        }

        if (!target.gvars[0].has_focus)
            engine.draw_text(surface, target.padding_size, surface.canvas.height-100, 'Window is not focused', 'fill',
                target.log_size, 'left', 'bottom', 'rgba(255, 50, 50, 0.6)', '"DejaVu Sans Mono"');
    },
    canvas_resize: function(target, width, height)
    {
        let measure = Math.min(height/150, width/300);
        target.fps_size = target.fps_size_origin * measure;
        target.padding_size = target.padding_size_origin * measure;
        target.log_size = target.log_size_origin * measure;
    },
});

module.exports = {EntGlobalConsole};
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../compiler.cjs":3,"../../nle.cjs":17}],12:[function(require,module,exports){
const engine = require("../../nle.cjs");

const EntMMBG = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        target.ox = 0;
        target.oy = 0;
        target.angle = Math.random()*360;
        target.speed = 64;
        target.colors = target.gvars[0].idlist.map(value => target.gvars[0].objdata[value].notexture);
        target.matrix = Array(100).fill().map(()=>
            Array(100).fill().map(()=>
                target.colors[Math.floor(Math.random()*target.colors.length)]
            )
        );
        target.controls_strings = [target.gvars[0].get_locstring('mm/controls/heading'),
            ...[...Array(8).keys()].map(val => target.gvars[0].get_locstring('mm/controls/'+(val+1)))];
        target.controls_keys = [null, 'WASD', 'QE', 'RT', 'Space', 'C', 'Tab', 'LMB', 'Esc'];

        target.controls_text_size_origin = 32;
        target.controls_text_size = target.controls_text_size_origin;

        target.controls_padding_origin = 16;
        target.controls_padding = target.controls_padding_origin;
    },
    step: function(target)
    {
        let deltatime = target.gvars[0].deltatime;
        let bordersize = 8;
        let cellsize = 32;
        let fullsize = cellsize+bordersize;
        target.ox = engine.wrap(target.ox+engine.lengthdir_x(target.speed*deltatime, target.angle),
            0, fullsize*target.matrix[0].length);
        target.oy = engine.wrap(target.oy+engine.lengthdir_y(target.speed*deltatime, target.angle),
            0, fullsize*target.matrix.length);
    },
    draw_before: function(target, surface)
    {
        surface.drawImage(
            this.draw_board(target, target.ox, target.oy,
                surface.canvas.width, surface.canvas.height, target.matrix, 0, 0).canvas,
            0, 0);
        surface.fillStyle = 'rgba(0, 0, 0, 0.3)';
        surface.fillRect(0, 0, surface.canvas.width, surface.canvas.height);
        for (let i = 0; i < target.controls_strings.length; i++)
        {
            let txt = target.controls_strings[target.controls_strings.length - 1 - i];
            engine.draw_text(surface, surface.canvas.width - target.controls_padding,
                surface.canvas.height - target.controls_padding - (target.controls_text_size*1.0625)*i,
                (i !== target.controls_strings.length-1)
                    ? `${target.controls_keys[target.controls_keys.length - 1 - i]} - ${txt}`
                    : txt,
                'fill', target.controls_text_size, 'right', 'bottom', 'white', '"Montserrat", serif')
        }
    },
    canvas_resize: function(target, width, height)
    {
        let measure = Math.min(height/target.gvars[0].HEIGHT, width/target.gvars[0].WIDTH);
        target.controls_text_size = target.controls_text_size_origin * measure;
        target.controls_padding = target.controls_padding_origin * measure;
    },
    draw_board: function(target, x, y, width, height, matrix)
    {
        let bordersize = 8;
        let cellsize = 32;
        let fullsize = cellsize+bordersize;
        let ox = engine.wrap(x, 0, fullsize);
        let oy = engine.wrap(y, 0, fullsize);
        let surface = document.createElement('canvas').getContext('2d');
        surface.canvas.width = width;
        surface.canvas.height = height;
        surface.fillStyle = target.gvars[0].rgb_to_style(...target.gvars[0].linecolor_infield);
        surface.fillRect(0, 0, surface.canvas.width, surface.canvas.height);
        let ix = engine.wrap(Math.floor(-x/fullsize), 0, matrix[0].length);
        for (let mx = ox-fullsize; mx < width; mx += fullsize)
        {
            let iy = engine.wrap(Math.floor(-y/fullsize), 0, matrix.length);
            for (let my = oy-fullsize; my < height; my += fullsize)
            {
                surface.fillStyle = target.gvars[0].rgb_to_style(...matrix[iy][ix]);
                surface.fillRect(mx+bordersize, my+bordersize, cellsize, cellsize);
                iy = engine.wrap(iy+1, 0, matrix.length);
            }
            ix = engine.wrap(ix+1, 0, matrix[0].length);
        }
        return surface;
    },
});

module.exports = {EntMMBG};
},{"../../nle.cjs":17}],13:[function(require,module,exports){
const engine = require("../../nle.cjs");

const EntMMButton = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        target.pressed = false;
        target.text = '???';
        target.trigger = ()=>{};
        target.box_width = 256;
        target.box_height = 40;
        target.triangle_width = 20;
        target.const_x = 0;
        target.const_y = 0;
        target.offset_animate = false;
        target.offset_x = 0;
        target.offset_y = 0;
        target.mouse_on = false;
    },
    step: function(target)
    {
        let move = false;

        let interpolate = function(what_to)
        {
            let new_offset = engine.linear_interpolation(what_to, 0, 3);
            if (new_offset !== what_to)
            {
                what_to = new_offset;
                if (Math.round(what_to*1000)/1000 === 0.0) what_to = 0;
                move = true;
            }
            return what_to;
        };

        if (target.offset_animate)
        {
            target.offset_x = interpolate(target.offset_x);
            target.offset_y = interpolate(target.offset_y);
        }
    },
    draw: function(target, surface)
    {
        let bx = target.const_x + target.offset_x;
        let by = target.const_y + target.offset_y;
        let bw = target.box_width;
        let bh = target.box_height;
        let tw = target.triangle_width;
        let draw_box = function(surface, style, stroke = false)
        {
            surface.beginPath();
            surface.moveTo(bx+tw, by);
            surface.lineTo(bx+tw+bw+tw, by);
            surface.lineTo(bx+tw+bw, by+bh);
            surface.lineTo(bx, by+bh);
            surface.lineTo(bx+tw, by);
            if (stroke)
            {
                surface.lineWidth = 3;
                surface.strokeStyle = style;
                surface.stroke();
            }
            else
            {
                surface.fillStyle = style;
                surface.fill();
            }
        };

        draw_box(surface, 'rgba(0,0,0,0.7)');
        draw_box(surface, target.mouse_on ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)', true);

        engine.draw_text(surface, bx+tw+bw/2, by+bh/2, target.text, 'fill', bh-4, 'center', 'center', 'white',
            '"Montserrat", serif');

    },
    mouse_move: function(target)
    {
        let bx = target.const_x + target.offset_x;
        let by = target.const_y + target.offset_y;
        let bw = target.box_width;
        let bh = target.box_height;
        let tw = target.triangle_width;
        let mx = target.gvars[0].mx;
        let my = target.gvars[0].my;
        let in_rect = (
            (bx+tw <= mx && mx <= bx+tw+bw)
            && (by <= my && my <= by+bh)
        );
        let in_tri1 = (
            (bx <= mx && mx <= bx+tw)
            && (by <= my && my <= by+tw)
            && (((mx-bx)/tw)+((my-by)/bh) >= 1)
        );
        let in_tri2 = (
            (bx+tw+bh <= mx && mx <= bx+tw+bh+tw)
            && (by <= my && my <= by+tw)
            && (((mx-bx-tw-bh)/tw)+((my-by)/bh) <= 1)
        );
        target.mouse_on = (in_rect || in_tri1 || in_tri2);
    },
    mouse_down: function(target, buttonid)
    {
        if (target.mouse_on && buttonid === engine.LMB) target.pressed = true;
    },
    mouse_up: function(target, buttonid)
    {
        if (target.mouse_on && target.pressed) target.trigger();
        target.pressed = false;
    },
});

module.exports = {EntMMButton};
},{"../../nle.cjs":17}],14:[function(require,module,exports){
const engine = require("../../nle.cjs");
const EntMMButton = require("./button.cjs").EntMMButton;

const EntMMController = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        let display = target.gvars[0].display;
        // target.time = 0;
        // target.time_paused = false;
        let create_button = function(width, height, text, x_offset, y_offset, trigger)
        {
            let bttn = EntMMButton.create_instance(target.gvars);
            bttn.box_width = width;
            bttn.box_height = height;
            bttn.text = target.gvars[0].get_locstring(text);
            bttn.const_x = (display.cw() - bttn.box_width)/2 - bttn.triangle_width + x_offset;
            bttn.const_y = (display.ch() - bttn.box_height)/2 + y_offset;
            bttn.offset_x = -display.cw()/2 - bttn.box_width - bttn.triangle_width;
            bttn.trigger = trigger;
            return bttn;
        }

        target.play_button_width_origin = 256+32;
        target.play_button_width = target.play_button_width_origin;
        target.play_button_height_origin = 80;
        target.play_button_height = target.play_button_height_origin;
        target.play_button_yoffset_origin = -60;
        target.play_button_yoffset = target.play_button_yoffset_origin;
        target.exit_button_width_origin = 256+32;
        target.exit_button_width = target.exit_button_width_origin;
        target.exit_button_height_origin = 80;
        target.exit_button_height = target.exit_button_height_origin;
        target.exit_button_yoffset_origin = 60;
        target.exit_button_yoffset = target.exit_button_yoffset_origin;
        target.button_triangle_width_origin = 20;
        target.button_triangle_width = target.button_triangle_width_origin;

        target.play_button = create_button(target.play_button_width, target.play_button_height, 'mm/play_button', 0,
            target.play_button_yoffset, ()=>
            {
                target.gvars[0].mm_startmenu.show = true;
                target.play_button.offset_animate = false;
                target.exit_button.offset_animate = false;
                target.play_button.offset_x = -display.cw()/2 - target.play_button.box_width
                    - target.play_button.triangle_width;
                target.exit_button.offset_x = -display.cw()/2 - target.exit_button.box_width
                    - target.exit_button.triangle_width;
                target.time = 4;
                target.time_paused = true;
                target.gvars[0].mm_intro.show_title = false;
            }
        );

        target.exit_button = create_button(target.exit_button_width, target.exit_button_height, 'mm/exit_button', 0,
            target.exit_button_yoffset, ()=>{nw.Window.get().close()}
        );
    },
    step: function(target)
    {
        let deltatime = target.gvars[0].deltatime;
        if (!target.time_paused) target.time += deltatime;
        if (target.time > 5)
        {
            target.play_button.offset_animate = true;
            target.exit_button.offset_animate = true;
        }
    },
    kb_down: function(target, key)
    {
        target.time = Math.max(4, target.time);
    },
    mouse_down: function(target, key)
    {
        target.time = Math.max(4, target.time);
    },
    room_start: function(target, prev_room)
    {
        target.time = prev_room === target.gvars[0].room_field ? 5 : 0;
        target.time_paused = false;
    },
    canvas_resize: function(target, width, height)
    {
        let measure = Math.min(height/target.gvars[0].HEIGHT, width/target.gvars[0].WIDTH);

        target.play_button_width = target.play_button_width_origin * measure;
        target.play_button_height = target.play_button_height_origin * measure;
        target.play_button_yoffset = target.play_button_yoffset_origin * measure;

        target.exit_button_width = target.exit_button_width_origin * measure;
        target.exit_button_height = target.exit_button_height_origin * measure;
        target.exit_button_yoffset = target.exit_button_yoffset_origin * measure;

        target.button_triangle_width = target.button_triangle_width_origin * measure;

        target.play_button.box_width = target.play_button_width;
        target.play_button.box_height = target.play_button_height;

        target.play_button.const_x = (width - target.play_button.box_width)/2
            - target.play_button.triangle_width;
        target.play_button.const_y = (height - target.play_button.box_height)/2 + target.play_button_yoffset;
        target.play_button.triangle_width = target.button_triangle_width;

        target.exit_button.box_width = target.exit_button_width;
        target.exit_button.box_height = target.exit_button_height;

        target.exit_button.const_x = (width - target.exit_button.box_width)/2
            - target.exit_button.triangle_width;
        target.exit_button.const_y = (height - target.exit_button.box_height)/2 + target.exit_button_yoffset;
        target.exit_button.triangle_width = target.button_triangle_width;

        if (target.play_button.offset_animate)
            target.play_button.offset_x = -width/2 - target.play_button.box_width - target.play_button.triangle_width;
        if (target.exit_button.offset_animate)
            target.exit_button.offset_x = -width/2 - target.exit_button.box_width - target.exit_button.triangle_width;
    },
});

module.exports = {EntMMController};
},{"../../nle.cjs":17,"./button.cjs":13}],15:[function(require,module,exports){
const engine = require("../../nle.cjs");

const EntMMIntro = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        /*target.icon2 = new Image();
        target.icon2.src = 'https://www.gnu.org/graphics/gplv3-or-later-sm.png';*/
        target.time = 0.0;

        target.licence_text_size_origin = 12;
        target.licence_text_size = target.licence_text_size_origin;

        target.name_text_size_origin = 100;
        target.name_text_size = target.name_text_size_origin;

        target.author_text_size_origin = 60;
        target.author_text_size = target.author_text_size_origin;
    },
    room_start: function(target)
    {
        target.show_title = true;
    },
    step: function(target)
    {
        target.time += target.gvars[0].deltatime;
    },
    draw_after: function(target, surface)
    {
        let moment_func = (start, end) => engine.range2range(engine.clamp(target.time, start, end), start, end, 0, 1);

        let moment2 = Math.pow(Math.cos(moment_func(4,4.5)/2*Math.PI), 2/3);
        let moment3 = 1-Math.pow(Math.sin(moment_func(4.5,5)/2*Math.PI), 2/3);
        //moment3 = Math.sin(moment3/2*Math.PI);
        surface.beginPath();
        surface.moveTo(0, 0);
        surface.lineTo(surface.canvas.width*moment3, 0);
        surface.lineTo(surface.canvas.width*moment3, surface.canvas.height*moment2);
        surface.lineTo(surface.canvas.width*moment2, surface.canvas.height*moment3);
        surface.lineTo(0, surface.canvas.height*moment3);
        surface.fillStyle = 'black';
        surface.fill();

        let moment1 = moment_func(0, 2)*(1-moment_func(4, 5));
        let moment4 = Math.pow(Math.sin(moment_func(4,5)*Math.PI/2), 2/3);
        if (target.show_title)
            engine.draw_text(surface, surface.canvas.width/2, surface.canvas.height*((2-moment4)/4),
                'Casual Playground', 'fill', target.name_text_size, 'center', 'center', `rgba(255, 255, 255, 1)`,
                '"Montserrat", serif');
        engine.draw_text(surface, surface.canvas.width/2, surface.canvas.height/2 + target.author_text_size*1.5,
            'by NotLexa', 'fill', target.author_text_size, 'center', 'top', `rgba(255, 255, 255, ${moment1})`,
            '"Montserrat", serif');

        let draw_copyright = function (txt, y)
        {
            engine.draw_text(surface, surface.canvas.width/2, surface.canvas.height - y,
                txt, 'fill', target.licence_text_size, 'center', 'bottom',
                `rgba(255, 255, 255, ${moment1})`, '"Montserrat", sans-serif');
        };

        let copyright_offset = 5;
        let copyright_spacing = target.licence_text_size+2;

        draw_copyright("Casual Playground / " +
            'Copyright © 2022 Alexey Kozhanov', copyright_offset+(3*copyright_spacing));
        draw_copyright('This program is free software: you can redistribute it and/or modify ' +
            'it under the terms of the GNU General Public License as published by ' +
            'the Free Software Foundation, either version 3 of the License, or ' +
            '(at your option) any later version.', copyright_offset+(2*copyright_spacing));
        draw_copyright('This program is distributed in the hope that it will be useful, ' +
            'but WITHOUT ANY WARRANTY; without even the implied warranty of ' +
            'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the ' +
            'GNU General Public License for more details.', copyright_offset+copyright_spacing);
        draw_copyright('You should have received a copy of the GNU General Public License along with this program.' +
            'If not, see <https://www.gnu.org/licenses/>.', copyright_offset);
        /*surface.drawImage(target.icon2,
            surface.canvas.width-target.icon2.width-4,
            surface.canvas.height-target.icon2.height-copyright_offset-(14*4));*/

        if (4 <= target.time && target.time < 5)
        {
            let prerender = (fonts, weight_style='')=>{
                fonts.forEach((name)=>{engine.draw_text(surface, 0, 0, 'abc', 'fill', 16, 'left', 'top',
                    'rgba(0,0,0,0)', name, weight_style)})};
            prerender(['"DejaVu Sans Mono"', '"Montserrat"', '"Source Sans Pro"']);
            prerender(['"Source Sans Pro"'], 'italic');
        }
    },
    kb_down: function(target, key)
    {
        target.time = Math.max(4, target.time);
    },
    mouse_down: function(target, key)
    {
        target.time = Math.max(4, target.time);
    },
    canvas_resize: function(target, width, height)
    {
        let measure = Math.min(height/target.gvars[0].HEIGHT, width/target.gvars[0].WIDTH);
        target.licence_text_size = target.licence_text_size_origin * measure;
        target.name_text_size = target.name_text_size_origin * measure;
        target.author_text_size = target.author_text_size_origin * measure;
    }
});

module.exports = {EntMMIntro};
},{"../../nle.cjs":17}],16:[function(require,module,exports){
const engine = require("../../nle.cjs");
const EntMMButton = require("./button.cjs").EntMMButton;
const fs = require('fs');
const path = require('path');

const EntMMStartMenu = new engine.Entity({
    create: function(target, gvars)
    {
        target.gvars = gvars;
        let load_modlist = target.gvars[0].load_modlist;
        let modsfolder = target.gvars[0].modsfolder;
        let objdata = target.gvars[0].objdata;
        let idlist = target.gvars[0].idlist;
        let loc = target.gvars[0].loc;
        target.modlist = load_modlist(modsfolder).map(value => ({name: value, enabled: false}));
        target.line_height_origin = 30;
        target.line_height = target.line_height_origin;
        target.line_separation_origin = 2;
        target.line_separation = target.line_separation_origin;
        target.window_width_origin = 512+128;
        target.window_width = target.window_width_origin;
        target.window_height_origin = 512+256+64+32;
        target.window_height = target.window_height_origin;
        target.border_width_origin = 2;
        target.border_width = target.border_width_origin;
        target.inline_padding_origin = 4;
        target.inline_padding = target.inline_padding_origin;
        target.subwindow_padding = Math.round(target.window_width*0.05);
        target.subwindow_width = target.window_width-(2*target.subwindow_padding);
        target.mods_height = Math.round((target.window_height-(4*target.subwindow_padding))*3/6);
        target.settings_height = Math.round((target.window_height-(4*target.subwindow_padding))*2/6);
        // target.show_step = 0;
        // target.show = false;
        // target.scroll = [0, 0];
        // target.old_scroll = [0, 0];
        // target.new_scroll = [0, 0];
        // target.scroll_step = [0, 0];
        target.max_scroll_step = [0.25, 0.25];
        target.settings = [
            {
                name: 'board_width', type: 'integer-scale', value: 32, min: 1, max: 999, step: 1, number_count: 3,
                display_name: target.gvars[0].get_locstring('start_menu/settings/board_width'),
            },
            {
                name: 'board_height', type: 'integer-scale', value: 32, min: 1, max: 999, step: 1, number_count: 3,
                display_name: target.gvars[0].get_locstring('start_menu/settings/board_height'),
            },
        ];
        target.settings_consts = {
            integer_scale: {
                triangle_height: target.line_height - (2*target.inline_padding),
                triangle_width: target.line_height/2 - target.inline_padding,
                spacing: target.inline_padding/2,
            },
        };

        let create_button = function(width, height, text, x_offset, y_offset, trigger)
        {
            let display = target.gvars[0].display;
            let bttn = EntMMButton.create_instance(target.gvars);
            bttn.box_width = width;
            bttn.box_height = height;
            bttn.text = target.gvars[0].get_locstring(text);
            bttn.const_x = (display.cw() - bttn.box_width)/2 - bttn.triangle_width + x_offset;
            bttn.const_y = (display.ch() - target.window_height)/2 + y_offset;
            bttn.trigger = trigger;
            return bttn;
        };

        target.start_button_width = target.window_width*0.8;
        target.start_button_height = Math.round((target.window_height-(4*target.subwindow_padding))/6);
        target.start_button_triangle_width_origin = 20;
        target.start_button_triangle_width = target.start_button_triangle_width_origin;

        target.start_button = create_button(target.start_button_width, target.start_button_height, 'start_menu/start_button',
            0, 3*target.subwindow_padding + target.mods_height + target.settings_height, ()=>
            {
                gvars[0].board_width = target.settings.filter(x => x.name === 'board_width')[0].value;
                gvars[0].board_height = target.settings.filter(x => x.name === 'board_height')[0].value;

                gvars[0].objdata = {};
                objdata = gvars[0].objdata;
                gvars[0].idlist = [];
                idlist = gvars[0].idlist;

                let loaded_mod = target.gvars[0].load_mod(path.join('core', 'corecontent'), 'Casual Playground', true);
                idlist.push(...Object.keys(loaded_mod));
                for (let k in loaded_mod) objdata[k] = loaded_mod[k];

                for (let mod of target.modlist.filter(x => x.enabled))
                {
                    let loaded_mod = target.gvars[0].load_mod(path.join('data', 'addons', mod.name), mod.name, false);
                    idlist.push(...Object.keys(loaded_mod));
                    for (let k in loaded_mod) objdata[k] = loaded_mod[k];
                }

                //engine.change_current_room(room_field);
                target.gvars[0].current_room.do_end();
                target.gvars[0].current_room = target.gvars[0].room_field;
                target.gvars[0].current_room.do_start();
            }
        );
    },
    room_start: function (target)
    {
        target.show_step = 0;
        target.show = false;
        target.scroll = [0, 0];
        target.old_scroll = [0, 0];
        target.new_scroll = [0, 0];
        target.scroll_step = [0, 0];
    },
    step: function(target)
    {
        let deltatime = target.gvars[0].deltatime;
        for (let i = 0; i < target.scroll.length; i++)
        {
            target.scroll_step[i] = engine.clamp(target.scroll_step[i] + deltatime, 0, target.max_scroll_step[i]);
            let step = engine.range2range(target.scroll_step[i], 0, target.max_scroll_step[i], 0, 1);
            step = Math.sin(Math.PI * step / 2);
            target.scroll[i] = target.old_scroll[i] + (target.new_scroll[i] - target.old_scroll[i]) * step;
        }

        let move = false;
        let interpolate = function(what_to, to)
        {
            let new_offset = engine.linear_interpolation(what_to, to, 3);
            if (new_offset !== what_to)
            {
                what_to = new_offset;
                if (Math.round(what_to*1000)/1000 === to) what_to = to;
                move = true;
            }
            return what_to;
        };

        target.show_step = interpolate(target.show_step, Math.floor(target.show));
        if (move) this.mouse_move(target);
    },
    draw: function(target, surface)
    {
        let ww = target.window_width;
        let wh = target.window_height;
        let border = '#333'; // border color
        let bg = '#666'; // bg color
        let bg_darker = '#555'; // bg darker color
        let bg_lighter = '#777'; // bg lighter color
        let textcolor = 'white'; // mod text color
        let sww = target.subwindow_width; // subwindow width
        let mh = target.mods_height; // mods window height
        let sh = target.settings_height; // settings window height
        let padding = target.subwindow_padding; // subwindow padding
        let lh = target.line_height; // mod line height
        let bw = target.border_width;

        target.start_button.const_x = -surface.canvas.width/2 - target.start_button.box_width/2
            - target.start_button.triangle_width + (surface.canvas.width*target.show_step);

        let surf1 = document.createElement('canvas').getContext('2d');
        surf1.canvas.width = ww;
        surf1.canvas.height = wh;
        surf1.fillStyle = bg;
        surf1.lineWidth = bw;
        surf1.strokeStyle = border;
        target.gvars[0].roundRect(surf1, bw, bw,
            ww-(2*bw), wh-(2*bw), bw*2, false);
        target.gvars[0].roundRect(surf1, 0, 0, ww, wh, bw*2, true);

        let surf2 = this.draw_mod_list(target);
        surf1.lineWidth = bw;
        surf1.strokeStyle = border;
        surf1.strokeRect(padding-bw, padding-bw, sww+bw, mh+bw);
        if (surf2.canvas.width !== 0 && surf2.canvas.height !== 0)
            surf1.drawImage(surf2.canvas, padding, padding);
        surf2.canvas.remove();

        let surf3 = this.draw_board_settings(target);
        surf1.lineWidth = bw;
        surf1.strokeStyle = border;
        surf1.strokeRect(padding-bw, mh+(2*padding), sww+bw, sh+bw);
        if (surf3.canvas.width !== 0 && surf3.canvas.height !== 0)
            surf1.drawImage(surf3.canvas, padding, padding*2 + mh + bw);
        surf3.canvas.remove();

        /*surf.globalCompositeOperation = 'destination-in';
        surf.fillStyle = 'rgba(255, 255, 255, 0.95)';
        surf.fillRect(0, 0, ww, wh);
        surf.globalCompositeOperation = 'source-over';*/
        surface.drawImage(surf1.canvas, -surface.canvas.width/2 - ww/2 + (surface.canvas.width*target.show_step),
            (surface.canvas.height-wh)/2);

        surf1.canvas.remove();
    },
    mouse_down: function(target, mb)
    {
        let get_text_width = target.gvars[0].get_text_width;
        let display = target.gvars[0].display;
        let oneline = (target.line_height + target.line_separation);
        switch (mb)
        {
            case engine.WHEELDOWN:
            case engine.WHEELUP:
            {
                let padding = target.subwindow_padding;
                let subwindow_xoffset = (display.cw()-target.window_width)/2 + padding;
                let modswindow_yoffset = (display.ch()-target.window_height)/2 + padding;
                let move = function(xoffset, yoffset, wwidth, wheight, ind, linesnum)
                {
                    let mouse_x = target.gvars[0].mx - xoffset;
                    let mouse_y = target.gvars[0].my - yoffset;
                    if (0 <= mouse_x && mouse_x <= wwidth && 0 <= mouse_y && mouse_y <= wheight)
                    {
                        let limit = (oneline * linesnum < wheight) ? 0 : wheight;
                        target.new_scroll[ind] = Math.max(0, engine.clamp(target.new_scroll[ind] + scroll_delta, 0,
                            linesnum * oneline - limit));
                        target.old_scroll[ind] = target.scroll[ind];
                        target.scroll_step[ind] = 0;
                    }
                }

                // Mod list
                move(subwindow_xoffset, modswindow_yoffset, target.subwindow_width, target.mods_height,
                    0, target.modlist.length);

                // Setting list
                move(subwindow_xoffset, modswindow_yoffset + padding + target.mods_height, target.subwindow_width,
                    target.settings_height, 1, target.settings.length);
                break;
            }
            case engine.LMB:
            {
                let padding = target.subwindow_padding;
                let ip = target.inline_padding;

                let click = function(xoffset, yoffset, wwidth, wheight, ind, func)
                {
                    let mouse_x = target.gvars[0].mx - xoffset;
                    let mouse_y = target.gvars[0].my - yoffset;
                    let iy = Math.floor(mouse_y/oneline) + Math.floor(target.scroll[ind]/oneline);
                    let oy = mouse_y % oneline;
                    if (0 <= mouse_x && mouse_x <= wwidth && 0 <= mouse_y && mouse_y <= wheight)
                        func(iy, mouse_x, oy);
                };

                // Mod list
                click(
                    (display.cw()-target.window_width)/2 + padding, (display.ch()-target.window_height)/2 + padding,
                    target.subwindow_width, target.mods_height, 0, (lineindex, ox, oy)=>
                    {
                        if (ip <= ox && ox <= target.line_height-(2*ip) && ip <= oy && oy <= target.line_height-(2*ip))
                            target.modlist[lineindex].enabled = !target.modlist[lineindex].enabled;
                    }
                );

                // Settings
                click(
                    (display.cw()-target.window_width)/2 + padding, (display.ch()-target.window_height)/2
                    + (2*padding) + target.mods_height, target.subwindow_width, target.settings_height, 0,
                    (lineindex, ox, oy)=>
                    {
                        if (lineindex < target.settings.length)
                        {
                            let sww = target.subwindow_width;
                            let triw = target.settings_consts.integer_scale.triangle_width;
                            let trih = target.settings_consts.integer_scale.triangle_height;
                            let box = target.line_height - (2 * ip);
                            switch (target.settings[lineindex].type) {
                                case "integer-scale":
                                    let tx = sww - ip - triw;
                                    let num_width = get_text_width('0'.repeat(target.settings[lineindex].number_count),
                                        `${box}px "DejaVu Sans Mono"`);

                                    if (tx <= ox && ox < tx + triw && ip <= oy && oy < ip + trih)
                                        target.settings[lineindex].value =
                                            engine.clamp(target.settings[lineindex].value + 1,
                                                target.settings[lineindex].min, target.settings[lineindex].max);

                                    tx -= 2 * ip + num_width;
                                    if (tx - triw <= ox && ox < tx && ip <= oy && oy < ip + trih)
                                        target.settings[lineindex].value =
                                            engine.clamp(target.settings[lineindex].value - 1,
                                                target.settings[lineindex].min, target.settings[lineindex].max);
                                    break;
                            }
                        }
                    }
                );

                /*// Mod list
                let mouse_x = mx - (display.cw()-target.window_width)/2 - padding - 4;
                let mouse_y = my - (display.ch()-target.window_height)/2 - padding - 4;
                let iy = Math.floor(mouse_y/oneline) + Math.floor(target.scroll[0]/oneline);
                let oy = mouse_y % oneline;
                if (0 <= mouse_x && mouse_x <= target.subwindow_width && 0 <= mouse_y && mouse_y <= target.mods_height)
                if (0 <= mouse_x && mouse_x <= target.line_height-4 && 0 <= oy && oy <= target.line_height-4)
                    target.modlist[iy].enabled = !target.modlist[iy].enabled;*/

                break;
            }
        }
    },
    draw_mod_list: function (target)
    {
        let bg_darker = '#555'; // bg darker color
        let bg_lighter = '#777'; // bg lighter color
        let textcolor = 'white'; // mod text color
        let sww = target.subwindow_width; // mods window width
        let swh = target.mods_height; // mods window height
        let lh = target.line_height; // mod line height
        let ls = target.line_separation; // mod separation line width
        let box_color = 'white'; // box color
        let ip = target.inline_padding;
        let box = lh-(2*ip);
        let bw = target.border_width;

        let surf = document.createElement('canvas').getContext('2d');
        surf.canvas.width = sww;
        surf.canvas.height = swh;
        surf.fillStyle = bg_darker;
        surf.fillRect(0, 0, sww, swh);
        let oneline = lh+ls;
        let mi = Math.floor(target.scroll[0]/oneline)-1; // mod index
        for (let oy = -target.scroll[0] % oneline; oy < swh; oy += oneline)
        {
            if (++mi >= target.modlist.length) break;
            surf.fillStyle = bg_lighter;
            surf.fillRect(0, oy, sww, lh);
            surf.lineWidth = bw;
            if (target.modlist[mi].enabled)
            {
                surf.fillStyle = box_color;
                surf.fillRect(ip, ip, box, box);
            }
            else
            {
                surf.strokeStyle = box_color;
                surf.strokeRect(ip + bw/2, oy + ip + bw/2,
                    box - bw, box - bw);
            }
            engine.draw_text(surf, lh, oy+lh/2, target.modlist[mi].name, 'fill', box, 'left',
                'center', textcolor, '"Montserrat", serif');
        }
        return surf;
    },
    draw_board_settings: function (target)
    {
        let bg_darker = '#555'; // bg darker color
        let bg_lighter = '#777'; // bg lighter color
        let textcolor = 'white'; // mod text color
        let sww = target.subwindow_width; // mods window width
        let swh = target.settings_height; // mods window height
        let lh = target.line_height; // mod line height
        let ls = target.line_separation; // mod separation line width
        let box_color = 'white'; // box color
        let ip = target.inline_padding;
        let triw = target.settings_consts.integer_scale.triangle_width;
        let trih = target.settings_consts.integer_scale.triangle_height;
        let box = lh-(2*ip);
        let bw = target.border_width;

        let surf = document.createElement('canvas').getContext('2d');
        surf.canvas.width = sww;
        surf.canvas.height = swh;
        surf.fillStyle = bg_darker;
        surf.fillRect(0, 0, sww, swh);
        let oneline = lh+ls;
        let si = Math.floor(target.scroll[1]/oneline)-1; // mod index
        for (let oy = -target.scroll[1] % oneline; oy < swh; oy += oneline)
        {
            if (++si >= target.settings.length) break;
            surf.fillStyle = bg_lighter;
            surf.fillRect(0, oy, sww, lh);
            surf.lineWidth = bw;
            engine.draw_text(surf, ip, oy+lh/2, target.settings[si].display_name, 'fill', box, 'left', 'center',
                textcolor, '"Montserrat", serif');

            switch (target.settings[si].type)
            {
                case "integer-scale":
                    let tx = sww-ip-triw;
                    let ty = oy+ip;
                    let num_width = target.gvars[0].get_text_width('0'.repeat(target.settings[si].number_count),
                        `${box}px "DejaVu Sans Mono"`);
                    surf.beginPath();
                    surf.moveTo(tx, ty);
                    surf.lineTo(tx+triw, ty+trih/2);
                    surf.lineTo(tx, ty+trih);
                    surf.fillStyle = 'white';
                    surf.fill();

                    let number = target.settings[si].value.toString();
                    number = '0'.repeat(target.settings[si].number_count-number.length) + number;

                    tx -= ip;
                    engine.draw_text(surf, tx, ty-ip+(lh/2), number, 'fill', box, 'right', 'center', 'white',
                        `"DejaVu Sans Mono"`);

                    tx -= num_width + ip + triw;
                    surf.beginPath();
                    surf.moveTo(tx+triw, ty);
                    surf.lineTo(tx, ty+trih/2);
                    surf.lineTo(tx+triw, ty+trih);
                    surf.fillStyle = 'white';
                    surf.fill();
                    break;
            }
        }

        return surf;
    },
    canvas_resize: function (target, width, height)
    {
        let measure = Math.min(height/target.gvars[0].HEIGHT, width/target.gvars[0].WIDTH);

        target.line_height = target.line_height_origin * measure;
        target.line_separation = target.line_separation_origin * measure;
        target.window_width = target.window_width_origin * measure;
        target.window_height = target.window_height_origin * measure;
        target.border_width = target.border_width_origin * measure;
        target.inline_padding = target.inline_padding_origin * measure;

        target.subwindow_padding = Math.round(target.window_width*0.05);
        target.subwindow_width = target.window_width-(2*target.subwindow_padding);
        target.mods_height = Math.round((target.window_height-(4*target.subwindow_padding))*3/6);
        target.settings_height = Math.round((target.window_height-(4*target.subwindow_padding))*2/6);

        target.start_button_width = target.window_width*0.8;
        target.start_button_height = Math.round((target.window_height-(4*target.subwindow_padding))/6);
        target.start_button_triangle_width = target.start_button_triangle_width_origin * measure;

        target.start_button.const_x = (width - target.start_button.box_width)/2 - target.start_button.triangle_width;
        target.start_button.const_y = (height - target.window_height)/2 + 3*target.subwindow_padding
            + target.mods_height + target.settings_height;
        target.start_button.box_width = target.start_button_width;
        target.start_button.box_height = target.start_button_height;
        target.start_button.triangle_width = target.start_button_triangle_width

        target.settings_consts = {
            integer_scale: {
                triangle_height: target.line_height - (2*target.inline_padding),
                triangle_width: target.line_height/2 - target.inline_padding,
                spacing: target.inline_padding/2,
            },
        };
    },
});

module.exports = {EntMMStartMenu};
},{"../../nle.cjs":17,"./button.cjs":13,"fs":18,"path":19}],17:[function(require,module,exports){
/*
    Copyright © 2023 Alexey Kozhanov

    =====

    This file is part of Casual Playground.

    Casual Playground is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

    Casual Playground is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE. See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along with
Casual Playground. If not, see <https://www.gnu.org/licenses/>.
*/

/*
NLE2 (NotLexaEngine 2) for JavaScript
Version: 1.3.0
*/

const [LMB, MMB, RMB, MBBACK, MBFORWARD, WHEELDOWN, WHEELUP] = Array(7).keys();

const lengthdir_x = function(length, dir)
{
    return Math.cos(dir*Math.PI/180)*length;
}
const lengthdir_y = function(length, dir)
{
    return -Math.sin(dir*Math.PI/180)*length;
}

const linear_interpolation = function(a, b, power = 1)
{
    let div = Math.pow(2, Math.max(power, 1));
    let reduct = Math.pow(10, Math.max(power, 1));
    let ret = (a*(div-1)/div)+(b*1/div);
    return ret;
};

const range2range = function(value, low1, upp1, low2, upp2)
{
    return ((value-low1)/(upp1-low1))*(upp2-low2) + low2;
};

const clamp = function(value, mn, mx)
{
    return Math.max(mn, Math.min(mx, value));
};

const wrap = function(value, mn, mx)
{
    let a = ((value-mn)%(mx-mn));
    if (a < 0) a += mx-mn;
    return a+mn;
};

const draw_text = function(ctx, x, y, string = 'Sample Text', type = 'fill',
                           size  = 16, hor_align = 'left', vert_align = 'top',
                           color = 'black', font_name = 'serif', weight_style = '')
{
    ctx.font = `${weight_style} ${size}px ` + font_name;

    switch (vert_align)
    {
        case 'top':
            ctx.textBaseline = 'top';
            break;
        case 'center':
            ctx.textBaseline = 'middle';
            break;
        case 'bottom':
        default:
            ctx.textBaseline = 'bottom';
            break;
    }
    ctx.textAlign = hor_align;
    if (type === 'fill')
    {
        ctx.fillStyle = color;
        ctx.fillText(string, x, y);
    }
    else
    {
        ctx.strokeStyle = color;
        ctx.strokeText(string, x, y);
    }
};

const draw_line = function(ctx, x1, y1, x2, y2, color = 'black', linewidth = 1)
{

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = linewidth;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

const Display = function(doc, canvas, canvas_width, canvas_height)
{
    this.ctx = canvas.getContext('2d');
    this.buffer = doc.createElement('canvas').getContext('2d');
    this.buffer.canvas.width = canvas_width;
    this.buffer.canvas.height = canvas_height;

    this.original_width = canvas_width;
    this.original_height = canvas_height;

    this.cw = () => this.buffer.canvas.width;
    this.ch = () => this.buffer.canvas.height;
    this.sw = () => this.ctx.canvas.width;
    this.sh = () => this.ctx.canvas.height;
    this.ow = () => this.original_width;
    this.oh = () => this.original_height;

    // Resizes canvas.
    this.resizeCanvas = function(current_room, width, height)
    {
        this.ctx.canvas.width = width;
        this.ctx.canvas.height = height;
        this.scale_level = Math.min(this.sw()/this.ow(), this.sh()/this.oh());
        this.scaled_size = [this.ow() * this.scale_level, this.oh() * this.scale_level];
        this.resizeBuffer(current_room, ...this.scaled_size);
        this.offset_x = (this.sw() - this.scaled_size[0])/2;
        this.offset_y = (this.sh() - this.scaled_size[1])/2;
    };

    this.resizeBuffer = function(current_room, width, height)
    {
        this.buffer.canvas.width = width;
        this.buffer.canvas.height = height;
        if (current_room.hasOwnProperty('do_resize_canvas')) current_room.do_resize_canvas(width, height);
    }

    // Applies this.buffer on the real canvas element.
    this.render = function ()
    {
        /*this.buffer.fillStyle = 'white'
        this.buffer.textAlign = 'center'
        this.buffer.fonts = `normal ${120*Math.min(this.buffer.canvas.width/1920, this.buffer.canvas.height/1080)}px serif`;
        this.buffer.fillText(`Я работаю за ${Math.floor(deltatime*10)/10} миллисекунд!`,
            this.buffer.canvas.width / 2, this.buffer.canvas.height / 2 - 32);
        this.buffer.fillText(`${window.width}px, ${window.height}px`,
            this.buffer.canvas.width / 2, this.buffer.canvas.height / 2 + 32);*/

        //alert(this.offset_x + ' ' + this.offset_y + ' ' + this.scaled_size[0] + ' ' + this.scaled_size[1]);
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this.buffer.canvas, this.offset_x, this.offset_y, ...this.scaled_size);

        //this.ctx.strokeStyle = 'red';
        //this.ctx.strokeRect(0,0, this.sw(), this.sh());
    };

    // Clears buffer by black color.
    this.clear = function ()
    {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0,0, this.sw(), this.sh())
        this.buffer.fillStyle = 'black';
        this.buffer.fillRect(0, 0, this.cw(), this.ch());
    };
};

var default_room = {do_step: function(){}, do_start: function(){}, do_end: function(){}, do_kb_down: function(){},
    do_kb_up: function(){}, do_mouse_down: function(){}, do_mouse_up: function(){}, do_mouse_move: function(){},
    do_resize_canvas: function(){}};

const Room = function(entities)
{
    this.entities = entities.slice();

    this.do_for_every = function(method_name)
    {
        let additional = Array.prototype.slice.call(arguments, 1);
        for (let e of this.entities)
        {
            for (let ins of e.instances)
            {
                e[method_name](ins, ...additional);
            }
        }
    }

    this.do_step = function(canvas = undefined)
    {
        let step_methods = ['step_before', 'step', 'step_after'];
        let draw_methods = ['draw_before', 'draw', 'draw_after'];
        for (let m of step_methods)
        {
            this.do_for_every(m);
        }
        if (canvas !== undefined)
        {
            for (let m of draw_methods)
            {
                this.do_for_every(m, canvas);
            }
        }
    };

    this.do_start = function(previous_room)
    {
        this.do_for_every('room_start', previous_room);
    };
    this.do_end = function(next_room)
    {
        this.do_for_every('room_end', next_room);
    };
    this.do_kb_down = function(event)
    {
        this.do_for_every('kb_down', event);
    };
    this.do_kb_up = function(event)
    {
        this.do_for_every('kb_up', event);
    };
    this.do_mouse_move = function()
    {
        this.do_for_every('mouse_move')
    };
    this.do_mouse_down = function(mb)
    {
        this.do_for_every('mouse_down', mb)
    };
    this.do_mouse_up = function(mb)
    {
        this.do_for_every('mouse_up', mb)
    };
    this.do_resize_canvas = function(width, height)
    {
        this.do_for_every('canvas_resize', width, height)
    };
};

const Entity = function(events)
{
    this.instances = [];

    this.create = function(){};
    this.step_before = function(){};
    this.step = function(){};
    this.step_after = function(){};
    this.draw_before = function(){};
    this.draw = function(){};
    this.draw_after = function(){};
    this.mouse_move = function(){};
    this.mouse_down = function(){};
    this.mouse_up = function(){};
    this.kb_down = function(){};
    this.kb_up = function(){};
    this.room_start = function(){};
    this.room_end = function(){};
    this.canvas_resize = function(){};

    for (let e in events) this[e] = events[e];

    this.create_instance = function(...create_args)
    {
        let ins = new Instance(this);
        this.instances.push(ins);
        this.create(ins, ...create_args);
        return ins;
    };
};

const Instance = function (entity)
{
    this.entity = entity;
};

const Bitarray = function () // Array of bits -- TODO: REPLACE NUMBERS WITH BIGINTS
{
    this.value = [];
    this.get = function(index)
    {
        while (index >= 32*this.value.length) this.value.push(0);
        let divd = Math.floor(index/32); let modd = index % 32;
        return (this.value[divd] & (1<<modd)) > 0;
    };
    this.invert = function(index)
    {
        while (index >= 32*this.value.length) this.value.push(0);
        let divd = Math.floor(index/32); let modd = index % 32;
        this.value[divd] ^= 1<<modd;
    };
    this.set = function(index, value)
    {
        while (index >= 32*this.value.length) this.value.push(0);
        let divd = Math.floor(index/32);
        if ((!!value) !== this.get(index)) this.invert(index);
    };
};

const create_text_blob = (text) => (new Blob([text],{type:"text/plain"}));

const save = function (content, file)
{
    let a = document.createElement('a');
    let is_blob = content.toString().indexOf("Blob") !== -1;
    let url = content;
    if (is_blob) url = window.URL.createObjectURL(content);
    a.href = url;
    a.download = file;
    a.click();
    if (is_blob) window.URL.revokeObjectURL(url);
    a.remove();
    return 'Successfully saved area!';
};

module.exports = {Display, Room, Entity, Instance, clamp, linear_interpolation,
    draw_text, LMB, RMB, MMB, MBBACK, MBFORWARD, WHEELDOWN, WHEELUP, draw_line, range2range, wrap,
    lengthdir_x, lengthdir_y, default_room, Bitarray, create_text_blob, save};
},{}],18:[function(require,module,exports){

},{}],19:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":20}],20:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
