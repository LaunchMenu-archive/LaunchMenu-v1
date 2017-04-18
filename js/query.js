/*global settings regexEscape tree Quicksort*/
var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
function sortMatches(matches){
    var max = settings.maxResults;
    return Quicksort.sort(matches, function(a,b){
        var dScore = a.score-b.score;
        if(dScore!=0) return dScore>0;
        
        //alphabetical order
        var nameA = tree.fullName(a.file);
        var nameB = tree.fullName(b.file);
        for(var i=0; i<Math.min(nameA.length, nameB.length); i++){
            if(nameA[i]!=nameB[i]){
                var aIndex = alphabet.indexOf(nameA[i]);
                var bIndex = alphabet.indexOf(nameB[i]);
                if(aIndex!=-1 && bIndex!=-1){
                    return aIndex<bIndex;
                }else if(aIndex!=-1){
                    return true;
                }else if(bIndex!=-1){
                    return false;
                }
            }
        }
        return false;
    }, max).slice(0, Math.min(matches.length,max));
}


function query(tree,query){
    var rQuery = "";
    var retArray = [];
    
    rQuery = "^((";
    //setup a literal match query
    var queryWords = query.split(" ");
    var literalMatchIndex = 3;
    var literalMatchLength = queryWords.length+1;
    for(var i=0;i<queryWords.length;i++){
        var word = regexEscape(queryWords[i]);
        rQuery += "(.*?"+(i>0?" .*?":"")+")"+word;
    }
    rQuery+="(.*))|(";
    //setup a similar match query
    var similarMatchIndex = literalMatchIndex+literalMatchLength+1;
    var similarMatchLength = query.length+1;
    for(i=0;i<query.length;i++){
        var escChar = regexEscape(query[i]);
        rQuery += (i==0?"(.*)":"([^"+escChar+"]*)") + escChar;
    }
    rQuery+="(.*)))";
    
    
    //Prepare regex...
    var regex = new RegExp(rQuery,"i");
    
    //Loop through files in tree
    tree.each(function(file){
        var test = file.n;
        if(file.e && file.e.length>0) test+="."+file.e;
        
        var tests = [test];
        if(test.toLowerCase()!=test){
            if(/((^[a-z]|[A-Z])[^A-Z\b]+)+/.test(test)){
                var acronym = test.replace(/(^[a-z]|[A-Z])[^A-Z\b]+/g, "$1");
                tests.push(acronym);
            }
        }
        var bestScore = 0;
        var match;
        for(var n=0; n<tests.length; n++){
            var test = tests[n];
            if((match = regex.exec(test)) != null){
                var nScore = 0;
                if(match[literalMatchIndex]!==undefined){
                    var firstMatch = match[literalMatchIndex];
                    var lastMatch = match[literalMatchIndex+literalMatchLength-1];
                    
                    /*nScore: inverted score
                    If query is the first part of name then nScore = 0 else nScore = 0.1
                    nScore == 0.1 to distinguish between "apple" and "pineapple" while searching for "apple".
                    In this case we decided that "pineapple" should be a better match.*/
                    if(firstMatch.length>0) nScore+=0.1;
                    if(lastMatch.length>0) nScore+=0.1;
                    
                    /*Add to inverted score if character before match is a letter/digit.
                    Because we decided that "pineapple" should score worse than "custard apple"
                    Ignore if firstCharacter is start of string. Otherwise this applies to "apple" inadvertantly.*/
                    if(firstMatch.length>0 && /\w/.exec(firstMatch[firstMatch.length-1])) nScore+=0.1;
                    if(lastMatch.length>0 && /\w/.exec(lastMatch[0])) nScore+=0.1;
                    
                    for(i=literalMatchIndex+1; i<literalMatchIndex+literalMatchLength-1; i++){
                        var length = match[i].length-1;
                        nScore += length/20;
                    }
                    
                    //make the name length show up in ascending order on the same level of match
                    nScore += (test.length-query.length)/1000;
                    
                    //Score inversely proportional to nScore of gaps between letters
                    var score = 1 / (1+nScore);
                    
                    /*If name matches regex, push it to the return array
                    //Default score of 1 for ease of multiplying score to
                     promote frequently matched names.*/
                     bestScore = Math.max(bestScore,score);
                }else{
                    var firstMatch = match[similarMatchIndex];
                    var lastMatch = match[similarMatchIndex+similarMatchLength-1];
                    
                    /*nScore: inverted score
                    If query is the first part of name then nScore = 0 else nScore = 0.1
                    nScore == 0.1 to distinguish between "apple" and "pineapple" while searching for "apple".
                    In this case we decided that "pineapple" should be a better match.*/
                    if(firstMatch.length>0) nScore+=0.1;
                    if(lastMatch.length>0) nScore+=0.1;
                    
                    /*Add to inverted score if character before match is a letter/digit.
                    Because we decided that "pineapple" should score worse than "custard apple"
                    Ignore if firstCharacter is start of string. Otherwise this applies to "apple" inadvertantly.*/
                    if(firstMatch.length>0 && /\w/.exec(firstMatch[firstMatch.length-1])) nScore+=0.1;
                    if(lastMatch.length>0 && /\w/.exec(lastMatch[0])) nScore+=0.1;
                    
                    /*Loop through remaining submatches and add length of submatches to inverted score.
                    These are characters in between the query characters I.E.
                    a(.*)p(.*)p(.*)l(.*)e*/
                    for(i=similarMatchIndex+1; i<similarMatchIndex+similarMatchLength-1; i++){
                        var length = match[i].length;
                        if(length>0)
                            nScore += 2+length;
                    }
                    
                    //make the name length show up in ascending order on the same level of match
                    nScore += (test.length-query.length)/1000;
                    
                    //Score inversely proportional to nScore of gaps between letters
                    var score = 1 / (1+nScore);
                    
                    /*If name matches regex, push it to the return array
                    Default score of 1 for ease of multiplying score to
                     promote frequently matched names.*/
                     bestScore = Math.max(bestScore,score);
                }
            } 
        }
        if(bestScore>settings.minimalMatchScore)
            retArray.push({file:file,score:bestScore});
    }, null, null, settings.searchDepth);
    
    //Return fuzzy results
    return sortMatches(retArray);
}