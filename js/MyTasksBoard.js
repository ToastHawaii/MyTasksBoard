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
            var columnCompleted = new ViewModels.Column(tasksService, { title: "Abgeschlossen", etag: "", id: "", kind: "", selfLink: "", updated: "" });
            // get in create order
            taskLists.reverse();
            taskLists.unshift(taskLists.pop());
            var first = true;
            taskLists.forEach(function (taskList) {
                var column = new ViewModels.Column(tasksService, taskList, first);
                first = false;
                board.columns.push(column);
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
    new App().start();
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
var ViewModels;
(function (ViewModels) {
    var Board = (function () {
        function Board(columns, parentElement) {
            if (columns === void 0) { columns = []; }
            this.columns = columns;
            this.parentElement = parentElement;
        }
        Board.prototype.render = function (parentElement) {
            if (parentElement === void 0) { parentElement = this.parentElement; }
            this.parentElement = parentElement;
            this.renderBoard();
            this.renderColumns();
        };
        Board.prototype.renderBoard = function () {
            this.boardElement = document.createElement("div");
            this.boardElement.className = "board";
            this.parentElement.appendChild(this.boardElement);
        };
        Board.prototype.renderColumns = function () {
            for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                var c = _a[_i];
                c.render(this.boardElement);
            }
        };
        return Board;
    })();
    ViewModels.Board = Board;
})(ViewModels || (ViewModels = {}));
var ViewModels;
(function (ViewModels) {
    var Card = (function () {
        function Card(tasksService, taskList, task, tasks, parentElement) {
            if (tasks === void 0) { tasks = []; }
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.task = task;
            this.tasks = tasks;
            this.parentElement = parentElement;
        }
        Card.prototype.render = function (parentElement) {
            if (parentElement === void 0) { parentElement = this.parentElement; }
            this.parentElement = parentElement;
            this.renderCard();
            this.renderDue();
            this.renderTitle();
            this.renderDescription();
            this.renderTasks();
        };
        Card.prototype.renderCard = function () {
            this.cardElement = document.createElement("div");
            this.cardElement.id = "card-" + this.task.id;
            this.cardElement.className = "card";
            this.cardElement.draggable = true;
            this.cardElement.setAttribute("tasklistid", this.taskList.id);
            this.cardElement.setAttribute("taskid", this.task.id);
            this.cardElement.addEventListener("dragstart", function (ev) {
                ev.target.style.opacity = "0.4";
                ev.dataTransfer.setData("text", ev.target.id);
            }, false);
            this.cardElement.addEventListener("dragend", function (ev) {
                ev.target.style.opacity = "";
            }, false);
            this.cardElement.addEventListener("dragover", function (ev) { ev.preventDefault(); }, false);
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
        };
        Card.prototype.renderDue = function () {
            this.dueElement = document.createElement("div");
            this.dueElement.className = "due";
            if (this.task.due) {
                var dueDate = new Date(this.task.due);
                this.dueElement.innerText = dueDate.getDate() + "." + (dueDate.getMonth() + 1) + "." + dueDate.getFullYear();
            }
            this.cardElement.appendChild(this.dueElement);
        };
        Card.prototype.renderTitle = function () {
            var _this = this;
            this.titleElement = document.createElement("div");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.task.title;
            this.titleElement.contentEditable = "true";
            this.titleElement.addEventListener("input", function () {
                // remove html tags
                _this.titleElement.innerText = _this.titleElement.textContent;
            });
            this.titleElement.addEventListener("blur", function () {
                _this.task.title = _this.titleElement.innerText;
                _this.tasksService.update(_this.task, _this.taskList.id, _this.task.id);
            }, false);
            this.cardElement.appendChild(this.titleElement);
        };
        Card.prototype.renderDescription = function () {
            var _this = this;
            this.descriptionElement = document.createElement("div");
            this.descriptionElement.className = "description";
            if (this.task.notes) {
                this.descriptionElement.innerText = this.task.notes;
            }
            this.descriptionElement.contentEditable = "true";
            this.descriptionElement.addEventListener("input", function () {
                // remove html tags
                _this.descriptionElement.innerHTML = _this.descriptionElement.innerHTML.replace(/<br\s*\/?>/mg, "\n");
                _this.descriptionElement.innerText = _this.descriptionElement.textContent;
            });
            this.descriptionElement.addEventListener("blur", function () {
                _this.task.notes = _this.descriptionElement.innerText;
                _this.tasksService.update(_this.task, _this.taskList.id, _this.task.id);
            }, false);
            this.cardElement.appendChild(this.descriptionElement);
        };
        Card.prototype.renderTasks = function () {
            var _this = this;
            this.tasksElement = document.createElement("div");
            this.tasksElement.className = "tasks";
            this.cardElement.appendChild(this.tasksElement);
            this.newTaskElement = document.createElement("button");
            this.newTaskElement.className = "new";
            this.newTaskElement.innerText = "+";
            this.newTaskElement.addEventListener("click", function () {
                new Services.Tasks().new(_this.taskList.id, _this.task.id, function (task) {
                    var taskViewModel = new ViewModels.Task(_this.tasksService, _this.taskList, task, _this.tasksElement);
                    _this.tasks.push(taskViewModel);
                    taskViewModel.render();
                    _this.tasksElement.insertBefore(_this.tasksElement.lastChild, _this.tasksElement.children[1]);
                });
            });
            this.tasksElement.appendChild(this.newTaskElement);
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
    var Column = (function () {
        function Column(tasksService, taskList, hasAddButton, cards, parentElement) {
            if (hasAddButton === void 0) { hasAddButton = false; }
            if (cards === void 0) { cards = []; }
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.hasAddButton = hasAddButton;
            this.cards = cards;
            this.parentElement = parentElement;
        }
        Column.prototype.render = function (parentElement) {
            if (parentElement === void 0) { parentElement = this.parentElement; }
            this.parentElement = parentElement;
            this.renderColumn();
            this.renderName();
            if (this.hasAddButton)
                this.renderNewCard();
            this.renderCards();
        };
        Column.prototype.renderColumn = function () {
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
            this.parentElement.appendChild(this.columnElement);
        };
        Column.prototype.renderName = function () {
            this.nameElement = document.createElement("div");
            this.nameElement.className = "name";
            this.nameElement.innerText = this.taskList.title;
            this.columnElement.appendChild(this.nameElement);
        };
        Column.prototype.renderNewCard = function () {
            var _this = this;
            this.newCardElement = document.createElement("button");
            this.newCardElement.className = "new";
            this.newCardElement.innerText = "+";
            this.newCardElement.addEventListener("click", function () {
                new Services.Tasks().new(_this.taskList.id, "", function (task) {
                    var taskViewModel = new ViewModels.Card(_this.tasksService, _this.taskList, task, [], _this.columnElement);
                    _this.cards.push(taskViewModel);
                    taskViewModel.render();
                    _this.columnElement.insertBefore(_this.columnElement.lastChild, _this.columnElement.children[2]);
                });
            });
            this.columnElement.appendChild(this.newCardElement);
        };
        Column.prototype.renderCards = function () {
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
    var Task = (function () {
        function Task(tasksService, taskList, task, parentElement) {
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.task = task;
            this.parentElement = parentElement;
        }
        Task.prototype.render = function (parentElement) {
            if (parentElement === void 0) { parentElement = this.parentElement; }
            this.parentElement = parentElement;
            this.renderTask();
            this.renderTitle();
        };
        Task.prototype.renderTask = function () {
            this.taskElement = document.createElement("div");
            this.taskElement.className = "task " + this.task.status;
            this.parentElement.appendChild(this.taskElement);
        };
        Task.prototype.renderTitle = function () {
            var _this = this;
            this.checkboxElement = document.createElement("input");
            this.checkboxElement.type = "checkbox";
            this.checkboxElement.checked = this.task.status === "completed";
            this.checkboxElement.addEventListener("change", function () {
                _this.taskElement.className = "task" + (_this.checkboxElement.checked ? " completed" : "");
                if (_this.checkboxElement.checked) {
                    _this.task.status = "completed";
                }
                else {
                    _this.task.status = "needsAction";
                    delete _this.task.completed;
                }
                _this.tasksService.update(_this.task, _this.taskList.id, _this.task.id);
            }, false);
            this.taskElement.appendChild(this.checkboxElement);
            this.titleElement = document.createElement("span");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.task.title;
            this.titleElement.contentEditable = "true";
            this.titleElement.addEventListener("input", function () {
                // remove html tags
                _this.titleElement.innerText = _this.titleElement.textContent;
            });
            this.titleElement.addEventListener("blur", function () {
                _this.task.title = _this.titleElement.innerText;
                _this.tasksService.update(_this.task, _this.taskList.id, _this.task.id);
            }, false);
            this.taskElement.appendChild(this.titleElement);
        };
        return Task;
    })();
    ViewModels.Task = Task;
})(ViewModels || (ViewModels = {}));
//# sourceMappingURL=MyTasksBoard.js.map