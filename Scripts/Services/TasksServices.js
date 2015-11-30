var Models;
(function (Models) {
    var TasksServices = (function () {
        function TasksServices() {
            this.CLIENT_ID = '1072354952697-l6ihrtohski9e023vtaub4o2f5hih88m.apps.googleusercontent.com';
            this.SCOPES = ['https://www.googleapis.com/auth/tasks.readonly'];
        }
        TasksServices.prototype.checkAuth = function () {
            gapi.auth.authorize({
                'client_id': this.CLIENT_ID,
                'scope': this.SCOPES.join(' '),
                'immediate': true
            }, this.handleAuthResult);
        };
        TasksServices.prototype.handleAuthResult = function (authResult) {
            var authorizeDiv = document.getElementById('authorize-div');
            if (authResult && !authResult.error) {
                authorizeDiv.style.display = 'none';
                this.loadTasksApi();
            }
            else {
                authorizeDiv.style.display = 'inline';
            }
        };
        TasksServices.prototype.handleAuthClick = function (event) {
            gapi.auth.authorize({ client_id: this.CLIENT_ID, scope: this.SCOPES, immediate: false }, this.handleAuthResult);
            return false;
        };
        TasksServices.prototype.loadTasksApi = function () {
            gapi.client.load('tasks', 'v1', this.listTaskLists);
        };
        TasksServices.prototype.listTaskLists = function () {
            var request = gapi.client.tasks.tasklists.list({
                'maxResults': 10
            });
            request.execute(function (resp) {
                this.appendPre('Task Lists:');
                var taskLists = resp.items;
                if (taskLists && taskLists.length > 0) {
                    for (var i = 0; i < taskLists.length; i++) {
                        var taskList = taskLists[i];
                        this.appendPre(taskList.title + ' (' + taskList.id + ')');
                    }
                }
                else {
                    this.appendPre('No task lists found.');
                }
            });
        };
        TasksServices.prototype.appendPre = function (message) {
            var pre = document.getElementById('output');
            var textContent = document.createTextNode(message + '\n');
            pre.appendChild(textContent);
        };
        return TasksServices;
    })();
    Models.TasksServices = TasksServices;
})(Models || (Models = {}));
