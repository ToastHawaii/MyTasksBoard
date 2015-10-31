namespace ViewModels {
    export class Column {
        public columnElement: HTMLDivElement;
        public nameElement: HTMLDivElement;

        public constructor(
            public name: string,
            public cards: Card[] = [],
            public parentElement?: HTMLElement
        ) { }

        public render(parentElement = this.parentElement) {
            this.parentElement = parentElement;

            this.renderColumn();

            this.renderName();

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
            this.nameElement.innerText = this.name;
            this.columnElement.appendChild(this.nameElement);
        }

        private renderCards() {
            for (let c of this.cards) {
                c.render(this.columnElement);
            }
        }
    }
}