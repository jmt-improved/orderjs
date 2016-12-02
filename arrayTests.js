/**
 * Created by claudio on 02/12/16.
 */
global.NO_PRINT_VERSION = true;
var lib = require('./index.js');

function createMatrix(m,n){
    "use strict";
    return Array
        .newWithElement(m,[1])
        .map((value)=>Array
            .newWithElement(n,[1]));
}

function executeWithTime(callback, name){
    "use strict";
    name = name || '';
    var t0 = new Date().getTime();
    callback();
    var t1 = new Date().getTime();
    console.log("Call to "+name+" took " + (t1 - t0) + " milliseconds.");
}

Array.prototype.cloneEfficient = function(){
    "use strict";
    return this.map((value)=>{
       if(typeof value == 'object')
           if(Array.isArray(value))
               return value.cloneEfficient();
           else
               return value.clone();
       else
           return value;
    });
};
/* PROOF
 var matrix = createMatrix(100,100);
 matrix[0][0] = 10;
 console.log(matrix[0][0]);
 var matrix2 =  matrix.cloneEfficient();
 matrix2[0][0] = 20;
 console.log(matrix[0][0]);
 console.log(matrix2[0][0]);
 */

executeWithTime(()=>{
    "use strict";
    for(var i=0;i<100; i++)
        createMatrix(100,100);
}, 'simple matrices');


executeWithTime(()=>{
    "use strict";
    var data = [];
    for(var i=0;i<100; i++)
        data.push(createMatrix(100,100));
}, 'matrices with push');

executeWithTime(()=>{
    "use strict";
    var matrix = createMatrix(100,100);
    for(var i=0;i<100; i++)
        matrix.clone();
}, 'clone matrices');


executeWithTime(()=>{
    "use strict";
    var data = [];
    var matrix = createMatrix(100,100);
    for(var i=0;i<100; i++)
        data.push(matrix.clone());
}, 'clone matrices with push');


executeWithTime(()=>{
    "use strict";
    var matrix = createMatrix(100,100);
    for(var i=0;i<100; i++)
        matrix.cloneEfficient();
}, 'clone efficient matrices');


executeWithTime(()=>{
    "use strict";
    var data = [];
    var matrix = createMatrix(100,100);
    for(var i=0;i<100; i++)
        data.push(matrix.cloneEfficient());
}, 'clone efficient matrices with push');


