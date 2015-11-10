declare var app: App;

window.onload = () => {
    app = new App();
    app.start();
};

interface Document {
    aDragSource: HTMLElement;
    aDragTarget: HTMLElement;
}

function init() {
    let draggables = document.getElementsByClassName("element-draggable");
    for (let i = 0; i < draggables.length; i++) {
        var d = draggables[i];
        d.setAttribute("draggable", "true");
        d.addEventListener("dragstart", ev => {
            let source = <HTMLElement>ev.target;

            document.aDragSource = source;
            document.aDragSource.classList.add("element-drag");
        }, false);
        var startX = 0;
        var startY = 0;
        d.addEventListener("touchstart", ev => {
            ev.preventDefault();
            let source = <HTMLElement>ev.target;

            document.aDragSource = closet(source, "element-draggable")

            if (document.aDragSource) {
                document.aDragSource.classList.add("element-drag");
                document.aDragSource.style.position = "relative";
                startX = ev.changedTouches[0].clientX;
                startY = ev.changedTouches[0].clientY;
                document.aDragSource.style.left = 0 + "px";
                document.aDragSource.style.top = 0 + "px";
            }
        }, false);

        d.addEventListener("dragend", ev => {
            let source = (<HTMLElement>ev.target);

            document.aDragSource = closet(source, "element-draggable")

            if (document.aDragSource) {
                document.aDragSource.classList.remove("element-drag");
            }
        }, false);
        d.addEventListener("touchmove", ev => {
            ev.preventDefault();
            let source = (<HTMLElement>ev.target);

            document.aDragSource = closet(source, "element-draggable")

            if (document.aDragSource) {
                document.aDragSource.style.left = ev.changedTouches[0].clientX - startX + "px";
                document.aDragSource.style.top = ev.changedTouches[0].clientY - startY + "px";
            }
        }, false);
        d.addEventListener("touchend", ev => {
            ev.preventDefault();
            (<HTMLElement>ev.target).focus();

            if ((<HTMLElement>ev.target).nodeName.toUpperCase() === "BUTTON") {
                (<HTMLElement>ev.target).click();
            }

            let source = (<HTMLElement>ev.target);

            document.aDragSource = closet(source, "element-draggable")

            if (document.aDragSource) {
                document.aDragSource.classList.remove("element-drag");
                document.aDragSource.style.position = "";

                document.aDragTarget = <HTMLElement>document.elementFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);

                document.aDragTarget = closet(document.aDragTarget, "element-dropzone")

                if (document.aDragTarget) {
                    var aDropEvent = new Event("element-drop");

                    aDropEvent.dragTarget = document.aDragTarget;
                    aDropEvent.dragSource = document.aDragSource;

                    if (document.aDragTarget.clientTop + document.aDragTarget.clientHeight / 2 > ev.changedTouches[0].clientY) {
                        aDropEvent.dragTop = true;
                        aDropEvent.dragBottom = false;
                    } else {
                        aDropEvent.dragTop = false;
                        aDropEvent.dragBottom = true;
                    }

                    document.aDragTarget.dispatchEvent(aDropEvent);
                }
            }
        }, false);
    }

    let dropzones = document.getElementsByClassName("element-dropzone");
    for (let i = 0; i < dropzones.length; i++) {
        var d = dropzones[i];
        d.addEventListener("dragover", ev => {
            ev.preventDefault();
        }, false);
        d.addEventListener("drop", ev => {
            document.aDragTarget = <HTMLDivElement>ev.currentTarget;

            document.aDragTarget = closet(document.aDragTarget, "element-dropzone")

            var aDropEvent = new Event("element-drop");

            aDropEvent.dragTarget = document.aDragTarget;
            aDropEvent.dragSource = document.aDragSource;

            if (document.aDragTarget.clientTop + document.aDragTarget.clientHeight / 2 > (<DragEvent>ev).clientY) {
                aDropEvent.dragTop = true;
                aDropEvent.dragBottom = false;
            } else {
                aDropEvent.dragTop = false;
                aDropEvent.dragBottom = true;
            }

            document.aDragTarget.dispatchEvent(aDropEvent);
        }, false);
    }
}

interface Event {
    dragTarget: HTMLElement;
    dragSource: HTMLElement;
    dragTop: boolean;
    dragBottom: boolean;
}

function closet(element: HTMLElement, className: string) {
    if (element.classList.contains(className))
        return element;

    while ((element = element.parentElement) && !element.classList.contains(className));

    return element;
}

setTimeout(init, 3000);