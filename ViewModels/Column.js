var ViewModels;
(function (ViewModels) {
    var Column = (function () {
        function Column(tasksService, taskList, hasAddButton, board, cards) {
            if (hasAddButton === void 0) { hasAddButton = false; }
            if (cards === void 0) { cards = []; }
            this.tasksService = tasksService;
            this.taskList = taskList;
            this.hasAddButton = hasAddButton;
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
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
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
