namespace ViewModels {
    export class Column {
        public columnElement: HTMLDivElement;
        public nameElement: HTMLDivElement;
        public newCardElement: HTMLButtonElement;

        public constructor(
            public tasksService: Services.Tasks,
            public taskList: gapi.client.TaskList,
            public hasAddButton = false,
            public completeTasks = false,
            public board?: Board,
            public cards: Card[] = []
        ) { }

        public render(board = this.board) {
            this.board = board;

            this.renderColumn();

            this.renderName();

            if (this.hasAddButton)
                this.renderNewCard();

            this.renderCards();
        }

        private renderColumn() {
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";

            if (this.completeTasks) {
                this.columnElement.addEventListener("dragover", ev => { ev.preventDefault(); }, false);
                this.columnElement.addEventListener("drop", ev => {
                    ev.preventDefault();
                    let cardElement = document.getElementById(ev.dataTransfer.getData("text"));
                    let targetElement = <HTMLDivElement>ev.currentTarget;
                    targetElement.insertBefore(cardElement, targetElement.childNodes[1]);

                    let oldTaskListId = cardElement.getAttribute("tasklistid");
                    let oldColumn = app.board.columns.filter(c => c.taskList.id === oldTaskListId)[0];
                    let oldTaskId = cardElement.getAttribute("taskid");

                    let oldCardPos = 0;
                    oldColumn.cards.forEach((c, i) => {
                        if (c.task.id === oldTaskId) {
                            oldCardPos = i;
                        }
                    });

                    let card = oldColumn.cards.splice(oldCardPos, 1)[0];

                    card.task.status = "completed";
                    new Services.Tasks().update(card.task, oldTaskListId, oldTaskId, () => {
                        this.cards.unshift(card);
                    });
                });
            }

            this.board.boardElement.appendChild(this.columnElement);
        }

        private renderName() {
            this.nameElement = document.createElement("div");
            this.nameElement.className = "name";
            this.nameElement.innerText = this.taskList.title;
            this.columnElement.appendChild(this.nameElement);
        }

        private renderNewCard() {
            this.newCardElement = document.createElement("button");
            this.newCardElement.className = "new";
            this.newCardElement.innerText = "+";
            this.newCardElement.addEventListener("click", () => {
                new Services.Tasks().new(this.taskList.id, "", task => {
                    let taskViewModel = new Card(this.tasksService, this.taskList, task, this, []);
                    this.cards.push(taskViewModel);
                    taskViewModel.render();
                    this.columnElement.insertBefore(this.columnElement.lastChild, this.columnElement.children[2]);
                });
            });
            this.columnElement.appendChild(this.newCardElement);
        }

        private renderCards() {
            for (let c of this.cards) {
                c.render(this);
            }
        }
    }
}