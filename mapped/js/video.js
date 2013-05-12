(function( $ ){
    /**
     * Initialize
     */
    var videoPlayer;

    var methods = {
        init: function( options ) {
            $("#splitter").fadeOut();
            $("#video-preview").delay(500).fadeIn();

            var video_element = $('#video-player');
            $(video_element).attr("src", $("#storage").val() + "/get/?id=" + $(this).attr("data-id"));
            $(video_element).attr("type", "video/" + $(this).attr("data-ext"));

            videoPlayer = $(video_element).mediaelementplayer({
                features: ['playpause','progress','current','duration','tracks','fullscreen'],
                defaultVideoWidth: 480,
                // default if the <video height> is not specified
                defaultVideoHeight: 270,
                // overrides <video width>
                pluginWidth: -1,
                // overrides <video height>
                pluginHeight: -1
            });

            return this;
        },
        close: function() {
            $("#video-preview").fadeOut();
            $("#splitter").delay(500).fadeIn();

            videoPlayer.pause();
        }
    };
    $.fn.video = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' not found' );
        }
    };

    $("#video-preview").on("click", "#back", function(){
        $(this).video("close");
        $("div.current").removeClass("current");
    });

})( jQuery );

$(document).ready(function() {
    $("#video-player").attr("height", $(window).height() - 65);
    $("#video-player").attr("width", $(window).width() - 15);
});
