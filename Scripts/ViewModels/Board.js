var ViewModels;
(function (ViewModels) {
    var Board = (function () {
        function Board(columns, parentElement) {
            if (columns === void 0) { columns = []; }
            this.columns = columns;
            this.parentElement = parentElement;
        }
        Board.prototype.render = function (parentElement) {
            if (parentElement === void 0) { parentElement = this.parentElement; }
            this.parentElement = parentElement;
            this.renderBoard();
            this.renderColumns();
        };
        Board.prototype.renderBoard = function () {
            this.boardElement = document.createElement("div");
            this.boardElement.className = "board";
            this.parentElement.appendChild(this.boardElement);
        };
        Board.prototype.renderColumns = function () {
            for (var _i = 0, _a = this.columns; _i < _a.length; _i++) {
                var c = _a[_i];
                c.render(this);
            }
        };
        return Board;
    })();
    ViewModels.Board = Board;
})(ViewModels || (ViewModels = {}));
