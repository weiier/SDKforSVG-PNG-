function PScript(src) {
    document.write('<' + 'script src="' + src + '"' + ' type="text/javascript"><' + '/script>');
}

_Vmapi_url = (function () {
    var script = document.getElementsByTagName("script");
    for (var i = 0; i < script.length; i++) {
        if (script[i].src.indexOf("sdkAPI.js") !== -1) {
			console.log(script[i].src);
            return script[i].src.replace(/^(http:\/\/.+)\/sdkAPI.js$/, "$1");/*file:\/\/\/.*/
        }
    }
    alert("<script>标签内的src不正确！");
    return "";
})();
console.log(_Vmapi_url);

PScript(_Vmapi_url + "/H.js");
PScript(_Vmapi_url + "/J.js");
PScript(_Vmapi_url + "/main.js");
PScript(_Vmapi_url + "/slave.js");

