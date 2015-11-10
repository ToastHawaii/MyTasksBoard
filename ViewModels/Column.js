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
                this.columnElement.classList.add("a-dropzone");
                this.columnElement.addEventListener("a-drop", function (ev) {
                    var cardElement = ev.dragSource;
                    var targetElement = ev.dragTarget;
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
