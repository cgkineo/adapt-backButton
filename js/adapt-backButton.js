define([
    'core/js/adapt'
], function(Adapt) {

    var BackButton = Backbone.Controller.extend({

        _$html: null,

        initialize: function() {
            this.listenTo(Adapt, "app:dataReady", this._onDataReady);
        },

        _onDataReady: function() {
            var config = Adapt.config.get("_backButton");
            if (!config || !config._isEnabled) return;
            this._$html = $("html");
            this.listenTo(Adapt, {
                'remove': this._onRemove,
                'router:menu router:page': this._onRouterEvent,
                'navigation:redirectedBackButton': this._redirected
            });
        },

        _onRouterEvent: function(model) {
            this._config = model.get("_backButton");
            var isEnabled = (this._config && this._config._isEnabled);
            if (!isEnabled) return this._disabled();
            this._enabled();
        },

        _onRemove: function() {
            this._disabled();
        },

        _disabled: function() {
            this._$html.removeClass("hide-back-button");
            if (this._dataEvent) {
                $(".navigation-back-button").attr("data-event", this._dataEvent);
                this._dataEvent = null;
            }
        },

        _enabled: function() {
            this._$html.toggleClass("hide-back-button", !!this._config._hideBackButton);
            if (this._config._redirectToId) {
                var $backButton = $(".navigation-back-button");
                this._dataEvent = $backButton.attr("data-event");
                $backButton.attr("data-event", "redirectedBackButton");
                //navigationView hides the back button when we're at course level,
                //which is no use if we want to redirect it - so unhide it again.
                $backButton.removeClass('display-none');
            }
        },

        _redirected: function() {
            if (!this._config._redirectToId) return;
            var model = Adapt.findById(this._config._redirectToId);
            if (!model) return;
            switch (model.get("_type")) {
                case "course":
                    Backbone.history.navigate("#/", { trigger: true, replace: false });
                    break;
                case "menu":
                case "page":
                    Backbone.history.navigate("#/id/"+model.get("_id"), { trigger: true, replace: false });
                    break;
            }
        }

    });

    return new BackButton();

});
