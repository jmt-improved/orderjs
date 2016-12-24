/**
 * Created by claudio on 02/12/16.
 */
"use strict";
function getBests(array, offset, len, maxBests){
    var lengths = [];
    var totLength = 1;
    var arrayAllied = [];
    lengths[0] = 1;
    for(var i = offset; i<len; i++){
        lengths[i-offset+1] = array[i].length;
        totLength *= array[i].length;
        arrayAllied.push(array[i]);
    }

    for(var i = 0; i<totLength; i++){
        let grandPos = i;
        let arrays = arrayAllied.map((value, key)=>{
            grandPos = Math.floor(grandPos/lengths[key]);
            let pos = grandPos%lengths[key+1];
            return value[pos];
        });
        console.log(arrays);
    }
}

function mergeArrays(array1, array2){

}

var arrayTest = [
    [1,2,3],
    [1,2],
    [1,2,3,4,5],
    [1,2],
];

getBests(arrayTest, 0, 3, 10);