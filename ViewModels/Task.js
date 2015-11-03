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
