namespace ViewModels {
    export class Column {
        public columnElement: HTMLDivElement;
        public nameElement: HTMLDivElement;
        public newCardElement: HTMLButtonElement;

        public constructor(
            public tasksService: Services.Tasks,
            public taskList: gapi.client.TaskList,
            public hasAddButton = false,
            public cards: Card[] = [],
            public parentElement?: HTMLElement
        ) { }

        public render(parentElement = this.parentElement) {
            this.parentElement = parentElement;

            this.renderColumn();

            this.renderName();

            if (this.hasAddButton)
                this.renderNewCard();

            this.renderCards();
        }

        private renderColumn() {
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
            this.parentElement.appendChild(this.columnElement);
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
                    let taskViewModel = new Card(this.tasksService, this.taskList, task, [], this.columnElement);
                    this.cards.push(taskViewModel);
                    taskViewModel.render();
                    this.columnElement.insertBefore(this.columnElement.lastChild, this.columnElement.children[2]);
                });
            });
            this.columnElement.appendChild(this.newCardElement);
        }

        private renderCards() {
            for (let c of this.cards) {
                c.render(this.columnElement);
            }
        }
    }
}