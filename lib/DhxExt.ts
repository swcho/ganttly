

declare var dhtmlXCombo;


module DhxExt {

    export class CComponent {

        private _eventAttachIds;
        private _component;

        constructor() {
            this._eventAttachIds = [];
        }

        _setComponent(aComponent) {
            this._component = aComponent;
        }

        _addEventId(aEventId) {
            this._eventAttachIds.push(aEventId);
        }

        destroy() {
            this._eventAttachIds.forEach((id) => {
                this._component.detachEvent(id);
            });
        }
    }

    export interface TComboItem {
        id: string;
        text: string;
    }

    export interface TComboFilter {
        (text: string, cb: (items: TComboItem[]) => void): void;
    }

    export class CCombo extends CComponent {

        _combo;

        onChange: (id: string) => void;

        constructor(aElement: HTMLElement, aFilter?: TComboFilter) {
            super();
            this._combo = new dhtmlXCombo({
                parent: aElement,
                filter_cache: aFilter? true: false
            });
            this._setComponent(this._combo);

            if (aFilter) {
                this._combo.enableFilteringMode(true,"dummy");
                this._addEventId(
                    this._combo.attachEvent("onDynXLS", (text) => {
                        aFilter(text, (items) => {
                            var options = [];
                            this._combo.clearAll();
                            items.forEach(function(item) {
                                options.push([item.id, item.text]);
                            });
                            this._combo.addOption(options);
                            this._combo.openSelect();
                        });
                    })
                );
            }

            this._addEventId(
                this._combo.attachEvent("onChange", () => {
                    if (this.onChange) {
                        this.onChange(this._combo.getSelectedValue());
                    }
                })
            );
        }

        setItems(aItems: TComboItem[]) {
            this._combo.clearAll();
            aItems.forEach((item) => {
                this._combo.addOption(item.id, item.text);
            });
        }

        setDisable(aDisabled: boolean) {
            if (aDisabled) {
                this._combo.disable();
            } else {
                this._combo.enable();
            }
        }

        selectItemById(aId: string) {
            if (aId) {
                this._combo.setComboValue(aId);
            }
        }

    }

}