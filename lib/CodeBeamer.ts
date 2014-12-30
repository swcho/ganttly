

/// <reference path='../typings/tsd.d.ts'/>

declare var Http;

module Cb {

    Http.get({
        url: 'http://www.google.com'
    }).then(function(resp) {
        console.log(resp);
    });

}