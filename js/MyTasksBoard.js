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
        var _this = this;
        var tasksService = new Services.Tasks();
        tasksService.loadTaskLists(function (taskLists) {
            _this.board = new ViewModels.Board([], document.getElementById("app"));
            var columnCompleted = new ViewModels.Column(tasksService, { title: "Abgeschlossen", etag: "", id: "", kind: "", selfLink: "", updated: "" }, false, true);
            // get in create order
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
window.onload = function () {
    app = new App();
    app.start();
};
function init() {
    var draggables = document.getElementsByClassName("a-draggable");
    for (var i = 0; i < draggables.length; i++) {
        var d = draggables[i];
        d.setAttribute("draggable", "true");
        d.addEventListener("dragstart", function (ev) {
            var source = ev.target;
            document.aDragSource = source;
            document.aDragSource.classList.add("a-drag");
            document.aDragSource.style.position = "relative";
            startX = ev.clientX;
            startY = ev.clientY;
            document.aDragSource.style.left = 0 + "px";
            document.aDragSource.style.top = 0 + "px";
        }, false);
        var startX = 0;
        var startY = 0;
        d.addEventListener("touchstart", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.classList.add("a-drag");
                document.aDragSource.style.position = "relative";
                startX = ev.changedTouches[0].clientX;
                startY = ev.changedTouches[0].clientY;
                document.aDragSource.style.left = 0 + "px";
                document.aDragSource.style.top = 0 + "px";
            }
        }, true);
        d.addEventListener("dragend", function (ev) {
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.classList.remove("a-drag");
            }
        }, false);
        d.addEventListener("drag", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.style.left = ev.movementX + "px";
                document.aDragSource.style.top = ev.movementY + "px";
            }
        }, true);
        d.addEventListener("touchmove", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.style.left = ev.changedTouches[0].clientX - startX + "px";
                document.aDragSource.style.top = ev.changedTouches[0].clientY - startY + "px";
            }
        }, true);
        d.addEventListener("touchend", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.classList.remove("a-drag");
                document.aDragSource.style.position = "";
                document.aDragTarget = document.elementFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
                document.aDragTarget = closet(document.aDragTarget, "a-dropzone");
                if (document.aDragTarget) {
                    var aDropEvent = new Event("a-drop");
                    aDropEvent.dragTarget = document.aDragTarget;
                    aDropEvent.dragSource = document.aDragSource;
                    if (document.aDragTarget.clientTop + document.aDragTarget.clientHeight / 2 > ev.changedTouches[0].clientY) {
                        aDropEvent.dragTop = true;
                        aDropEvent.dragBottom = false;
                    }
                    else {
                        aDropEvent.dragTop = false;
                        aDropEvent.dragBottom = true;
                    }
                    document.aDragTarget.dispatchEvent(aDropEvent);
                }
            }
        }, true);
    }
    var dropzones = document.getElementsByClassName("a-dropzone");
    for (var i = 0; i < dropzones.length; i++) {
        var d = dropzones[i];
        d.addEventListener("dragover", function (ev) {
            ev.preventDefault();
        }, false);
        d.addEventListener("drop", function (ev) {
            document.aDragTarget = ev.currentTarget;
            document.aDragTarget = closet(document.aDragTarget, "a-dropzone");
            var aDropEvent = new Event("a-drop");
            aDropEvent.dragTarget = document.aDragTarget;
            aDropEvent.dragSource = document.aDragSource;
            if (document.aDragTarget.clientTop + document.aDragTarget.clientHeight / 2 > ev.clientY) {
                aDropEvent.dragTop = true;
                aDropEvent.dragBottom = false;
            }
            else {
                aDropEvent.dragTop = false;
                aDropEvent.dragBottom = true;
            }
            document.aDragTarget.dispatchEvent(aDropEvent);
        }, false);
    }
}
function closet(element, className) {
    if (element.classList.contains(className))
        return element;
    while ((element = element.parentElement) && !element.classList.contains(className))
        ;
    return element;
}
setTimeout(init, 3000);
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
        Tasks.prototype.moveBefore = function (fromTaskListId, toTaskListId, taskId, followTaskId, callback) {
            var _this = this;
            this.moveAfter(fromTaskListId, toTaskListId, taskId, followTaskId, function (task) {
                _this.moveAfter(toTaskListId, toTaskListId, followTaskId, task ? task.id : taskId, callback);
            });
        };
        Tasks.prototype.moveAfter = function (fromTaskListId, toTaskListId, taskId, previousTaskId, callback) {
            this.prepareApi(function () {
                if (fromTaskListId === toTaskListId) {
                    // same list
                    var request = gapi.client.tasks.tasks.move({ tasklist: fromTaskListId, task: taskId, previous: previousTaskId });
                    request.execute(function (resp) {
                        if (callback)
                            callback();
                    });
                }
                else {
                    // move to other list
                    // load task
                    var request = gapi.client.tasks.tasks.list({ tasklist: fromTaskListId });
                    request.execute(function (tasks) {
                        tasks.items.forEach(function (currentTask) {
                            if (currentTask.id === taskId) {
                                // create new task in the other list
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
                                        // create new child task in the other list
                                        var oldChildTaskId = childTask.id;
                                        delete childTask.id;
                                        delete childTask.selfLink;
                                        delete childTask.parent;
                                        delete childTask.position;
                                        delete childTask.hidden;
                                        delete childTask.links;
                                        var request = gapi.client.tasks.tasks.insert({ tasklist: toTaskListId, parent: newTask.id }, childTask);
                                        request.execute(function (childTask) {
                                            var request = gapi.client.tasks.tasks.delete({ tasklist: fromTaskListId, task: oldChildTaskId }).execute(function () { });
                                            newChildTasks.unshift(childTask);
                                            if (index + 1 === oldChildTasks.length) {
                                                // delete old task
                                                var request_2 = gapi.client.tasks.tasks.delete({ tasklist: fromTaskListId, task: taskId });
                                                request_2.execute(function (empty) {
                                                    if (callback)
                                                        callback(newTask, newChildTasks);
                                                });
                                            }
                                            else {
                                                index++;
                                                moveChild();
                                            }
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
var ViewModels;
(function (ViewModels) {
    var Task = (function () {
        function Task(tasksService, taskList, task, card) {
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.task = task;
            this.card = card;
        }
        Task.prototype.render = function (card) {
            if (card === void 0) { card = this.card; }
            this.card = card;
            this.renderTask();
            this.renderTitle();
        };
        Task.prototype.renderTask = function () {
            this.taskElement = document.createElement("div");
            this.taskElement.className = "task " + this.task.status;
            this.card.tasksElement.appendChild(this.taskElement);
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
var ViewModels;
(function (ViewModels) {
    var Column = (function () {
        function Column(tasksService, taskList, hasAddButton, completeTasks, board, cards) {
            if (hasAddButton === void 0) { hasAddButton = false; }
            if (completeTasks === void 0) { completeTasks = false; }
            if (cards === void 0) { cards = []; }
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.hasAddButton = hasAddButton;
            this.completeTasks = completeTasks;
            this.board = board;
            this.cards = cards;
        }
        Column.prototype.render = function (board) {
            if (board === void 0) { board = this.board; }
            this.board = board;
            this.renderColumn();
            this.renderName();
            if (this.hasAddButton)
                this.renderNewCard();
            this.renderCards();
        };
        Column.prototype.renderColumn = function () {
            var _this = this;
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
            if (this.completeTasks) {
                this.columnElement.addEventListener("dragover", function (ev) { ev.preventDefault(); }, false);
                this.columnElement.addEventListener("drop", function (ev) {
                    ev.preventDefault();
                    var cardElement = document.getElementById(ev.dataTransfer.getData("text"));
                    var targetElement = ev.currentTarget;
                    targetElement.insertBefore(cardElement, targetElement.childNodes[1]);
                    var oldTaskListId = cardElement.getAttribute("tasklistid");
                    var oldColumn = app.board.columns.filter(function (c) { return c.taskList.id === oldTaskListId; })[0];
                    var oldTaskId = cardElement.getAttribute("taskid");
                    var oldCardPos = 0;
                    oldColumn.cards.forEach(function (c, i) {
                        if (c.task.id === oldTaskId) {
                            oldCardPos = i;
                        }
                    });
                    var card = oldColumn.cards.splice(oldCardPos, 1)[0];
                    card.task.status = "completed";
                    new Services.Tasks().update(card.task, oldTaskListId, oldTaskId, function () {
                        _this.cards.unshift(card);
                    });
                });
            }
            this.board.boardElement.appendChild(this.columnElement);
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
                    var taskViewModel = new ViewModels.Card(_this.tasksService, _this.taskList, task, _this, []);
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
                c.render(this);
            }
        };
        return Column;
    })();
    ViewModels.Column = Column;
})(ViewModels || (ViewModels = {}));
var ViewModels;
(function (ViewModels) {
    var Card = (function () {
        function Card(tasksService, taskList, task, column, tasks) {
            if (tasks === void 0) { tasks = []; }
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.task = task;
            this.column = column;
            this.tasks = tasks;
        }
        Card.prototype.render = function (column) {
            if (column === void 0) { column = this.column; }
            this.column = column;
            this.renderCard();
            this.renderDue();
            this.renderTitle();
            this.renderDescription();
            this.renderTasks();
        };
        Card.prototype.renderCard = function () {
            var _this = this;
            this.cardElement = document.createElement("div");
            this.cardElement.id = "card-" + this.task.id;
            this.cardElement.className = "card a-draggable a-dropzone";
            this.cardElement.draggable = true;
            this.cardElement.setAttribute("tasklistid", this.taskList.id);
            this.cardElement.setAttribute("taskid", this.task.id);
            this.cardElement.addEventListener("a-drop", function (ev) {
                var cardElement = ev.dragSource;
                var targetElement = ev.dragTarget;
                if (ev.dragTop) {
                    targetElement.parentNode.insertBefore(cardElement, targetElement);
                    targetElement.parentNode.insertBefore(targetElement, cardElement);
                    new Services.Tasks()
                        .moveAfter(cardElement.getAttribute("tasklistid"), targetElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"), function (newTask, newChildTasks) {
                        if (newTask) {
                            var oldTaskListId = cardElement.getAttribute("tasklistid");
                            var oldColumn = _this.column.board.columns.filter(function (c) { return c.taskList.id === oldTaskListId; })[0];
                            var oldTaskId = cardElement.getAttribute("taskid");
                            var oldCardPos = 0;
                            oldColumn.cards.forEach(function (c, i) {
                                if (c.task.id === oldTaskId) {
                                    oldCardPos = i;
                                }
                            });
                            var card = oldColumn.cards.splice(oldCardPos, 1)[0];
                            _this.column.cards.push(card);
                            card.taskList = _this.column.taskList;
                            card.task = newTask;
                            card.column = _this.column;
                            card.cardElement.setAttribute("tasklistid", _this.column.taskList.id);
                            card.cardElement.setAttribute("taskid", newTask.id);
                            card.tasks.forEach(function (t, i) {
                                t.card = card;
                                t.task = newChildTasks[i];
                            });
                        }
                    });
                }
                else {
                    targetElement.parentNode.insertBefore(cardElement, targetElement);
                    new Services.Tasks()
                        .moveBefore(cardElement.getAttribute("tasklistid"), targetElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"), function (newTask, newChildTasks) {
                        if (newTask) {
                            var oldTaskListId = cardElement.getAttribute("tasklistid");
                            var oldColumn = _this.column.board.columns.filter(function (c) { return c.taskList.id === oldTaskListId; })[0];
                            var oldTaskId = cardElement.getAttribute("taskid");
                            var oldCardPos = 0;
                            oldColumn.cards.forEach(function (c, i) {
                                if (c.task.id === oldTaskId) {
                                    oldCardPos = i;
                                }
                            });
                            var card = oldColumn.cards.splice(oldCardPos, 1)[0];
                            _this.column.cards.push(card);
                            card.taskList = _this.column.taskList;
                            card.task = newTask;
                            card.column = _this.column;
                            card.cardElement.setAttribute("tasklistid", _this.column.taskList.id);
                            card.cardElement.setAttribute("taskid", newTask.id);
                            card.tasks.forEach(function (t, i) {
                                t.card = card;
                                t.task = newChildTasks[i];
                            });
                        }
                    });
                }
            });
            this.column.columnElement.appendChild(this.cardElement);
        };
        Card.prototype.renderDue = function () {
            this.dueElement = document.createElement("input");
            this.dueElement.type = "date";
            this.dueElement.className = "due";
            if (this.task.due) {
                var dueDate = new Date(this.task.due);
                this.dueElement.valueAsDate = dueDate;
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
                    var taskViewModel = new ViewModels.Task(_this.tasksService, _this.taskList, task, _this);
                    _this.tasks.push(taskViewModel);
                    taskViewModel.render();
                    _this.tasksElement.insertBefore(_this.tasksElement.lastChild, _this.tasksElement.children[1]);
                });
            });
            this.tasksElement.appendChild(this.newTaskElement);
            for (var _i = 0, _a = this.tasks; _i < _a.length; _i++) {
                var t = _a[_i];
                t.render(this);
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
                c.render(this);
            }
        };
        return Board;
    })();
    ViewModels.Board = Board;
})(ViewModels || (ViewModels = {}));
//# sourceMappingURL=MyTasksBoard.js.map