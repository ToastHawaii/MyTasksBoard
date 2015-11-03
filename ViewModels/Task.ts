namespace ViewModels {
    export class Task {
        public taskElement: HTMLDivElement;
        public checkboxElement: HTMLInputElement;
        public titleElement: HTMLSpanElement;

        public constructor(
            public tasksService: Services.Tasks,
            public taskList: gapi.client.TaskList,
            public task: gapi.client.Task,
            public card?: Card
        ) { }

        public render(card = this.card) {
            this.card = card;

            this.renderTask();

            this.renderTitle();
        }

        private renderTask() {
            this.taskElement = document.createElement("div");
            this.taskElement.className = "task " + this.task.status;
            this.card.tasksElement.appendChild(this.taskElement);
        }

        private renderTitle() {
            this.checkboxElement = document.createElement("input");
            this.checkboxElement.type = "checkbox";
            this.checkboxElement.checked = this.task.status === "completed";
            this.checkboxElement.addEventListener("change", () => {
                this.taskElement.className = "task" + (this.checkboxElement.checked ? " completed" : "");

                if (this.checkboxElement.checked) {
                    this.task.status = "completed";
                } else {
                    this.task.status = "needsAction";
                    delete this.task.completed;
                }

                this.tasksService.update(this.task, this.taskList.id, this.task.id);
            }, false);
            this.taskElement.appendChild(this.checkboxElement);

            this.titleElement = document.createElement("span");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.task.title;
            this.titleElement.contentEditable = "true";
            this.titleElement.addEventListener("input", () => {
                // remove html tags
                this.titleElement.innerText = this.titleElement.textContent;
            });
            this.titleElement.addEventListener("blur", () => {
                this.task.title = this.titleElement.innerText;
                this.tasksService.update(this.task, this.taskList.id, this.task.id);
            }, false);
            this.taskElement.appendChild(this.titleElement);
        }
    }
}