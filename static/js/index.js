var canvas = document.getElementById('golcanvas');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

var deltatime = 0;
var prevtime = null;
var update_time = 0;
var update_time_until = 0.2;
var cellsize = 8;
var cellw = Math.ceil(canvas.offsetWidth/cellsize);
var cellh = Math.ceil(canvas.offsetHeight/cellsize);
var cells = [];

for (let h=0; h<cellh; h++)
{
    cells.push([]);
    for (let w=0; w<cellw; w++)
    {
        cells[h].push(Math.random() >= 0.75 ? 1 : 0);
    }
}
cells[0][1] = 1;
cells[1][2] = 1;
cells[2][0] = 1;
cells[2][1] = 1;
cells[2][2] = 1;

const wr = function(value, mn, mx) // wrap function
{
    let a = ((value-mn)%(mx-mn));
    if (a < 0) a += mx-mn;
    return a+mn;
};

const get_neighbours = function (x, y)
{
    let ret = 0;
    for (let iy=-1; iy<2; iy++)
    {
        for (let ix=-1; ix<2; ix++) if (!(iy === 0 && ix === 0)) ret += cells[wr(y-iy, 0, cellh)][wr(x-ix, 0, cellw)];
    }
    return ret;
}

const update_cells = function()
{
    let new_cells = [];
    for (let h=0; h<cellh; h++)
    {
        new_cells.push([]);
        for (let w=0; w<cellw; w++)
        {
            let n = get_neighbours(w, h);
            if (cells[h][w] === 0) new_cells[h].push(n === 3 ? 1 : 0);
            else if (cells[h][w] === 1) new_cells[h].push((n < 2 || n > 3) ? 0 : 1);
        }
    }
    return new_cells;
}

const print_cells = function()
{
    let ret = [];
    for (let h=0; h<cellh; h++)
    {
        ret.push('');
        for (let w=0; w<cellw; w++) ret[h] += ''+cells[h][w];
        ret[h] += '    ';
        for (let w=0; w<cellw; w++) ret[h] += ''+get_neighbours(w, h);
    }
    console.log(ret.join('\n'));
}

const update_canvas = function()
{
    ctx.clearRect(0,0,canvas.offsetWidth,canvas.offsetHeight);
    for (let h=0; h<cellh; h++)
    {
        for (let w=0; w<cellw; w++)
        {
            let dx = w*cellsize;
            let dy = h*cellsize;
            ctx.fillStyle = 'black';
            if (cells[h][w] === 1) ctx.fillRect(dx, dy, cellsize, cellsize);
        }

    }
}

update_canvas();
const mainloop = function(time)
{

    if (prevtime === null) deltatime = 1/60;
    else deltatime = (time - prevtime)/1000;
    prevtime = time;
    update_time += deltatime;
    if (update_time > update_time_until)
    {
        update_time -= update_time_until;
        cells = update_cells();
        update_canvas();
    }
    let scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : canvas.scrollTop;
    canvas.style.opacity = (20*(canvas.offsetHeight-scrollTop)/canvas.offsetHeight) + '%';
    window.requestAnimationFrame(mainloop);
};

window.requestAnimationFrame(mainloop);