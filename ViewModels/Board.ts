﻿namespace ViewModels {
    export class Board {
        public boardElement: HTMLDivElement;

        public constructor(
            public columns: Column[] = [],
            public parentElement?: HTMLElement
        ) {
        }

        public render(parentElement?: HTMLElement) {
            this.parentElement = this.parentElement || parentElement;

            this.boardElement = document.createElement("div");
            this.boardElement.className = "board";
            this.parentElement.appendChild(this.boardElement);

            for (let c of this.columns) {
                c.render(this.boardElement);
            }
        }
    }
}