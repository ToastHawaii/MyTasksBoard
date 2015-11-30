declare var app: App;

window.addEventListener("load", () => {
    "use strict";

    app = new App();
    app.start();
});

interface Document {
    aDragSource: HTMLElement;
    aDragTarget: HTMLElement;
}

setTimeout(Draggale.init, 3000);