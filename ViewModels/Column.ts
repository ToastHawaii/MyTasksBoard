namespace ViewModels {
    export class Column {
        public columnElement: HTMLDivElement;
        public nameElement: HTMLDivElement;

        public constructor(
            public name: string,
            public cards: Card[] = [],
            public parentElement?: HTMLElement
        ) { }

        public render(parentElement?: HTMLElement) {
            this.parentElement = this.parentElement || parentElement;

            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
            this.parentElement.appendChild(this.columnElement);

            this.nameElement = document.createElement("div");
            this.nameElement.className = "name";
            this.nameElement.innerText = this.name;
            this.columnElement.appendChild(this.nameElement);

            for (let c of this.cards) {
                c.render(this.columnElement);
            }
        }
    }
}