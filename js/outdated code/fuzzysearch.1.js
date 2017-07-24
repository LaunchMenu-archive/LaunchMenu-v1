function fuzzySearch(names,query){
    var rQuery = "";
    var retArray = [];
    
    //Prepare regex and keys from query string
    rQuery = "\\b"; //"pineapple","custard apple","apsple","apple"  not taken into account
    for(var i=0;i<query.length;i++){
        rQuery += "(.*)" + query[i].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    rQuery+="(.*)";
    
    //Prepare regex...
    var regex = new RegExp(rQuery,"i");
    
    //Loop through names in dictionary
    for(var nameIndex in names){
        var name = names[nameIndex];
        var match;
        if((match = regex.exec(name)) != null){
            var firstMatch = match[1];
            var lastMatch = match[match.length-1];
            
            //nScore: inverted score
            //If query is the first part of name then nScore = 0 else nScore = 0.1
            //nScore == 0.1 to distinguish between "apsple" and "pineapple" while searching for "apple".
            //In this case we decided that "pineapple" should be a better match.
            var nScore = firstMatch.length>0?0.1:0;
            if(lastMatch.length>0) nScore+=0.1;
            
            //Add to inverted score if character before match is a letter/digit.
            //Because we decided that "pineapple" should score worse than "custard apple"
            //Ignore if firstCharacter is start of string. Otherwise this applies to "apple" inadvertantly.
            // 2nd line of code is the same but for "applepine" (word after first word)
            if(firstMatch.length>0 && /\w/.exec(firstMatch[firstMatch.length-1])) nScore+=0.2;
            if(lastMatch.length>0 && /\w/.exec(lastMatch[0])) nScore+=0.1;
            
            //Loop through remaining submatches and add length of submatches to inverted score.
            //These are characters in between the query characters I.E.
            //a(.*)p(.*)p(.*)l(.*)e
            
            //Search "test" matches "tempest" more than "troubleshoot"
            for(i=2; i<match.length-1; i++){
                var length = match[i].length;
                if(length>0)
                    nScore += 2+length;
            }
            
            //Score inversely proportional to nScore of gaps between letters
            var score = 1 / (1+nScore);
            
            //If name matches regex, push it to the return array
            //Default score of 1 for ease of multiplying score to
            // promote frequently matched names.
            retArray.push({name:name,score:score});
        }
    }
    
    //Return fuzzy results
    return sortMatches(retArray);
}

function sortMatches(matches){
    return matches.sort(function(a,b){
        return b.score-a.score;
    });
}