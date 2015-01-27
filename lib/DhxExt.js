var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DhxExt;
(function (DhxExt) {
    var CComponent = (function () {
        function CComponent() {
            this._eventAttachIds = [];
        }
        CComponent.prototype._setComponent = function (aComponent) {
            this._component = aComponent;
        };

        CComponent.prototype._addEventId = function (aEventId) {
            this._eventAttachIds.push(aEventId);
        };

        CComponent.prototype.destroy = function () {
            var _this = this;
            this._eventAttachIds.forEach(function (id) {
                _this._component.detachEvent(id);
            });
        };
        return CComponent;
    })();
    DhxExt.CComponent = CComponent;

    var CContext = (function () {
        function CContext() {
            this._components = [];
        }
        CContext.prototype.destroy = function () {
            this._components.forEach(function (c) {
                c.destroy();
            });
            delete this._components;
        };

        CContext.prototype.addComponent = function (aComponent) {
            this._components.push(aComponent);
        };
        return CContext;
    })();
    DhxExt.CContext = CContext;

    

    var CCombo = (function (_super) {
        __extends(CCombo, _super);
        function CCombo(aElement, aFilter) {
            var _this = this;
            _super.call(this);
            this._combo = new dhtmlXCombo({
                parent: aElement,
                filter_cache: aFilter ? true : false
            });
            this._setComponent(this._combo);

            if (aFilter) {
                this._combo.enableFilteringMode(true, "dummy");
                this._addEventId(this._combo.attachEvent("onDynXLS", function (text) {
                    aFilter(text, function (items) {
                        var options = [];
                        _this._combo.clearAll();
                        items.forEach(function (item) {
                            options.push([item.id, item.text]);
                        });
                        _this._combo.addOption(options);
                        _this._combo.openSelect();
                    });
                }));
            }

            this._addEventId(this._combo.attachEvent("onChange", function () {
                if (_this.onChange) {
                    _this.onChange(_this._combo.getSelectedValue());
                }
            }));
        }
        CCombo.prototype.setItems = function (aItems) {
            var _this = this;
            this._combo.clearAll();
            aItems.forEach(function (item) {
                _this._combo.addOption(item.id, item.text);
            });
        };

        CCombo.prototype.setDisable = function (aDisabled) {
            if (aDisabled) {
                this._combo.disable();
            } else {
                this._combo.enable();
            }
        };

        CCombo.prototype.selectItemById = function (aId) {
            if (aId) {
                this._combo.setComboValue(aId);
            }
        };

        CCombo.prototype.openSelect = function () {
            this._combo.openSelect();
        };
        return CCombo;
    })(CComponent);
    DhxExt.CCombo = CCombo;

    

    var CForm = (function (_super) {
        __extends(CForm, _super);
        function CForm(aEl, aItems) {
            var _this = this;
            _super.call(this);
            this._eventHandlers = {};
            this._form = new dhtmlXForm(aEl, aItems);
            this._setComponent(this._form);
            this._addEventHandler(aItems);
            this._addEventId(this._form.attachEvent("onChange", function (name, value, state) {
                if (_this._eventHandlers[name] && _this._eventHandlers[name]['onChange']) {
                    _this._eventHandlers[name]['onChange'](value, state);
                }
            }));
            this._addEventId(this._form.attachEvent("onButtonClick", function (name) {
                if (_this._eventHandlers[name] && _this._eventHandlers[name]['onButtonClick']) {
                    _this._eventHandlers[name]['onButtonClick']();
                }
            }));
        }
        CForm.prototype._addEventHandler = function (aFormItems) {
            var _this = this;
            aFormItems.forEach(function (formItem) {
                if (formItem.eventHandlers) {
                    _this._eventHandlers[formItem.name] = formItem.eventHandlers;
                    delete formItem.eventHandlers;
                }
                if (formItem.type === 'block') {
                    _this._addEventHandler(formItem.list);
                }
            });
        };
        return CForm;
    })(CComponent);
    DhxExt.CForm = CForm;
})(DhxExt || (DhxExt = {}));
//# sourceMappingURL=DhxExt.js.map
