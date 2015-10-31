namespace Services {
    export class Auth {
        public constructor(public clientId: string) {
        }

        scopes = ["https://www.googleapis.com/auth/tasks"];

        /**
         * Check if current user has authorized this application.
         */
        checkAuth(callback: (authorized: boolean) => void) {
            gapi.auth.authorize(
                {
                    "client_id": this.clientId,
                    "scope": this.scopes.join(" "),
                    "immediate": true
                }, (authResult: any) => {
                    callback(authResult && !authResult.error);
                });
        }

        /**
         * Initiate auth flow.
         */
        auth(callback: (authorized: boolean) => void) {
            gapi.auth.authorize(
                { client_id: this.clientId, scope: this.scopes, immediate: false },
                (authResult: any) => {
                    callback(authResult && !authResult.error);
                });
        }
    }
}