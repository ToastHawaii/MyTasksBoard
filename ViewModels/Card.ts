namespace ViewModels {
    export class Card {
        public cardElement: HTMLDivElement;
        public titleElement: HTMLDivElement;
        public descriptionElement: HTMLDivElement;
        public dueElement: HTMLDivElement;
        public tasksElement: HTMLDivElement;

        public onTitleChange: (newValue: string) => void;
        public onDescriptionChange: (newValue: string) => void;

        public constructor(
            public taskService: Services.Tasks,
            public taskListId: string,
            public taskId: string,
            public title: string,
            public description: string,
            public due: string,
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
            this.cardElement.id = "card-" + this.taskId;
            this.cardElement.className = "card";
            this.cardElement.draggable = true;
            this.cardElement.setAttribute("tasklistid", this.taskListId);
            this.cardElement.setAttribute("taskid", this.taskId);

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
            if (this.due) {
                var dueDate = new Date(this.due);
                this.dueElement.innerText = dueDate.getDate() + "." + (dueDate.getMonth() + 1) + "." + dueDate.getFullYear();
            }
            this.cardElement.appendChild(this.dueElement);
        }

        private renderTitle() {
            this.titleElement = document.createElement("div");
            this.titleElement.className = "title";
            this.titleElement.innerText = this.title;
            this.titleElement.contentEditable = "true";
            this.titleElement.addEventListener("input", () => {
                // remove html tags
                this.titleElement.innerText = this.titleElement.textContent;
            });
            this.titleElement.addEventListener("blur", () => {
                if (this.onTitleChange) {
                    this.onTitleChange(this.titleElement.innerText);
                }
            }, false);
            this.cardElement.appendChild(this.titleElement);
        }

        private renderDescription() {
            this.descriptionElement = document.createElement("div");
            this.descriptionElement.className = "description";
            if (this.description) {
                this.descriptionElement.innerText = this.description;
            }
            this.descriptionElement.contentEditable = "true";
            this.descriptionElement.addEventListener("input", () => {
                // remove html tags
                this.descriptionElement.innerText = this.descriptionElement.textContent;
            });
            this.descriptionElement.addEventListener("blur", () => {
                if (this.onDescriptionChange) {
                    this.onDescriptionChange(this.descriptionElement.innerText);
                }
            }, false);
            this.cardElement.appendChild(this.descriptionElement);
        }

        private renderTasks() {
            this.tasksElement = document.createElement("div");
            this.tasksElement.className = "tasks";
            this.cardElement.appendChild(this.tasksElement);

            for (let t of this.tasks) {
                t.render(this.tasksElement);
            }
        }
    }
}  