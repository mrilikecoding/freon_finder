
/**
 FreonFinder Home JS
 @class home
 @namespace FreonFinder
 @type {Object}
 **/
var FreonFinder = FreonFinder || {};


FreonFinder.home = (function($, document, window, undefined) {
    "use strict";

    // configuration properties


    /* Public Methods _________________________________________________________________ */

    /**
     The initialization of the page and plugins used in the page.
     @method init
     @return {Null} No return value
     **/

    function init() {

        $(document)
            .on('click', '.toggle-map', toggleMap)
            .on('click', '#csv', exportCSV)

    }


    /* Private Methods ________________________________________________________________ */

    function toggleMap(){
        var $map = $("#map-canvas");
        $map.toggle();
    }

    function exportCSV(){

        $('table').each(function() {
            var $table = $(this);
            var csv = $table.table2CSV({delivery:'value'});
            window.location.href = 'data:text/csv;charset=UTF-8,'
                + encodeURIComponent(csv);
        });

    }


    return {
        init: init
    };

}(jQuery, document, window, undefined));


jQuery(function() {
    "use strict";
    FreonFinder.home.init();
});