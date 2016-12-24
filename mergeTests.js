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

    var bests = new bestsClass(maxBests);

    for(var i = 0; i<totLength; i++){
        let grandPos = i;
        let arrays = arrayAllied.map((value, key)=>{
            grandPos = Math.floor(grandPos/lengths[key]);
            let pos = grandPos%lengths[key+1];
            return value[pos];
        });

        bests.add(arrays, calculateScore(arrays));
        //console.log(arrays, calculateScore(arrays));
    }
    console.log(bests.data);
}

//fake calculator
function calculateScore(arrays){
    return arrays.reduce((a,b)=>a+b,0);
}


class bestsClass{

    constructor(limit) {
        this.limit = limit;
        this.data = [];
    }


    getLastData(){
        if(this.data.length==0)
            return {data:[], value: 0};
        return this.data[this.data.length-1];
    }

    add(data, value){
        if(value>this.getLastData().value){
            if(this.data.length>=this.limit)
                return ;
            this.data.push({"value": value, "data": data});
            return ;
        }

        for(let i = 0; i<this.data.length; i++){
            if(value<this.data[i].value){
                let limit = Math.min(this.data.length, this.limit);
                let newData = this.data.slice(0, i);
                newData.push({"value": value, "data": data});
                newData = newData.concat(this.data.slice(i,limit));
                this.data = newData;
                return ;
            }
        }
    }
}

var arrayTest = [
    [1,2,3],
    [1,2],
    [1,2,3,4,5],
    [1,2],
];

getBests(arrayTest, 0, 3, 10);