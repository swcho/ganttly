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
        return CCombo;
    })(CComponent);
    DhxExt.CCombo = CCombo;
})(DhxExt || (DhxExt = {}));
//# sourceMappingURL=DhxExt.js.map
