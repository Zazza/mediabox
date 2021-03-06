(function( $ ){
    /**
     * Initialize
     */
    var player;
    var slider;
    var mediaElement = "video-player";
    var plugin_active = false;

    var methods = {
        init: function( options ) {
            var track = this;

            $(this).addClass("current");

            $("#splitter").fadeOut();
            $("#video-preview").fadeIn();

            $("#" + mediaElement).attr("src", $("#storage").val() + '/get/?id=' + $(track).attr('data-id'));
            $("#" + mediaElement).attr("type", 'video/' + $(track).attr('data-ext'));

            /**
             * SET meta information
             */
            $("#video-meta > .name").html("");
            $("#video-meta > .name").html($(track).attr("title"));
            $("#video-meta > .order").html("");
            $("#video-meta > .order").html("[" + (parseInt($(".current").index())+parseInt(1)) + "/" + $(".dfile").length + "]");
            $("#video-meta > .size").html("");
            $("#video-meta > .size").html($(".current .file_icon_size").text());
            $("#video-meta > .download").html("");
            $("#video-meta > .download").attr("href", $("#storage").val() + '/get/?id=' + $(track).attr('data-id'));

            /*
            player = new MediaElement(mediaElement, {
                plugins: ['flash'],
                defaultVideoWidth: 480,
                defaultVideoHeight: 270,
                pluginWidth: -1,
                pluginHeight: -1,
                //enablePseudoStreaming: true,
                success: function(player, domObject){

                    player.volume = $("#volume").val()/100;

                    //player.load();
                    player.play();

                    plugin_active = true;
                },
                error : function(player) {
                    console.log('medialement problem is detected: %o', player);
                    $(".me-cannotplay").remove();
                    $("#preview-scroll-right").append('<div class="video-unsupported" style="width: 640; height: 480;">Format not supported</div>');

                    plugin_active = false;
                }
            });
            */

            player = new MediaElementPlayer("#" + mediaElement, {
                plugins: ['flash', 'silverlight'],
                success: function (mediaElement, domObject) {
                    if (mediaElement.pluginType == 'flash') {
                        mediaElement.addEventListener('canplay', function() {
                            // Player is ready
                            mediaElement.play();
                        }, false);
                    }

                    console.log('mediaelement success');

                    plugin_active = true;
                },
                error : function(player) {
                    console.log('medialement problem is detected: %o', player);

                    plugin_active = false;
                }
            });

            return this;
        },
        close: function() {
            if (plugin_active) {
                player.remove();
            } else {
                $('#preview-scroll-right').html('<video id="video-player" width="640" height="480" src="" type="" controls="controls" preload="true" autoplay="true"></video>');
            }

            $("#video-preview").fadeOut();
            $("#splitter").fadeIn();
        },
        load: function( options ) {
            var track = this;

            if (!player) {
                $(track).player("init");
            }

            return this
        },
        play: function() {
            player.play();

            if ($(".fs-track-current").width() > 0) {
                $(".fs-track-current").removeClass("icon-play").addClass("icon-pause");
            }

            // Unset bold at playlist tracks
            $(".track").removeClass("playlist-track-current");

            var current = $(".track-play");
            $("i", current).removeClass("icon-play").addClass("icon-pause");
            $(current).removeClass("track-play").addClass("track-pause");

            $("#current-track").text($(this).attr("title"));
        },
        pause: function() {
            player.pause();

            if ($(".fs-track-current").width() > 0) {
                $(".fs-track-current").removeClass("icon-pause").addClass("icon-play");
            }

            var current = $(".track-pause");
            $("i", current).removeClass("icon-pause").addClass("icon-play");
            $(current).removeClass("track-pause").addClass("track-play");
        },

        stop: function() {
            player.setCurrentTime(0);
            player.pause();

            if ($(".fs-track-current").width() > 0) {
                $(".fs-track-current").removeClass("icon-pause").addClass("icon-play");
            }

            var current = $(".track-pause");
            $("i", current).removeClass("icon-pause").addClass("icon-play");
            $(current).removeClass("track-pause").addClass("track-play");

            slider.value(0);
            $("#current-track-time").text("--:--");
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
    //$("#video-player").attr("height", $(window).height() - 65);
    //$("#video-player").attr("width", $(window).width() - 15);
    //$("#video-player").attr();
});
