var canvas = document.getElementById('golcanvas');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

var deltatime = 0;
var prevtime = null;
var update_time = 0;
var update_time_until = 0.2;
var linesize = 8;
var variant = 0;

var colors = ['rgb(0,0,0)', 'rgb(2,0,13)']

const update_canvas = function()
{
    let i = variant;
    for (let h=0; h<canvas.offsetHeight; h+=linesize)
    {
        i ^= 1;
        ctx.fillStyle = colors[i];
        ctx.fillRect(0, h, canvas.offsetWidth, linesize);
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
        update_time %= update_time_until;
        variant ^= 1;
        update_canvas();
    }
    window.requestAnimationFrame(mainloop);
};

window.requestAnimationFrame(mainloop);