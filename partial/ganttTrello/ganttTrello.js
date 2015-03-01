/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../lib/DhxExt.ts"/>
/// <reference path="../../lib/UiUtils.ts"/>
/// <reference path="../../service/trello.ts"/>
angular.module('ganttly').controller('GantttrelloCtrl', function ($scope, $state, $stateParams, $trello) {
    var boardId = $stateParams.board;

    var context = new UiUtils.CAngularContext($scope);

    var cbBoard = new DhxExt.CCombo(document.getElementById('idCbBoard'));
    context.addComponent(cbBoard);

    cbBoard.onChange = function (id) {
        console.log('onChange', id);
        $state.go('ganttTrello', {
            board: id
        });
    };

    $trello.getBoards(function (err, boards) {
        if (err) {
            console.log(err);
            return;
        }

        var items = [];
        boards.forEach(function (b) {
            items.push({
                id: b.id,
                text: b.name
            });
        });

        cbBoard.setItems(items);
        cbBoard.selectItemById(boardId);
    });

    var gantt = new DhxExt.Gantt.CGantt(document.getElementById('idGantt'), false);
    context.addComponent(gantt);

    gantt.setContextMenu({
        menuItems: [{
                id: 'open_card',
                text: 'Open card',
                onClick: function (id, param) {
                    console.log(param);
                    var task = gantt._gantt.getTask(param.taskId);
                    var url = task._data.shortUrl;
                    var width = 1280;
                    var height = 720;
                    var params = [
                        'width=' + width,
                        'height=' + height,
                        'fullscreen=yes'
                    ].join(',');
                    var win = open(url, null, params);
                    win.moveTo((screen.width - width) / 2, (screen.height - height) / 2);
                    win.resizeTo(width, height);
                }
            }]
    });

    if (boardId) {
        $trello.getCards(boardId, function (err, board) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(board);

            var data = [];
            var links = [];

            var today = UiUtils.roundDay(new Date());
            board.cards.forEach(function (card) {
                console.log(card);

                var task = {
                    id: card.id,
                    text: card.name,
                    start_date: today,
                    duration: 1,
                    user: ''
                };

                if (card.due) {
                    task.end_date = new Date(card.due);
                }

                task._data = card;

                data.push(task);
            });

            //data = [
            //{id: 1, text: "Project #2", start_date: "01-04-2013", duration: 18, order: 10,
            //    progress: 0.4, open: true},
            //{id: 2, text: "Task #1", start_date: "02-04-2013", duration: 8, order: 10,
            //    progress: 0.6, parent: 1},
            //{id: 3, text: "Task #2", start_date: "11-04-2013", duration: 8, order: 20,
            //    progress: 0.6, parent: 1}
            //];
            gantt.clearAll();

            gantt.parse({
                data: data,
                links: links
            });
        });
    }
});
//# sourceMappingURL=ganttTrello.js.map
