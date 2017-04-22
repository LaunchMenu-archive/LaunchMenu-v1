function regexEscape(str){
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
function lm(selector){
    return $(".lm").find(selector);
}