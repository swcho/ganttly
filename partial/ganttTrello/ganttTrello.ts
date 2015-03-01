
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../lib/DhxExt.ts"/>
/// <reference path="../../lib/UiUtils.ts"/>
/// <reference path="../../service/trello.ts"/>

angular.module('ganttly').controller('GantttrelloCtrl',function($scope, $state, $stateParams, $trello){

    var boardId = $stateParams.board;

    var context = new UiUtils.CAngularContext($scope);

    var cbBoard = new DhxExt.CCombo(document.getElementById('idCbBoard'));
    context.addComponent(cbBoard);

    cbBoard.onChange = function(id) {
        console.log('onChange', id);
        $state.go('ganttTrello', {
            board: id
        });
    };

    $trello.getBoards(function(err, boards) {
        if (err) {
            console.log(err);
            return;
        }

        var items = [];
        boards.forEach(function(b) {
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

    if (boardId) {
        $trello.getCards(boardId, function(err, board) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(board);

            var data = [];
            var links = [];

            var today = UiUtils.roundDay(new Date());
            board.cards.forEach(function(card: Trello.TCard) {

                console.log(card);

                var task: DhxExt.Gantt.TTask = {
                    id: card.id,
                    text: card.name,
                    start_date: today,
                    duration: 1,
                    user: ''
                };

                if (card.due) {
                    task.end_date = new Date(card.due);
                }

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
