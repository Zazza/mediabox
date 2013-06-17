(function( $ ){
    /**
     * Initialize
     */
    var player;
    var slider;
    var mediaElement = "video-player";
    var plugin_active;

    var methods = {
        init: function( options ) {
            var track = this;

            $(this).addClass("current");

            $("#splitter").fadeOut();
            $("#video-preview").delay(500).fadeIn();

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

            player = new MediaElement(mediaElement, {
                plugins: ['flash'],
                defaultVideoWidth: 480,
                defaultVideoHeight: 270,
                pluginWidth: -1,
                pluginHeight: -1,
                success: function(player, domObject){

                    player.volume = $("#volume").val()/100;

                    /*
                    var onStart = function() {
                        var dsec = parseInt(player.duration - Math.floor(player.duration / 60)*60);
                        if (!isNaN(dsec)) {
                            if (dsec < 10) {
                                dsec = "0" + dsec;
                            }
                            var duration = Math.floor(player.duration / 60) + ":" + dsec;
                        } else {
                            var duration = "--:--";
                        }

                        $("#current-track-duration").text(duration);

                        $("#track-slider").html('<input class="slider" style="width: 215px;" />');

                        slider = $(".slider").kendoSlider({
                            showButtons: false,
                            tickPlacement: "none",
                            change: function(e) { player.setCurrentTime(e.value); },
                            min: 0,
                            max: player.duration
                        }).data("kendoSlider");
                    };
                    var onTimeupdate = function() {
                        slider.value(parseInt(player.currentTime, 10));

                        var sec = parseInt(player.currentTime - Math.floor(player.currentTime / 60)*60);
                        if (!isNaN(sec)) {
                            if (sec < 10) {
                                sec = "0" + sec;
                            }
                            var currentTime = Math.floor(player.currentTime / 60) + ":" + sec;
                        } else {
                            var currentTime = "--:--";
                        }

                        $("#current-track-time").text(currentTime);
                    };
                    var onEnd = function() {
                        var currenttrack = $(".playlist-track-current");

                        if ($(".fs-track-current").width() > 0) {
                            $(".fs-track-current").removeClass("icon-pause").addClass("icon-play").removeClass("fs-track-current");
                        }

                        $(".track").removeClass("playlist-track-current");
                        $(currenttrack).next().addClass("playlist-track-current");

                        if (!$(".playlist-track-current").last()) {
                            $(".playlist-track-current").player("load").player("play");
                        }
                    };
                    */

                    //player.addEventListener('progress', onStart);
                    //player.addEventListener('canplay', onStart);
                    //player.addEventListener('timeupdate', onTimeupdate);
                    //player.addEventListener('ended', onEnd);

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

            return this;
        },
        close: function() {
            $("#video-preview").fadeOut();
            $("#splitter").delay(500).fadeIn();

            if (plugin_active) {
                player.setCurrentTime(0);
                player.pause();
            }

            if ($(".me-plugin").width() > 0)
                $(".me-plugin").remove();
            if ($(".video-unsupported").width() > 0)
                $(".video-unsupported").remove();
        },
        load: function( options ) {
            var track = this;

            if (!player) {
                $(track).player("init");
            } else {
                player.pause();
                player.setSrc([{ src: $("#storage").val() + '/get/?id=' + $(track).attr('data-id'), type: 'audio/' + $(track).attr('data-ext') }]);
                //player.load();
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
