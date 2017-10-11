var Language = function(lang){
  this.language = lang;
  this.code = null;
}
Language.prototype.callVBS = function(){
	for(var i in arguments){
		var arg = arguments[i]
    var matches = /(Function|Sub) Invoke\((.*?)\)/i.match(this.code)
    if(matches[i].toLowerCase()=='function'){
      return dedent(`WScript.StdOut.Write(Invoke(${bash(arguments,this.code).replace(/ /g, ", ")}))

                     {//code//}`).replace("{//code//}",this.code)
    } else if (matches[i].toLowerCase()=='sub') {
      return dedent(`Invoke ${bash(arguments,this.code).replace(/ /g, ", ")}

                     {//code//}`).replace("{//code//}",this.code)
    } else {
      throw new Error("The invoke function given is neither a sub or a function.")
    }
	}
}
Language.prototype.bash = function (args,del=" "){
  for(i in args){
    var arg = args[i]
    var ret = []
    if(typeof arg == "object"){
      ret.push(JSON.stringify(JSON.stringify(arg)))
    } else {
      ret.push(JSON.stringify(arg))
    }
    return ret.join(del)
  }
}


/*
Sub Invoke(arg1,arg2)
  Exit Sub
End Sub

Function Invoke(arg1,arg2)
  Exit Function
End Function
*/