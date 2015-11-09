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
            var _this = this;
            this.dueElement = document.createElement("input");
            this.dueElement.type = "date";
            this.dueElement.className = "due";
            if (this.task.due) {
                var dueDate = new Date(this.task.due);
                this.dueElement.valueAsDate = dueDate;
            }
            this.dueElement.setAttribute("value", this.dueElement.value);
            this.dueElement.addEventListener("blur", function () {
                _this.dueElement.setAttribute("value", _this.dueElement.value);
                if (_this.dueElement.value) {
                    _this.task.due = _this.dueElement.valueAsDate.toISOString();
                }
                else {
                    _this.task.due = "";
                }
                _this.tasksService.update(_this.task, _this.taskList.id, _this.task.id);
            });
            this.cardElement.appendChild(this.dueElement);
        };
        Card.prototype.renderTitle = function () {
            var _this = this;
            this.titleElement = document.createElement("div");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.task.title;
            this.titleElement.contentEditable = "true";
            this.titleElement.addEventListener("input", function () {
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
