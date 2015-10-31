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
