//test 1, custom regex way slower, more than 20 times as slow when the length of the array is 20
var ar = [];
for(var i=0; i<5; i++){
    var obj = {};
    var str = "abcdefghijklmnopqrstuvwxyz";
    for(var j=0; j<10; j++){
        obj[str[j]] = true;
    }
    ar.push(obj);
}
var regex = /[abcdefghij][abcdefghij][abcdefghij][abcdefghij][abcdefghij]/
var str = "abcba";

for(var n=0; n<10; n++){
    console.log("---------");
    console.time();
    for(var i=0; i<400000; i++){    
        str.match(regex);
    }
    console.timeEnd();
    console.time();
    for(var i=0; i<400000; i++){    
        var res = true;
        for(var j=0; j<ar.length; j++){
            if(!ar[j][str[j]])
                res = false;
        }
    }
    console.timeEnd();
}

