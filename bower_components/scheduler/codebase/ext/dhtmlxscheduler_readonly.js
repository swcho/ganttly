/*
dhtmlxScheduler v.4.2.0 Stardard

This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
scheduler.attachEvent("onTemplatesReady",function(){function e(e,t,s,r){for(var a=t.getElementsByTagName(e),i=s.getElementsByTagName(e),n=i.length-1;n>=0;n--){var s=i[n];if(r){var d=document.createElement("SPAN");d.className="dhx_text_disabled",d.innerHTML=r(a[n]),s.parentNode.insertBefore(d,s),s.parentNode.removeChild(s)}else s.disabled=!0,t.checked&&(s.checked=!0)}}var t=scheduler.config.lightbox.sections.slice(),s=scheduler.config.buttons_left.slice(),r=scheduler.config.buttons_right.slice();scheduler.attachEvent("onBeforeLightbox",function(e){if(this.config.readonly_form||this.getEvent(e).readonly){this.config.readonly_active=!0;
for(var a=0;a<this.config.lightbox.sections.length;a++)this.config.lightbox.sections[a].focus=!1}else this.config.readonly_active=!1,scheduler.config.lightbox.sections=t.slice(),scheduler.config.buttons_left=s.slice(),scheduler.config.buttons_right=r.slice();var i=this.config.lightbox.sections;if(this.config.readonly_active){for(var a=0;a<i.length;a++)if("recurring"==i[a].type){this.config.readonly_active&&i.splice(a,1);break}for(var n=["dhx_delete_btn","dhx_save_btn"],d=[scheduler.config.buttons_left,scheduler.config.buttons_right],a=0;a<n.length;a++)for(var l=n[a],o=0;o<d.length;o++){for(var h=d[o],_=-1,c=0;c<h.length;c++)if(h[c]==l){_=c;
break}-1!=_&&h.splice(_,1)}}return this.resetLightbox(),!0});var a=scheduler._fill_lightbox;scheduler._fill_lightbox=function(){var t=this.getLightbox();this.config.readonly_active&&(t.style.visibility="hidden",t.style.display="block");var s=a.apply(this,arguments);if(this.config.readonly_active&&(t.style.visibility="",t.style.display="none"),this.config.readonly_active){var r=this.getLightbox(),n=this._lightbox_r=r.cloneNode(!0);n.id=scheduler.uid(),e("textarea",r,n,function(e){return e.value}),e("input",r,n,!1),e("select",r,n,function(e){return e.options.length?e.options[Math.max(e.selectedIndex||0,0)].text:""
}),r.parentNode.insertBefore(n,r),i.call(this,n),scheduler._lightbox&&scheduler._lightbox.parentNode.removeChild(scheduler._lightbox),this._lightbox=n,scheduler.config.drag_lightbox&&(n.firstChild.onmousedown=scheduler._ready_to_dnd),this.setLightboxSize(),n.onclick=function(e){var t=e?e.target:event.srcElement;if(t.className||(t=t.previousSibling),t&&t.className)switch(t.className){case"dhx_cancel_btn":scheduler.callEvent("onEventCancel",[scheduler._lightbox_id]),scheduler._edit_stop_event(scheduler.getEvent(scheduler._lightbox_id),!1),scheduler.hide_lightbox()
}}}return s};var i=scheduler.showCover;scheduler.showCover=function(){this.config.readonly_active||i.apply(this,arguments)};var n=scheduler.hide_lightbox;scheduler.hide_lightbox=function(){return this._lightbox_r&&(this._lightbox_r.parentNode.removeChild(this._lightbox_r),this._lightbox_r=this._lightbox=null),n.apply(this,arguments)}});
//# sourceMappingURL=../sources/ext/dhtmlxscheduler_readonly.js.map