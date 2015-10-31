var Models;
(function (Models) {
    var TasksService = (function () {
        function TasksService() {
        }
        TasksService.prototype.loadTasksApi = function () {
            gapi.client.load("tasks", "v1", TasksService.listTaskLists);
        };
        TasksService.listTaskLists = function () {
            var request = gapi.client.tasks.tasklists.list({
                "maxResults": 10
            });
            request.execute(function (resp) {
                TasksService.appendPre("Task Lists:");
                var taskLists = resp.items;
                if (taskLists && taskLists.length > 0) {
                    for (var i = 0; i < taskLists.length; i++) {
                        var taskList = taskLists[i];
                        TasksService.appendPre(taskList.title + " (" + taskList.id + ")");
                    }
                }
                else {
                    TasksService.appendPre("No task lists found.");
                }
            });
        };
        TasksService.appendPre = function (message) {
            var pre = document.getElementById("app");
            var textContent = document.createTextNode(message + "\n");
            pre.appendChild(textContent);
        };
        return TasksService;
    })();
    Models.TasksService = TasksService;
})(Models || (Models = {}));
