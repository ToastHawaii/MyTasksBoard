var Models;
(function (Models) {
    var AuthService = (function () {
        function AuthService(clientId) {
            this.clientId = clientId;
            this.scopes = ['https://www.googleapis.com/auth/tasks.readonly'];
        }
        AuthService.prototype.checkAuth = function (callback) {
            gapi.auth.authorize({
                'client_id': this.clientId,
                'scope': this.scopes.join(' '),
                'immediate': true
            }, function (authResult) {
                callback(authResult && !authResult.error);
            });
        };
        AuthService.prototype.auth = function (callback) {
            gapi.auth.authorize({ client_id: this.clientId, scope: this.scopes, immediate: false }, function (authResult) {
                callback(authResult && !authResult.error);
            });
        };
        return AuthService;
    })();
    Models.AuthService = AuthService;
})(Models || (Models = {}));
