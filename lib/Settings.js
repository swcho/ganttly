/**
 * Created by sungwoo on 15. 9. 8.
 */
var Settings;
(function (Settings) {
    function getBaseUrl() {
        return localStorage.getItem('baseUrl') || 'http://www.javaforge.com';
    }
    Settings.getBaseUrl = getBaseUrl;
})(Settings || (Settings = {}));
//# sourceMappingURL=Settings.js.map