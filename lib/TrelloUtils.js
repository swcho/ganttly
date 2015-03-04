/**
 * Created by sungwoo on 15. 3. 1.
 */
/// <reference path='../typings/tsd.d.ts'/>
var TrelloUtils;
(function (TrelloUtils) {
    function authorize(cb) {
        Trello.authorize({
            type: 'popup',
            name: 'ganttly',
            scope: {
                read: true,
                write: true
            },
            expiration: 'never',
            success: function () {
                console.log('Trello.authorize.success');
                cb();
            },
            error: function (err) {
                console.log('Trello.authorize.error');
                cb(err);
            }
        });
    }
    function _getBoards(cb) {
        Trello.get('members/me/boards', function (resp) {
            cb(null, resp);
        }, function (jqXHR, statusText, error) {
            cb(error);
        });
    }
    function _getBoard(id, cb) {
        Trello.boards.get(id, function (resp) {
            cb(null, resp);
        }, function (err) {
            cb(err);
        });
    }
    function getCardsByBoard(id, cb) {
        Trello.boards.get(id, {
            cards: 'open'
        }, function (resp) {
            cb(null, resp);
        }, function (jqXHR, statusText, error) {
            cb(error);
        });
    }
    function getBoards(cb) {
        authorize(function (err) {
            if (err) {
                cb(err);
                return;
            }
            _getBoards(cb);
        });
    }
    TrelloUtils.getBoards = getBoards;
    function getBoard(id, cb) {
        _getBoard(id, cb);
    }
    TrelloUtils.getBoard = getBoard;
    function getCards(boardId, cb) {
        getCardsByBoard(boardId, cb);
    }
    TrelloUtils.getCards = getCards;
    function getMembers(memberIdList, cb) {
        var p = [];
        var mapMembers = {};
        memberIdList.forEach(function (id) {
            p.push(function (done) {
                Trello.members.get(id, function (resp) {
                    mapMembers[id] = resp;
                    done();
                }, function (jqXHR, statusText, error) {
                    done(error);
                });
            });
        });
        async.parallel(p, function (err) {
            cb(err, mapMembers);
        });
    }
    TrelloUtils.getMembers = getMembers;
})(TrelloUtils || (TrelloUtils = {}));
//# sourceMappingURL=TrelloUtils.js.map