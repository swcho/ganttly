ganttly
=======

Simply gently ganttly!

ganttly is gantt chart editor utilizing [dhtmlxgantt].

Installation
------------

ganttly is just single static page.
You can try it just opening index.html locally.

```
$ git clone https://github.com/swcho/ganttly.git
$ cd ganttly; chromium-browser --disable-web-security index.html
```

Or, you can just deploy it under any web server directory.

codeBeamer
----------
In some case, you should disable browser security to avoid CORS error.
For example, you should launch chrome with next command and option.

```shell
$ chromium-browser --disable-web-security
```

You can try [codeBeamer] with [JavaForge](http://www.javaforge.com/).
You need to create account in [JavaForge] and make some project with tasks.
Then you can tryout with next URL.
[http://swcho.github.io/ganttly](http://swcho.github.io/ganttly)

trello
------
If you have [trello] account, try to open next link.
[http://swcho.github.io/ganttly/#/ganttTrello](http://swcho.github.io/ganttly/#/ganttTrello)

Supported backend
-----------------
- [codeBeamer]
- [trello]

[dhtmlxgantt]:http://docs.dhtmlx.com/gantt/
[codeBeamer]:https://codebeamer.com/cb/user
[trello]:https://trello.com/
