window.onload = function () {
    app = new App();
    app.start();
};
function init() {
    var draggables = document.getElementsByClassName("a-draggable");
    for (var i = 0; i < draggables.length; i++) {
        var d = draggables[i];
        d.setAttribute("draggable", "true");
        d.addEventListener("dragstart", function (ev) {
            var source = ev.target;
            document.aDragSource = source;
            document.aDragSource.classList.add("a-drag");
        }, false);
        var startX = 0;
        var startY = 0;
        d.addEventListener("touchstart", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.classList.add("a-drag");
                document.aDragSource.style.position = "relative";
                startX = ev.changedTouches[0].clientX;
                startY = ev.changedTouches[0].clientY;
                document.aDragSource.style.left = 0 + "px";
                document.aDragSource.style.top = 0 + "px";
            }
        }, true);
        d.addEventListener("dragend", function (ev) {
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.classList.remove("a-drag");
            }
        }, false);
        d.addEventListener("touchmove", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.style.left = ev.changedTouches[0].clientX - startX + "px";
                document.aDragSource.style.top = ev.changedTouches[0].clientY - startY + "px";
            }
        }, true);
        d.addEventListener("touchend", function (ev) {
            ev.preventDefault();
            var source = ev.target;
            document.aDragSource = closet(source, "a-draggable");
            if (document.aDragSource) {
                document.aDragSource.classList.remove("a-drag");
                document.aDragSource.style.position = "";
                document.aDragTarget = document.elementFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
                document.aDragTarget = closet(document.aDragTarget, "a-dropzone");
                if (document.aDragTarget) {
                    var aDropEvent = new Event("a-drop");
                    aDropEvent.dragTarget = document.aDragTarget;
                    aDropEvent.dragSource = document.aDragSource;
                    if (document.aDragTarget.clientTop + document.aDragTarget.clientHeight / 2 > ev.changedTouches[0].clientY) {
                        aDropEvent.dragTop = true;
                        aDropEvent.dragBottom = false;
                    }
                    else {
                        aDropEvent.dragTop = false;
                        aDropEvent.dragBottom = true;
                    }
                    document.aDragTarget.dispatchEvent(aDropEvent);
                }
            }
        }, true);
    }
    var dropzones = document.getElementsByClassName("a-dropzone");
    for (var i = 0; i < dropzones.length; i++) {
        var d = dropzones[i];
        d.addEventListener("dragover", function (ev) {
            ev.preventDefault();
        }, false);
        d.addEventListener("drop", function (ev) {
            document.aDragTarget = ev.currentTarget;
            document.aDragTarget = closet(document.aDragTarget, "a-dropzone");
            var aDropEvent = new Event("a-drop");
            aDropEvent.dragTarget = document.aDragTarget;
            aDropEvent.dragSource = document.aDragSource;
            if (document.aDragTarget.clientTop + document.aDragTarget.clientHeight / 2 > ev.clientY) {
                aDropEvent.dragTop = true;
                aDropEvent.dragBottom = false;
            }
            else {
                aDropEvent.dragTop = false;
                aDropEvent.dragBottom = true;
            }
            document.aDragTarget.dispatchEvent(aDropEvent);
        }, false);
    }
}
function closet(element, className) {
    if (element.classList.contains(className))
        return element;
    while ((element = element.parentElement) && !element.classList.contains(className))
        ;
    return element;
}
setTimeout(init, 3000);
