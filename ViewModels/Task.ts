namespace ViewModels {
    export class Task {
        public taskElement: HTMLDivElement;
        public checkboxElement: HTMLInputElement;
        public titleElement: HTMLSpanElement;

        public constructor(
            public completed: boolean,
            public title: string,
            public parentElement?: HTMLElement
        ) { }

        public render(parentElement = this.parentElement) {
            this.parentElement = parentElement;

            this.renderTask();

            this.renderTitle();
        }

        private renderTask() {
            this.taskElement = document.createElement("div");
            this.taskElement.className = "task" + (this.completed ? " completed" : "");
            this.parentElement.appendChild(this.taskElement);
        }

        private renderTitle() {
            this.checkboxElement = document.createElement("input");
            this.checkboxElement.type = "checkbox";
            this.checkboxElement.disabled = true;
            this.checkboxElement.checked = this.completed;
            this.taskElement.appendChild(this.checkboxElement);

            this.titleElement = document.createElement("span");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.title;
            this.taskElement.appendChild(this.titleElement);
        }
    }
}