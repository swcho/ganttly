
/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../lib/DhxExt.ts"/>
/// <reference path="../../lib/UiUtils.ts"/>
/// <reference path="../../lib/TrelloUtils.ts"/>

angular.module('ganttly').controller('GantttrelloCtrl',function($scope, $state, $stateParams){

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

    TrelloUtils.getBoards(function(err, boards) {
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

    var gantt = new DhxExt.Gantt.CGantt(document.getElementById('idGantt'), true);
    context.addComponent(gantt);

    gantt.setContextMenu({
        menuItems: [{
            id: 'open_card',
            text: 'Open card',
            onClick: function(id, param: DhxExt.Gantt.TGanttContextCbParam) {
                console.log(param);
                var task = gantt._gantt.getTask(param.taskId);
                var url = task._data.shortUrl;
                var width = 1280;
                var height = 720;
                var params = [
                    'width=' + width,
                    'height=' + height,
                    'fullscreen=yes' // only works in IE, but here for completeness
                ].join(',');
                var win = open(url, null, params);
                win.moveTo((screen.width - width) / 2, (screen.height - height) / 2);
                win.resizeTo(width, height);
            }
        }]
    });

    if (boardId) {

        var s = [];

        var board;
        var memberIdList;
        s.push(function(done) {
            TrelloUtils.getCards(boardId, function(err, b) {
                if (b) {
                    board = b;
                    var memberMap = {};
                    b.cards.forEach(function(card: Trello.TCard) {

                        card.idMembers.forEach(function(mid) {
                            memberMap[mid] = true;
                        });
                    });
                    memberIdList = Object.keys(memberMap);
                }
                done(err);
            });
        });

        var mapMember;
        s.push(function(done) {
            TrelloUtils.getMembers(memberIdList, function(err, mm) {
                mapMember = mm;
                done(err);
            });
        });

        s.push(function(done) {
            var data = [];
            var links = [];
            var today = UiUtils.roundDay(new Date());
            board.cards.forEach(function(card: Trello.TCard) {

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

                var users = [];
                card.idMembers.forEach(function(mid) {
                    var name = mapMember[mid].fullName;
                    users.push(name);
                });

                task.user = users.join(',');

                task._data = card;

                data.push(task);
            });

            gantt.clearAll();

            gantt.parse({
                data: data,
                links: links
            });
            done();
        });

        async.series(s, function(err) {

        });

    }
});
