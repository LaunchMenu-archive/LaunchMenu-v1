var DateFormatter = function(date){
    if(typeof date == "string"){
        date = new Date(date);
    }
    this.date = date;
};
DateFormatter.prototype.format = function(format){
    if(this.date=="Invalid Date")
        return "Invalid Date";
        
    var esc = function(text){
        return text.replace(/(.)/g, "\\$1");
    };
    var rep = function(key, text){
        format = format.replace(new RegExp("(^|[^\\\\])"+key,"g"), "$1"+esc(text+""));
    };
    
    var date = this.date.getDate();
    var month = this.date.getMonth();
    var day = (this.date.getDay()+1)%7;
    var fullYear = this.date.getFullYear();
    var leapYear = (((fullYear%4==0)&&(fullYear%100!=0))||(fullYear%400==0));
    var monthLengths = [31, 28+(leapYear?1:0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var dayOfTheYear = date-1;
    for(var i=0; i<month; i++) dayOfTheYear += monthLengths[i];
    
    var hours = this.date.getHours();
    var minutes = this.date.getMinutes();
    var seconds = this.date.getSeconds();
    var milliseconds = this.date.getMilliseconds();
    var time = this.date.getTime();
    
    var timezone = (this.date.getTimezoneOffset()/60+24)%24;
    var jan = new Date(this.date.getFullYear(), 0, 1);
    var jul = new Date(this.date.getFullYear(), 6, 1);
    var max = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    var daylightSaving = this.date.getTimezoneOffset()<max;
    
    
    //Full date/time
    format = format.replace(/U/g, time);
    format = format.replace(/c/g, "Y-m-d\\TH:i:sP");
    format = format.replace(/r/g, "D, j M o H:i:sO");
    
    //day
    rep("d", ((""+date).length==1?"0":"")+date);
    rep("j", date);
    
    var daysShort = ["Mon","Tue", "Wed","Thu","Fri","Sat","Sun"];
    rep("D", daysShort[day]);
    var daysFull = ["Monday","Tuesday", "Wednesday","Thursday","Friday","Saturday","Sunday"];
    rep("l", daysFull[day]);
    
    rep("N", day+1);
    rep("w", day);
    
    var suffixes = ["st","nd","rd","th"];
    rep("S", suffixes[Math.min((date-1)%10,3)]);
    rep("Z", dayOfTheYear);
    
    //week
    rep("W", Math.floor(dayOfTheYear/7)+1);
    
    //month
    var monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    rep("M", monthsShort[month]);
    var monthsFull = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    rep("F", monthsFull[month]);
    
    rep("m", ((month+1+"").length==1?"0":"")+(month+1+""));
    rep("n", month+1);
    rep("t", monthLengths[month]);
    
    //year
    rep("L", leapYear?"1":"0");
    rep("o", fullYear);
    rep("Y", fullYear);
    rep("y", (fullYear+"").substring(2));
    
    //time
    rep("a", hours<12?"am":"pm");
    rep("A", hours<12?"AM":"PM");
    rep("B", Math.floor((hours*60+minutes)/(24*60)*1000));
    rep("g", hours%12);
    rep("G", hours);
    rep("h", ((hours%12+"").length==1?"0":"")+hours%12);
    rep("H", ((hours+"").length==1?"0":"")+hours);
    rep("i", ((minutes+"").length==1?"0":"")+minutes);
    rep("s", ((seconds+"").length==1?"0":"")+seconds);
    rep("u", "000000");
    rep("v", "000".substring((milliseconds+"").length)+milliseconds);
    
    //timezone
    var zoneNames = ["UTC","UTC+1","UTC+2","UTC+3","UTC+4","UTC+5","UTC+6","UTC+7","UTC+8","UTC+9","UTC+10","UTC+11","UTC+12","UTC-11","UTC-10","UTC-9","UTC-8","UTC-7","UTC-6","UTC-5","UTC-4","UTC-3","UTC-2","UTC-1"];
    rep("e", zoneNames[timezone]);
    rep("T", zoneNames[timezone]);
    rep("I", daylightSaving?"1":"0");
    var z = (timezone+12)%24-12;
    rep("O", (z+"").replace(/^(-?)([0-9])($)/g, "$10$2")+"00");
    rep("P", (z+"").replace(/^(-?)([0-9])($)/g, "$10$2")+":00");
    rep("Z", z*3600);
    
    return format.replace(/\\(.)/g,"$1");
};