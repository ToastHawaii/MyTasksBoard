namespace ViewModels {
    export class Card {
        public cardElement: HTMLDivElement;
        public titleElement: HTMLDivElement;
        public descriptionElement: HTMLDivElement;
        public dueElement: HTMLInputElement;
        public tasksElement: HTMLDivElement;
        public newTaskElement: HTMLButtonElement;

        public constructor(
            public tasksService: Services.Tasks,
            public taskList: gapi.client.TaskList,
            public task: gapi.client.Task,
            public column?: Column,
            public tasks: Task[] = []
        ) { }

        public render(column = this.column) {
            this.column = column;

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
                    targetElement.parentNode.insertBefore(cardElement, targetElement);
                    targetElement.parentNode.insertBefore(targetElement, cardElement);
                    new Services.Tasks()
                        .moveAfter(cardElement.getAttribute("tasklistid"), targetElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"),
                        (newTask, newChildTasks) => {
                            if (newTask) {
                                let oldTaskListId = cardElement.getAttribute("tasklistid");
                                let oldColumn = this.column.board.columns.filter(c => c.taskList.id === oldTaskListId)[0];
                                let oldTaskId = cardElement.getAttribute("taskid");

                                let oldCardPos = 0;
                                oldColumn.cards.forEach((c, i) => {
                                    if (c.task.id === oldTaskId) {
                                        oldCardPos = i;
                                    }
                                });

                                let card = oldColumn.cards.splice(oldCardPos, 1)[0];

                                this.column.cards.push(card);
                                card.taskList = this.column.taskList;
                                card.task = newTask;
                                card.column = this.column;

                                card.cardElement.setAttribute("tasklistid", this.column.taskList.id);
                                card.cardElement.setAttribute("taskid", newTask.id);

                                card.tasks.forEach((t, i) => {
                                    t.card = card;
                                    t.task = newChildTasks[i];
                                });
                            }
                        });
                } else {
                    targetElement.parentNode.insertBefore(cardElement, targetElement);
                    new Services.Tasks()
                        .moveBefore(cardElement.getAttribute("tasklistid"), targetElement.getAttribute("tasklistid"), cardElement.getAttribute("taskid"), targetElement.getAttribute("taskid"),
                        (newTask, newChildTasks) => {
                            if (newTask) {
                                let oldTaskListId = cardElement.getAttribute("tasklistid");
                                let oldColumn = this.column.board.columns.filter(c => c.taskList.id === oldTaskListId)[0];
                                let oldTaskId = cardElement.getAttribute("taskid");

                                let oldCardPos = 0;
                                oldColumn.cards.forEach((c, i) => {
                                    if (c.task.id === oldTaskId) {
                                        oldCardPos = i;
                                    }
                                });

                                let card = oldColumn.cards.splice(oldCardPos, 1)[0];

                                this.column.cards.push(card);
                                card.taskList = this.column.taskList;
                                card.task = newTask;
                                card.column = this.column;

                                card.cardElement.setAttribute("tasklistid", this.column.taskList.id);
                                card.cardElement.setAttribute("taskid", newTask.id);

                                card.tasks.forEach((t, i) => {
                                    t.card = card;
                                    t.task = newChildTasks[i];
                                });
                            }
                        });
                }
            }, false);
            this.column.columnElement.appendChild(this.cardElement);
        }

        private renderDue() {
            this.dueElement = document.createElement("input");
            this.dueElement.type = "date";
            this.dueElement.className = "due";
            if (this.task.due) {
                var dueDate = new Date(this.task.due);
                this.dueElement.valueAsDate = dueDate;
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
                    let taskViewModel = new Task(this.tasksService, this.taskList, task, this);
                    this.tasks.push(taskViewModel);
                    taskViewModel.render();
                    this.tasksElement.insertBefore(this.tasksElement.lastChild, this.tasksElement.children[1]);
                });
            });
            this.tasksElement.appendChild(this.newTaskElement);

            for (let t of this.tasks) {
                t.render(this);
            }
        }
    }
}  