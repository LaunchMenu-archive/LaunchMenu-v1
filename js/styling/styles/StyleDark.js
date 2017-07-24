/*global variables Inherit, Style, $StyleHandler,*/
loadOnce("../Style");
$StyleHandler.registerStyle(
	class StyleDark extends Style{
		constructor(){
			super({
	            background: ["#222", "#555"],
	            border: ["#777", "#AAA"],
	            font: ["#DDD", "#888"],
	            fontError: ["#900","#D00"],
	            backgroundHighlight: ["#af4900", "#ce5f10"],
			});
		}
    }
);