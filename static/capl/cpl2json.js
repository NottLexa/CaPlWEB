const comp = require('./core/compiler.cjs');
const fs = require('fs');
var arguments = process.argv.slice(2);
var compiled = comp.get(fs.readFileSync(arguments[0], {encoding: "utf8"}));
var jsoned_cell = {};
for (let k in compiled[0]) jsoned_cell[k] = compiled[0][k];
for (let k in jsoned_cell.script) jsoned_cell.script[k] = jsoned_cell.script[k].toString();
var jsoned_conclusion = {code: compiled[1].code, description: compiled[1].description};
var jsoned_cursor = {sl: compiled[2].sl, el: compiled[2].el, sh: compiled[2].sh, eh: compiled[2].eh}
var jsoned = {
    cell: jsoned_cell,
    conc: jsoned_conclusion,
    curs: jsoned_cursor
};
console.log(JSON.stringify(jsoned));