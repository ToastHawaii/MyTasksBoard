var App = (function () {
    function App() {
        var _this = this;
        this.checkAuthCallback = function (authorized) {
            var authorizeButton = document.getElementById("authorize");
            if (authorized) {
                // Hide auth UI, then load client library.
                authorizeButton.style.display = "none";
                _this.render();
            }
            else {
                // Show auth UI, allowing the user to initiate authorization by
                // clicking authorize button.
                authorizeButton.style.display = "inline";
            }
        };
    }
    App.prototype.render = function () {
        var tasksService = new Services.Tasks();
        tasksService.loadTaskLists(function (taskLists) {
            var board = new ViewModels.Board([], document.getElementById("app"));
            var columnCompleted = new ViewModels.Column("Abgeschlossen");
            // get in create order
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
window.onload = function () {
    var app = new App();
    app.start();
};
var Services;
(function (Services) {
    var Auth = (function () {
        function Auth(clientId) {
            this.clientId = clientId;
            this.scopes = ["https://www.googleapis.com/auth/tasks"];
        }
        /**
         * Check if current user has authorized this application.
         */
        Auth.prototype.checkAuth = function (callback) {
            gapi.auth.authorize({
                "client_id": this.clientId,
                "scope": this.scopes.join(" "),
                "immediate": true
            }, function (authResult) {
                callback(authResult && !authResult.error);
            });
        };
        /**
         * Initiate auth flow.
         */
        Auth.prototype.auth = function (callback) {
            gapi.auth.authorize({ client_id: this.clientId, scope: this.scopes, immediate: false }, function (authResult) {
                callback(authResult && !authResult.error);
            });
        };
        return Auth;
    })();
    Services.Auth = Auth;
})(Services || (Services = {}));
var Services;
(function (Services) {
    var Tasks = (function () {
        function Tasks() {
        }
        Tasks.prototype.prepareApi = function (callback) {
            if (!gapi.client.tasks) {
                // Load Google Tasks API client library.
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
        Tasks.prototype.move = function (taskListId, taskId, previousTaskId, callback) {
            this.prepareApi(function () {
                var request = gapi.client.tasks.tasks.move({ tasklist: taskListId, task: taskId, previous: previousTaskId });
                request.execute(function (resp) {
                    if (callback)
                        callback();
                });
            });
        };
        return Tasks;
    })();
    Services.Tasks = Tasks;
})(Services || (Services = {}));
var ViewModels;
(function (ViewModels) {
    var Task = (function () {
        function Task(completed, title, parentElement) {
            this.completed = completed;
            this.title = title;
            this.parentElement = parentElement;
        }
        Task.prototype.render = function (parentElement) {
            this.parentElement = this.parentElement || parentElement;
            this.taskElement = document.createElement("div");
            this.taskElement.className = "task" + (this.completed ? " completed" : "");
            this.parentElement.appendChild(this.taskElement);
            this.checkboxElement = document.createElement("input");
            this.checkboxElement.type = "checkbox";
            this.checkboxElement.disabled = true;
            this.checkboxElement.checked = this.completed;
            this.taskElement.appendChild(this.checkboxElement);
            this.titleElement = document.createElement("span");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.title;
            this.taskElement.appendChild(this.titleElement);
        };
        return Task;
    })();
    ViewModels.Task = Task;
})(ViewModels || (ViewModels = {}));
var ViewModels;
(function (ViewModels) {
    var Column = (function () {
        function Column(name, cards, parentElement) {
            if (cards === void 0) { cards = []; }
            this.name = name;
            this.cards = cards;
            this.parentElement = parentElement;
        }
        Column.prototype.render = function (parentElement) {
            this.parentElement = this.parentElement || parentElement;
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
            this.parentElement.appendChild(this.columnElement);
            this.nameElement = document.createElement("div");
            this.nameElement.className = "name";
            this.nameElement.innerText = this.name;
            this.columnElement.appendChild(this.nameElement);
            for (var _i = 0, _a = this.cards; _i < _a.length; _i++) {
                var c = _a[_i];
                c.render(this.columnElement);
            }
        };
        return Column;
    })();
    ViewModels.Column = Column;
})(ViewModels || (ViewModels = {}));
var ViewModels;
(function (ViewModels) {
    var Card = (function () {
        function Card(taskService, taskListId, taskId, title, description, due, tasks, parentElement) {
            if (tasks === void 0) { tasks = []; }
            this.taskService = taskService;
            this.taskListId = taskListId;
            this.taskId = taskId;
            this.title = title;
            this.description = description;
            this.due = due;
            this.tasks = tasks;
            this.parentElement = parentElement;
        }
        Card.prototype.render = function (parentElement) {
            var _this = this;
            this.parentElement = this.parentElement || parentElement;
            this.cardElement = document.createElement("div");
            this.cardElement.id = "card-" + this.taskId;
            this.cardElement.className = "card";
            this.cardElement.draggable = true;
            this.cardElement.setAttribute("tasklistid", this.taskListId);
            this.cardElement.setAttribute("taskid", this.taskId);
            this.cardElement.addEventListener("dragstart", function (ev) {
                ev.target.style.opacity = "0.4";
                ev.dataTransfer.setData("text", ev.target.id);
            }, false);
            this.cardElement.addEventListener("dragend", function (ev) {
                ev.target.style.opacity = "";
            }, false);
            this.cardElement.addEventListener("dragover", function (ev) {
                ev.preventDefault();
            }, false);
            this.cardElement.addEventListener("drop", function (ev) {
                ev.preventDefault();
                var cardElement = document.getElementById(ev.dataTransfer.getData("text"));
                var targetElement = ev.currentTarget;
                if (ev.offsetY > ev.currentTarget.clientHeight / 2 - 8) {
                    cardElement.parentNode.insertBefore(cardElement, targetElement);
                    targetElement.parentNode.insertBefore(targetElement, cardElement);
                    new Services.Tasks().move(cardElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"));
                }
                else {
                    cardElement.parentNode.insertBefore(cardElement, targetElement);
                    new Services.Tasks().move(cardElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"), function () {
                        new Services.Tasks().move(cardElement.getAttribute("tasklistid"), targetElement.getAttribute("taskid"), cardElement.getAttribute("taskid"));
                    });
                }
            }, false);
            this.parentElement.appendChild(this.cardElement);
            this.dueElement = document.createElement("div");
            this.dueElement.className = "due";
            if (this.due) {
                var dueDate = new Date(this.due);
                this.dueElement.innerText = dueDate.getDate() + "." + (dueDate.getMonth() + 1) + "." + dueDate.getFullYear();
            }
            this.cardElement.appendChild(this.dueElement);
            this.titleElement = document.createElement("div");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.title;
            this.titleElement.contentEditable = "true";
            this.titleElement.addEventListener("input", function () {
                // remove html tags
                _this.titleElement.innerText = _this.titleElement.textContent;
            });
            this.titleElement.addEventListener("blur", function () {
                if (_this.onTitleChange) {
                    _this.onTitleChange(_this.titleElement.innerText);
                }
            }, false);
            this.cardElement.appendChild(this.titleElement);
            this.descriptionElement = document.createElement("div");
            this.descriptionElement.className = "description";
            if (this.description) {
                this.descriptionElement.innerText = this.description;
            }
            this.descriptionElement.contentEditable = "true";
            this.descriptionElement.addEventListener("input", function () {
                // remove html tags
                _this.descriptionElement.innerText = _this.descriptionElement.textContent;
            });
            this.descriptionElement.addEventListener("blur", function () {
                if (_this.onDescriptionChange) {
                    _this.onDescriptionChange(_this.descriptionElement.innerText);
                }
            }, false);
            this.cardElement.appendChild(this.descriptionElement);
            this.tasksElement = document.createElement("div");
            this.tasksElement.className = "tasks";
            this.cardElement.appendChild(this.tasksElement);
            for (var _i = 0, _a = this.tasks; _i < _a.length; _i++) {
                var t = _a[_i];
                t.render(this.tasksElement);
            }
        };
        return Card;
    })();
    ViewModels.Card = Card;
})(ViewModels || (ViewModels = {}));
var ViewModels;
(function (ViewModels) {
    var Board = (function () {
        function Board(columns, parentElement) {
            if (columns === void 0) { columns = []; }
            this.columns = columns;
            this.parentElement = parentElement;
        }
        Board.prototype.render = function (parentElement) {
            this.parentElement = this.parentElement || parentElement;
            this.boardElement = document.createElement("div");
            this.boardElement.className = "board";
            this.parentElement.appendChild(this.boardElement);
            for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                var c = _a[_i];
                c.render(this.boardElement);
            }
        };
        return Board;
    })();
    ViewModels.Board = Board;
})(ViewModels || (ViewModels = {}));
//# sourceMappingURL=MyTasksBoard.js.map