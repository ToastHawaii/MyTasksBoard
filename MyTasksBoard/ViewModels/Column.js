var ViewModels;
(function (ViewModels) {
    var Column = (function () {
        function Column(name, cards, parentElement) {
            if (cards === void 0) { cards = []; }
            this.name = name;
            this.cards = cards;
            this.parentElement = parentElement;
        }
        Column.prototype.render = function (parentElement) {
            this.parentElement = this.parentElement || parentElement;
            this.columnElement = document.createElement("div");
            this.columnElement.className = "column";
            this.parentElement.appendChild(this.columnElement);
            this.nameElement = document.createElement("div");
            this.nameElement.className = "name";
            this.nameElement.innerText = this.name;
            this.columnElement.appendChild(this.nameElement);
            for (var _i = 0, _a = this.cards; _i < _a.length; _i++) {
                var c = _a[_i];
                c.render(this.columnElement);
            }
        };
        return Column;
    })();
    ViewModels.Column = Column;
})(ViewModels || (ViewModels = {}));
