(function( $ ){
    /**
     * Initialize
     */
    var mediaElement = "mediaElement";
    var player;
    var slider = $(".slider").kendoSlider({
        showButtons: false,
        tickPlacement: "none",
        min: 0,
        max: 0
    }).data("kendoSlider");

    var methods = {
        init: function( options ) {
            var track = this;

            $("#" + mediaElement).attr("src", $("#storage").val() + '/get/?id=' + $(track).attr('data-id'));
            $("#" + mediaElement).attr("type", 'audio/' + $(track).attr('data-ext'));

            player = new MediaElement(mediaElement, {
                success: function(player, domObject){

                    player.volume = $("#volume").val()/100;

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

                        $("#track-slider").html('<input class="slider" style="width: 174px;" />');

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
                        var currenttrack = $(".current");

                        $(".track").removeClass("current");
                        $(currenttrack).next().addClass("current");

                        $(".current").player("load").player("play");
                    };

                    player.addEventListener('progress', onStart);
                    player.addEventListener('timeupdate', onTimeupdate);
                    player.addEventListener('ended', onEnd);

                    //player.load();
                    player.play();
                },
                error : function(player) {
                    console.log('medialement problem is detected: %o', player);
                }
            });

            return this;
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

            // Unset bold at playlist tracks
            $(".track").removeClass("current");

            var current = $(".track-play");
            $("i", current).removeClass("icon-play").addClass("icon-pause");
            $(current).removeClass("track-play").addClass("track-pause");

            $("#current-track").text($(this).attr("title"));
        },
        pause: function() {
            player.pause();

            var current = $(".track-pause");
            $("i", current).removeClass("icon-pause").addClass("icon-play");
            $(current).removeClass("track-pause").addClass("track-play");
        },

        stop: function() {
            player.setCurrentTime(0);
            player.pause();

            var current = $(".track-pause");
            $("i", current).removeClass("icon-pause").addClass("icon-play");
            $(current).removeClass("track-pause").addClass("track-play");

            slider.value(0);
            $("#current-track-time").text("--:--");
        }
    };
    $.fn.player = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' not found' );
        }
    };
})( jQuery );

$(document).ready(function() {
    $("#pl-audio").on("dblclick", ".track", function() {
        $(this).player("load").player("play");

        $(this).addClass("current");
    });

    $("#player-controls").on("click", ".track-play", function(){
        $(this).player("play");
    });

    $("#player-controls").on("click", ".track-pause", function(){
        $(this).player("pause");
    });

    $("#player-controls").on("click", "#track-stop", function(){
        $(this).player("stop");
    });

    $("#player-controls").on("click", "#track-prev", function(){
        var currenttrack = $(".current");

        $(".track").removeClass("current");
        $(currenttrack).prev(".track").addClass("current");

        $(".current").player("load").player("play");
    });

    $("#player-controls").on("click", "#track-next", function(){
        var currenttrack = $(".current");

        $(".track").removeClass("current");
        $(currenttrack).next().addClass("current");

        $(".current").player("load").player("play");
    });

    $(".droptarget").kendoDropTarget({
        drop: function(e) {
            $("#pl-audio").append("<div class='track' data-ext='"+e.draggable.currentTarget.attr("data-ext")+"' data-id='" + e.draggable.currentTarget.attr("data-id") + "' title='"+e.draggable.currentTarget.attr("title")+"'><div class='track-title'>" + e.draggable.currentTarget.attr("title") + "</div><div class='track-duration'></div></div>");
        }
    });

    function getDuration() {
        var d_sec = parseInt(audio.duration - Math.floor(audio.duration / 60)*60);
        if (!isNaN(d_sec)) {
            if (d_sec < 10) {
                d_sec = "0" + d_sec;
            }
            var d = Math.floor(audio.duration / 60) + ":" + d_sec;
        } else {
            var d = "--:--";
        }

        $(".track[data-id='"+audio.src+"'] > .track-duration").html(d);
    }

    $("#pl-audio").on("mouseover", ".track", function(){
        if ($(".track-title", this).width() + "px" == $(".track-title").css("max-width")) {

            track = $(this);
            text = $(".track-title", track).text();
            func();
        }
    });
    $("#pl-audio").on("mouseout", ".track", function(){
        clearTimeout(id);

        text = "";
        position = 0;
    });
});

var id;
var track;
var text;
var position = 0;
function func() {
    var k;
    var msg = text;
    k=(200/msg.length)+1;
    for (i = 0; i <= k; i++)
    {
        msg+=" "+msg;
        $(".track-title", track).text(msg.substring(position,position+75));
    }
    if (position++==msg.length){ position=0;}
    id = setTimeout("func()",100);
}