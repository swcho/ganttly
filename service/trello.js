/// <reference path="../typings/tsd.d.ts"/>

angular.module('ganttly').factory('$trello', function ($http) {
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

    function getBoards(cb) {
        Trello.get('members/me/boards', function (resp) {
            cb(null, resp);
        }, function (jqXHR, statusText, error) {
            cb(error);
        });
    }

    function getBoard(id, cb) {
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

    return {
        setKey: function (key) {
        },
        getBoards: function (cb) {
            authorize(function (err) {
                if (err) {
                    cb(err);
                    return;
                }
                getBoards(cb);
            });
        },
        getBoard: function (id, cb) {
            getBoard(id, cb);
        },
        getCards: function (boardId, cb) {
            getCardsByBoard(boardId, cb);
        }
    };
});
//# sourceMappingURL=trello.js.map
