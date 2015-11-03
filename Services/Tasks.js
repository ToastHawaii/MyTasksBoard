var Services;
(function (Services) {
    var Tasks = (function () {
        function Tasks() {
        }
        Tasks.prototype.prepareApi = function (callback) {
            if (!gapi.client.tasks) {
                gapi.client.load("tasks", "v1", function () {
                    callback();
                });
            }
            else {
                callback();
            }
        };
        Tasks.prototype.loadTaskLists = function (callback) {
            this.prepareApi(function () {
                var request = gapi.client.tasks.tasklists.list({
                    maxResults: 10
                });
                request.execute(function (resp) {
                    callback(resp.items || []);
                });
            });
        };
        Tasks.prototype.loadTasks = function (taskListName, callback) {
            this.prepareApi(function () {
                var request = gapi.client.tasks.tasks.list({
                    tasklist: taskListName,
                    showCompleted: true,
                    showHidden: true
                });
                request.execute(function (resp) {
                    callback(resp.items || []);
                });
            });
        };
        Tasks.prototype.update = function (task, taskListId, taskId, callback) {
            this.prepareApi(function () {
                var request = gapi.client.tasks.tasks.update({ tasklist: taskListId, task: taskId }, task);
                request.execute(function (resp) {
                    if (callback)
                        callback();
                });
            });
        };
        Tasks.prototype.moveBefore = function (fromTaskListId, toTaskListId, taskId, followTaskId, callback) {
            var _this = this;
            this.moveAfter(fromTaskListId, toTaskListId, taskId, followTaskId, function (task) {
                _this.moveAfter(toTaskListId, toTaskListId, followTaskId, task.id, callback);
            });
        };
        Tasks.prototype.moveAfter = function (fromTaskListId, toTaskListId, taskId, previousTaskId, callback) {
            this.prepareApi(function () {
                if (fromTaskListId === toTaskListId) {
                    var request = gapi.client.tasks.tasks.move({ tasklist: fromTaskListId, task: taskId, previous: previousTaskId });
                    request.execute(function (resp) {
                        if (callback)
                            callback();
                    });
                }
                else {
                    var request = gapi.client.tasks.tasks.list({ tasklist: fromTaskListId });
                    request.execute(function (tasks) {
                        tasks.items.forEach(function (currentTask) {
                            if (currentTask.id === taskId) {
                                delete currentTask.id;
                                delete currentTask.selfLink;
                                delete currentTask.parent;
                                delete currentTask.position;
                                delete currentTask.hidden;
                                delete currentTask.links;
                                var request_1 = gapi.client.tasks.tasks.insert({ tasklist: toTaskListId, previous: previousTaskId }, currentTask);
                                request_1.execute(function (newTask) {
                                    var newChildTasks = [];
                                    var oldChildTasks = tasks.items.filter(function (t) { return t.parent === taskId; });
                                    var index = 0;
                                    var moveChild = function () {
                                        var childTask = oldChildTasks[index];
                                        delete childTask.id;
                                        delete childTask.selfLink;
                                        delete childTask.parent;
                                        delete childTask.position;
                                        delete childTask.hidden;
                                        delete childTask.links;
                                        var request = gapi.client.tasks.tasks.insert({ tasklist: toTaskListId, parent: newTask.id }, childTask);
                                        request.execute(function (childTask) {
                                            newChildTasks.unshift(childTask);
                                            if (index + 1 === oldChildTasks.length) {
                                                var request_2 = gapi.client.tasks.tasks.delete({ tasklist: fromTaskListId, task: taskId });
                                                request_2.execute(function (empty) {
                                                    if (callback)
                                                        callback(newTask, newChildTasks);
                                                });
                                            }
                                            else {
                                                moveChild();
                                            }
                                            index++;
                                        });
                                    };
                                    moveChild();
                                });
                            }
                        });
                    });
                }
            });
        };
        Tasks.prototype.new = function (taskListId, parentTaskId, callback) {
            this.prepareApi(function () {
                var request = gapi.client.tasks.tasks.insert({ tasklist: taskListId, parent: parentTaskId });
                request.execute(function (resp) {
                    if (callback)
                        callback(resp);
                });
            });
        };
        return Tasks;
    })();
    Services.Tasks = Tasks;
})(Services || (Services = {}));
