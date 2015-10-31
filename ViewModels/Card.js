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
