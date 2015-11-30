var Services;
(function (Services) {
    var Auth = (function () {
        function Auth(clientId) {
            this.clientId = clientId;
            this.scopes = ["https://www.googleapis.com/auth/tasks"];
        }
        Auth.prototype.checkAuth = function (callback) {
            gapi.auth.authorize({
                "client_id": this.clientId,
                "scope": this.scopes.join(" "),
                "immediate": true
            }, function (authResult) {
                callback(authResult && !authResult.error);
            });
        };
        Auth.prototype.auth = function (callback) {
            gapi.auth.authorize({ client_id: this.clientId, scope: this.scopes, immediate: false }, function (authResult) {
                callback(authResult && !authResult.error);
            });
        };
        return Auth;
    })();
    Services.Auth = Auth;
})(Services || (Services = {}));
