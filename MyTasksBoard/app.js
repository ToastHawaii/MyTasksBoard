var App = (function () {
    function App() {
        var _this = this;
        this.checkAuthCallback = function (authorized) {
            var authorizeButton = document.getElementById("authorize");
            if (authorized) {
                authorizeButton.style.display = "none";
                _this.render();
            }
            else {
                authorizeButton.style.display = "inline";
            }
        };
    }
    App.prototype.render = function () {
        var tasksService = new Services.Tasks();
        tasksService.loadTaskLists(function (taskLists) {
            var board = new ViewModels.Board([], document.getElementById("app"));
            var columnCompleted = new ViewModels.Column("Abgeschlossen");
            taskLists.reverse();
            taskLists.unshift(taskLists.pop());
            taskLists.forEach(function (taskList) {
                var column = new ViewModels.Column(taskList.title);
                board.columns.push(column);
                tasksService.loadTasks(taskList.id, function (tasks) {
                    tasks.forEach(function (task) {
                        var card = new ViewModels.Card(tasksService, taskList.id, task.id, task.title, task.notes, task.due);
                        card.onTitleChange = function (newValue) {
                            task.title = newValue;
                            tasksService.update(task, taskList.id, task.id);
                        };
                        card.onDescriptionChange = function (newValue) {
                            task.notes = newValue;
                            tasksService.update(task, taskList.id, task.id);
                        };
                        tasks.forEach(function (childTask) {
                            if (task.id === childTask.parent) {
                                card.tasks.push(new ViewModels.Task(typeof childTask.completed != "undefined", childTask.title));
                            }
                        });
                        if (!task.parent) {
                            if (!task.completed) {
                                if (!task.hidden) {
                                    column.cards.push(card);
                                    card.render(column.columnElement);
                                }
                            }
                            else {
                                columnCompleted.cards.push(card);
                                card.render(columnCompleted.columnElement);
                            }
                        }
                    });
                });
            });
            board.columns.push(columnCompleted);
            board.render();
            board.columns[board.columns.length - 1].columnElement.className += " completed";
        });
    };
    App.prototype.start = function () {
        var _this = this;
        var authService = new Services.Auth("1072354952697-l6ihrtohski9e023vtaub4o2f5hih88m.apps.googleusercontent.com");
        document.getElementById("authorize")
            .addEventListener("click", function (ev) {
            authService.auth(_this.checkAuthCallback);
            return false;
        });
        authService.checkAuth(this.checkAuthCallback);
    };
    return App;
})();
