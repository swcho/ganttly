

declare var dhtmlXCombo;
declare var dhtmlXForm;

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

    export class CContext {

        private _components: CComponent[];

        constructor() {
            this._components = [];
        }

        destroy() {
            this._components.forEach(function(c) {
                c.destroy();
            });
            delete this._components;
        }

        addComponent(aComponent: CComponent) {
            this._components.push(aComponent);
        }

    }

    /**************************************************************************
     * Combo box
     */

    export interface TComboItem {
        id: string;
        text: string;
    }

    export interface TComboFilter {
        (text: string, cb: (items: TComboItem[]) => void): void;
    }

    export interface FnComboOnChange {
        (id: string): void;
    }

    export class CCombo extends CComponent {

        _combo;

        onChange: FnComboOnChange;

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

        openSelect() {
            this._combo.openSelect();
        }

    }

    /**************************************************************************
     * Form
     */

    export interface TFormItem {
        blockOffset?: number; // left-side offset of the item content (default 20)
        className?: string; // the user-defined css class for block's items
        disabled?: boolean; // disables/enables the block's items
        hidden?: boolean; // hides/shows the item. The default value - *false* (the item is shown)
        inputLeft?: number; // sets the left absolute offset of input.The attribute is applied only if the *position* is set as "absolute"
        inputTop?: number; // sets the top absolute offset of input. The attribute is applied only if the *position* is set as "absolute"
        name: string; // the identification name. Used for referring to item
        type: string;
        list?: TFormItem[]; // defines the array of nested elements
        offsetLeft?: number; // sets the left relative offset of item
        offsetTop?: number; // sets the top relative offset of item
        position?: string; // label-left, label-right, label-top or absolute, defines the position of label relative to block. As just labels are defined for block, just value absolute makes sense and is used for setting absolute label position
        width?: number; // the width of block

        label?: string;
        checked?: boolean; // for check box
        eventHandlers?: {
            onChange?: (value: any, state: boolean) => void;
            onButtonClick? : () => void;
        }
    }

    export class CForm extends CComponent {

        _form: any;
        _eventHandlers = {};

        constructor(aEl: HTMLElement, aItems: TFormItem[]) {
            super();
            this._form = new dhtmlXForm(aEl, aItems);
            this._setComponent(this._form);
            this._addEventHandler(aItems);
            this._addEventId(
                this._form.attachEvent("onChange", (name, value, state) => {
                    if (this._eventHandlers[name] && this._eventHandlers[name]['onChange']) {
                        this._eventHandlers[name]['onChange'](value, state);
                    }
                })
            );
            this._addEventId(
                this._form.attachEvent("onButtonClick", (name) => {
                    if (this._eventHandlers[name] && this._eventHandlers[name]['onButtonClick']) {
                        this._eventHandlers[name]['onButtonClick']();
                    }
                })
            );
        }

        private _addEventHandler(aFormItems: TFormItem[]) {
            aFormItems.forEach((formItem) => {
                if (formItem.eventHandlers) {
                    this._eventHandlers[formItem.name] = formItem.eventHandlers;
                    delete formItem.eventHandlers;
                }
                if (formItem.type === 'block') {
                    this._addEventHandler(formItem.list);
                }
            });
        }
    }

}