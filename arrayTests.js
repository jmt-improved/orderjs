/**
 * Created by claudio on 02/12/16.
 */
"use strict";
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
Array.prototype.cloneEfficient2 = function(){
    "use strict";
    let ret = [];
    for(let i = 0; i <this.length; i++) {
        let value = this[i];
        if (typeof value == 'object')
            if (Array.isArray(value))
                ret.push(value.cloneEfficient2());
            else
                ret.push(value.clone());
        else
            ret.push(value);
    }
    return ret;
};

class efficientArray{
    constructor(pointerClass) {
        this.base = createMatrix(100,100);
        this.pointerClass = pointerClass;
    }

    execute(x, y, data, level){
        x = x || 0;
        y = y || 0;
        data = data || new this.pointerClass(this.base);
        level = level || 0;
        //console.log(x, y, level);

        if(level > 5) {
            //console.log(Object.keys(data.data).length);
            return;
        }

        let dataTmp = new this.pointerClass(this.base, data);
        dataTmp.setValue(x+1, y, [1,2]);
        this.execute(x+1, y, dataTmp, level+1);
        dataTmp = new this.pointerClass(this.base, data);
        dataTmp.setValue(x, y+1, [1,2]);
        this.execute(x, y+1, dataTmp, level+1);
    }
}

class classicPointer{
    constructor(matrix, pointer) {
        this.matrix = matrix;
        pointer = pointer || {"data" : matrix};
        this.data = pointer.data.clone();
    }

    setValue(x,y,value){
        this.data[x][y] = value;
    }

    getValue(x,y){
        return this.data[x][y];
    }

    getCompleteArray(){
        return this.data;
    }

    isValidPoint(x, y){
        "use strict";
        let obj = this.matrix[x];
        if(obj == undefined)
            return false;
        obj = obj[y];
        if(obj == undefined)
            return false;
        return true;
    }
}

class efficientPointer{
    constructor(matrix, pointer) {
        this.matrix = matrix;
        pointer = pointer || {data: {}};
        this.data = pointer.data.clone();
    }

    setValue(x,y,value){
        //keys used to prevent big array length
        if(this.data['k'+x] == undefined)
            this.data['k'+x] = {};
        this.data['k'+x]['k'+y] = value;
    }

    getValue(x,y){
        let xData = this.data['k'+x] || {};
        return xData['k'+y] || this.matrix[x][y];
    }

    getCompleteArray(){
        return this.matrix
            .map((value1, key1)=>{
                return value1.map((value2,key2)=>{
                   if(this.data['k'+key1] != undefined && this.data['k'+key1]['k'+key2] != undefined)
                       return this.data['k'+key1]['k'+key2];
                   return value2;
                });
            })
    }

    isValidPoint(x, y){
        "use strict";
        let obj = this.matrix[x];
        if(obj == undefined)
            return false;
        obj = obj[y];
        if(obj == undefined)
            return false;
        return true;
    }
}

function pointerTest(pointerClass){
    let matrix = createMatrix(6,6);
    let pointerInstance = new pointerClass(matrix);
    pointerInstance.setValue(1,5,[6,5]);
    let pointerInstance2 = new pointerClass(matrix, pointerInstance);
    pointerInstance2.setValue(5,5,[9,5]);
    console.log(pointerInstance2.getValue(1,5));
    console.log(pointerInstance.getValue(5,5));
    console.log(pointerInstance2.getValue(5,5));
    console.log(pointerInstance2.getCompleteArray());
}

function testClone(name){
    "use strict";
    executeWithTime(()=>{
        "use strict";
        var matrix = createMatrix(100,100);
        for(var i=0;i<100; i++)
            matrix[name]();
    }, 'clone efficient matrices ('+name+')');


    executeWithTime(()=>{
        "use strict";
        var data = [];
        var matrix = createMatrix(100,100);
        for(var i=0;i<100; i++)
            data.push(matrix[name]());
    }, 'clone efficient matrices with push ('+name+')');
}

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


testClone('cloneEfficient');
testClone('cloneEfficient2');

executeWithTime(()=>{
    "use strict";
    new efficientArray(classicPointer).execute();
}, 'efficient array entire clone');

executeWithTime(()=>{
    "use strict";
    new efficientArray(efficientPointer).execute();
}, 'efficient array pointer clone');

// PROOF
pointerTest(classicPointer);
pointerTest(efficientPointer);