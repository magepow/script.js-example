(function ($) {
    var $settings = $('#magepowapps-infinitescroll-settings'),
        settings = {};
        if($settings.length){
            settings = JSON.parse($settings.html());
            /* delete empty config */
            var requireConfig = ['item', 'container', 'pagination', 'nextPagination'];
            $.each(requireConfig , function(index, val) {
                if(settings[val] == '')  delete settings[val];
            });
            if(settings['offset'] == -1) settings['offset'] = false;
        }
    var config   = $.extend({
        "item": ".product-item,.grid__item",
        "delay": 1000,
        "container": "#collection-product,#product-grid",
        "offset": false,
        "pagination": ".page-numbers,.pagination__list",
        "nextPagination": ".page-next,.pagination__item--prev",
        "doneText": "You've reached the end of the item.",
        "loadMoreButtonText": "Load More ...",
        "borderSize": 0,
        "borderRadius": 0,
        "fontSize": 14,
        "textColor": "#000000",
        "borderColor": "#adb9c4",
        "backgroundButtonLoadmore": "#adb9c4"
    }, settings);
    var options  = {
        container   : config["container"],
        item        : config["item"],
        pagination  : config["pagination"],
        next        : config["nextPagination"],
        delay       : config["delay"],
        src         : config["src"] ? config["src"] : $settings.data('loading'),
        htmlLoading : "<div class=\"iass-spinner\" style=\" margin-bottom: -80px; padding: 80px;\"><img src=\"{src}\"/><span><em>Loading - please wait...</em></span></div>",
        htmlLoadMore: "<div class=\"ias-trigger ias-trigger-next\"><button class=\"load-more\">"+config["loadMoreButtonText"]+"</button></div>",
        htmlLoadEnd : "<div class=\"ias-noneleft\" style=\" margin-bottom: -80px; padding: 80px;\">{text}</div>",
        textLoadEnd : config["doneText"],
        textLoadMore: config["loadMoreButtonText"],
        textPrev    : "Load more items",
        htmlPrev    : "<div class=\"ias-trigger ias-trigger-prev\"><button class=\"load-more\">"+config["loadMoreButtonText"]+"</button></div>",
        offset      : config["offset"]
    };
    var runTimeout;
	$(window).on('load collectionUpdated', function () {
        $('body').addClass('infinitescroll-pro');
        if(!jQuery().ias){
            console.warn('Plugin "jQuery.ias" does not exist!');
            return;
        }
        jQuery.ias('destroy');
        jQuery.ias({
            container : options.container,
            item      : options.item,
            pagination: options.pagination,
            next      : options.next,
            delay     : options.delay
        }).extension(new IASSpinnerExtension({
            src : options.src,
            html: options.htmlLoading
        })).extension(new IASNoneLeftExtension({
            text: options.textLoadEnd,
            html: options.htmlLoadEnd,
        })).extension(new IASTriggerExtension({
            text    : options.textLoadMore,
            html    : options.htmlLoadMore,
            textPrev: options.textPrev,
            htmlPrev: options.htmlPrev,
            offset  : options.offset,
        })).on('load', function(){
        }).on('rendered', function(items){
            $('body').trigger('contentUpdated');
        });
	});

    window.fetch = new Proxy(window.fetch, {
        apply(fetch, that, args) {
            const result = fetch.apply(that, args);
            result.then((response) => {
                if(response.url.includes('/collections/')){
                    runTimeout = setTimeout(function(){
                        var productGrid = $(options.container);
                        if(productGrid.hasClass('infinitescroll-init')){
                            return;
                        }
                        clearTimeout(runTimeout);
                        productGrid.addClass('infinitescroll-init');
                        $('body').trigger('collectionUpdated');
                    }, 500);
                }
            });
            return result;
        }
    });

})(jQuery)
