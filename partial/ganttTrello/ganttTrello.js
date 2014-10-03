/// <reference path="../../defs/dhtmlxgannt.def.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../service/trello.ts"/>
angular.module('ganttly').controller('GantttrelloCtrl', function ($scope, $state, $stateParams, $trello) {
    var boardId = $stateParams.board;

    $scope.tasks = {
        data: [],
        links: []
    };
    $scope.boards = [{
            name: 'dummy'
        }];
    $scope.goBoard = function (board) {
        console.log(board);
        $state.go('ganttTrello', {
            board: board.id
        });
    };

    $trello.getBoards(function (err, boards) {
        if (err) {
            console.log(err);
            return;
        }
        console.log(boards);
        $scope.boards = boards;
        $scope.$apply();
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
            board.cards.forEach(function (card) {
                data.push({
                    id: card.id,
                    text: card.name,
                    start_date: new Date(),
                    duration: 1
                });
            });

            //            data = [
            //            {id: 1, text: "Project #2", start_date: "01-04-2013", duration: 18, order: 10,
            //                progress: 0.4, open: true},
            //            {id: 2, text: "Task #1", start_date: "02-04-2013", duration: 8, order: 10,
            //                progress: 0.6, parent: 1},
            //            {id: 3, text: "Task #2", start_date: "11-04-2013", duration: 8, order: 20,
            //                progress: 0.6, parent: 1}
            //            ];
            $scope.tasks = {
                data: data,
                links: links
            };
            $scope.$apply();
        });
    }
});
//# sourceMappingURL=ganttTrello.js.map
