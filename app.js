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
        var _this = this;
        var tasksService = new Services.Tasks();
        tasksService.loadTaskLists(function (taskLists) {
            _this.board = new ViewModels.Board([], document.getElementById("app"));
            var columnCompleted = new ViewModels.Column(tasksService, { title: "Abgeschlossen", etag: "", id: "", kind: "", selfLink: "", updated: "" }, false, true);
            taskLists.reverse();
            taskLists.unshift(taskLists.pop());
            var first = true;
            taskLists.forEach(function (taskList) {
                var column = new ViewModels.Column(tasksService, taskList, first);
                first = false;
                _this.board.columns.push(column);
                tasksService.loadTasks(taskList.id, function (tasks) {
                    tasks.forEach(function (task) {
                        var card = new ViewModels.Card(tasksService, taskList, task);
                        tasks.forEach(function (childTask) {
                            if (task.id === childTask.parent) {
                                var taskViewModel = new ViewModels.Task(tasksService, taskList, childTask);
                                card.tasks.push(taskViewModel);
                            }
                        });
                        if (!task.parent) {
                            if (!task.completed) {
                                if (!task.hidden) {
                                    column.cards.push(card);
                                    card.render(column);
                                }
                            }
                            else {
                                columnCompleted.cards.push(card);
                                card.render(columnCompleted);
                            }
                        }
                    });
                });
            });
            _this.board.columns.push(columnCompleted);
            _this.board.render();
            _this.board.columns[_this.board.columns.length - 1].columnElement.className += " completed";
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
