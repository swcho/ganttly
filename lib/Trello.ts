/**
 * Created by sungwoo on 15. 3. 1.
 */

declare module Trello {

    interface TScope {
        read?: boolean;
        write?: boolean;
        account?: boolean;
    }

    interface TAuthorizeOptions {

        /**
         * "redirect" or "popup"
         */
        type: string;

        /**
         * name of your application, which is displayed during the authorization process
         */
        name: string;

        /**
         * true or false
         * Default is true
         * If true, the token will be saved to local storage.
         */
        persist?: boolean;

        /**
         * true or false
         * Default is true
         * If false, don’t redirect or popup, only use the stored token
         */
        interactive?: boolean

        /**
         * Object like { read: allowRead, write: allowWrite, account: allowAccount }
         * Default is read-only, i.e. { read: true, write: false, account: false }
         * Each permission is a boolean
         */
        scope: TScope;

        /**
         * "1hour", "1day", "30days", "never"
         * Default is "30days"
         * When the token should expire
         */
        expiration: string;

        /**
         * Optional function to be called on success
         */
        success?: any;

        /**
         * Optional function to be called on error
         */
        error?: any;
    }

    export function authorize(opts: TAuthorizeOptions);

    /**
     * You can use the API via a single call: Trello.rest(method, path[, params], success, error)
     */
    interface TRestOptions {

        /**
         * method
         * "GET", "POST", "PUT", "DELETE"
         */
        method: string;

        /**
         * path
         * API path to use, such as "members/me"
         */
        path: string;

        /**
         * params
         * Parameters to the API path, such as { fields: "username,fullName" }
         * Default is {}
         */
        param: any;

        /**
         * success
         * Optional function to be called on success
         */
        success: Function;

        /**
         * error
         * Optional function to be called on error
         */
        error: Function;
    }
    export function rest(options: TRestOptions);

    export function get(path: string, success: Function, error: Function);
    export function get(path: string, params: any, success: Function, error: Function);
    export function post(path: string, success: Function, error: Function);
    export function post(path: string, params: any, success: Function, error: Function);
    export function put(path: string, success: Function, error: Function);
    export function put(path: string, params: any, success: Function, error: Function);
    export function del(path: string, success: Function, error: Function);
    export function del(path: string, params: any, success: Function, error: Function);

    interface TCollection {
        get(id: string, success: Function, error: Function);
        get(id: string, params: any, success: Function, error: Function);
        post(id: string, success: Function, error: Function);
        post(id: string, params: any, success: Function, error: Function);
        put(id: string, success: Function, error: Function);
        put(id: string, params: any, success: Function, error: Function);
        del(id: string, success: Function, error: Function);
        del(id: string, params: any, success: Function, error: Function);
    }
    export var actions: TCollection;
    export var cards: TCollection;
    export var checklists: TCollection;
    export var boards: TCollection;
    export var lists: TCollection;
    export var members: TCollection;
    export var organizations: TCollection;

    /**
     * Board
     */
    interface TBoard {
        cards: TCard[];
        closed: boolean;
        desc: string;
        descData: any;
        id: string;
        idOrganization: any;
        labelNames: any;
        name: string;
        pinned: boolean;
        prefs: any;
        shortUrl: string;
        url: string;
    }

    /**
     * Card
     */
    interface TCard {
        badges: any;
        checkItemStates: any[];
        closed: boolean;
        dateLastActivity: string;
        desc: string;
        descData: any;
        due: any;
        email: any;
        id: string;
        idAttachmentCover: any;
        idBoard: string;
        idChecklists: any[];
        idList: string;
        idMembers: any[];
        idMembersVoted: any[];
        idShort: number;
        labels: any[];
        manualCoverAttachment: boolean;
        name: string;
        pos: number;
        shortLink: string;
        shortUrl: string;
        subscribed: boolean;
        url: string;
    }
}

module TrelloUtils {

    export function authorize(cb) {
        Trello.authorize({
            type: 'popup',
            name: 'ganttly',
            scope: {
                read: true,
                write: true
            },
            expiration: 'never',
            success: function() {
                console.log('Trello.authorize.success');
                cb();
            },
            error: function(err) {
                console.log('Trello.authorize.error');
                cb(err);
            }
        });
    }

    export function getBoards(cb) {
        Trello.get('members/me/boards', function(resp) {
            cb(null, resp);
        }, function(jqXHR, statusText, error) {
            cb(error);
        });
    }

    export function getBoard(id, cb) {
        Trello.boards.get(id, function(resp) {
            cb(null, resp);
        }, function(err) {
            cb(err);
        });
    }

    export function getCardsByBoard(id, cb) {
        Trello.boards.get(id, {
            cards: 'open'
        }, function(resp) {
            cb(null, resp);
        }, function(jqXHR, statusText, error) {
            cb(error);
        });
    }
}
