namespace ViewModels {
    export class Card {
        public cardElement: HTMLDivElement;
        public titleElement: HTMLDivElement;
        public descriptionElement: HTMLDivElement;
        public dueElement: HTMLDivElement;
        public tasksElement: HTMLDivElement;
        public newTaskElement: HTMLButtonElement;

        public constructor(
            public tasksService: Services.Tasks,
            public taskList: gapi.client.TaskList,
            public task: gapi.client.Task,
            public tasks: Task[] = [],
            public parentElement?: HTMLElement
        ) { }

        public render(parentElement = this.parentElement) {
            this.parentElement = parentElement;

            this.renderCard();

            this.renderDue();

            this.renderTitle();

            this.renderDescription();

            this.renderTasks();
        }

        private renderCard() {
            this.cardElement = document.createElement("div");
            this.cardElement.id = "card-" + this.task.id;
            this.cardElement.className = "card";
            this.cardElement.draggable = true;
            this.cardElement.setAttribute("tasklistid", this.taskList.id);
            this.cardElement.setAttribute("taskid", this.task.id);

            this.cardElement.addEventListener("dragstart", ev => {
                (<HTMLDivElement>ev.target).style.opacity = "0.4";
                ev.dataTransfer.setData("text", (<HTMLDivElement>ev.target).id);
            }, false);
            this.cardElement.addEventListener("dragend", ev => {
                (<HTMLDivElement>ev.target).style.opacity = "";
            }, false);
            this.cardElement.addEventListener("dragover", ev => { ev.preventDefault(); }, false);
            this.cardElement.addEventListener("drop", ev => {
                ev.preventDefault();
                let cardElement = document.getElementById(ev.dataTransfer.getData("text"));
                let targetElement = <HTMLDivElement>ev.currentTarget;

                if (ev.offsetY > (<HTMLDivElement>ev.currentTarget).clientHeight / 2 - 8) {
                    cardElement.parentNode.insertBefore(cardElement, targetElement);
                    targetElement.parentNode.insertBefore(targetElement, cardElement);
                    new Services.Tasks().move(cardElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"));
                } else {
                    cardElement.parentNode.insertBefore(cardElement, targetElement);
                    new Services.Tasks().move(cardElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"), () => {
                        new Services.Tasks().move(cardElement.getAttribute("tasklistid"), targetElement.getAttribute("taskid"), cardElement.getAttribute("taskid"));
                    });
                }
            }, false);
            this.parentElement.appendChild(this.cardElement);
        }

        private renderDue() {
            this.dueElement = document.createElement("div");
            this.dueElement.className = "due";
            if (this.task.due) {
                var dueDate = new Date(this.task.due);
                this.dueElement.innerText = dueDate.getDate() + "." + (dueDate.getMonth() + 1) + "." + dueDate.getFullYear();
            }
            this.cardElement.appendChild(this.dueElement);
        }

        private renderTitle() {
            this.titleElement = document.createElement("div");
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
            this.cardElement.appendChild(this.titleElement);
        }

        private renderDescription() {
            this.descriptionElement = document.createElement("div");
            this.descriptionElement.className = "description";
            if (this.task.notes) {
                this.descriptionElement.innerText = this.task.notes;
            }
            this.descriptionElement.contentEditable = "true";
            this.descriptionElement.addEventListener("input", () => {
                // remove html tags
                this.descriptionElement.innerHTML = this.descriptionElement.innerHTML.replace(/<br\s*\/?>/mg, "\n");
                this.descriptionElement.innerText = this.descriptionElement.textContent;
            });
            this.descriptionElement.addEventListener("blur", () => {
                this.task.notes = this.descriptionElement.innerText;
                this.tasksService.update(this.task, this.taskList.id, this.task.id);
            }, false);
            this.cardElement.appendChild(this.descriptionElement);
        }

        private renderTasks() {
            this.tasksElement = document.createElement("div");
            this.tasksElement.className = "tasks";
            this.cardElement.appendChild(this.tasksElement);

            this.newTaskElement = document.createElement("button");
            this.newTaskElement.className = "new";
            this.newTaskElement.innerText = "+";
            this.newTaskElement.addEventListener("click", () => {
                new Services.Tasks().new(this.taskList.id, this.task.id, task => {
                    let taskViewModel = new Task(this.tasksService, this.taskList, task, this.tasksElement);
                    this.tasks.push(taskViewModel);
                    taskViewModel.render();
                    this.tasksElement.insertBefore(this.tasksElement.lastChild, this.tasksElement.children[1]);
                });
            });
            this.tasksElement.appendChild(this.newTaskElement);

            for (let t of this.tasks) {
                t.render(this.tasksElement);
            }

        }
    }
}  