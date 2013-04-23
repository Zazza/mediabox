$(document).ready(function() {
    //var player = document.getElementById("audio-player");
    var player = new Audio();
    player.volume = $("#volume").val()/100;

    var slider = $(".slider").kendoSlider({
        showButtons: false,
        tickPlacement: "none",
        min: 0,
        max: 0
    }).data("kendoSlider");

    $("#pl-audio").on("dblclick", ".track", function() {
        $(".track").removeClass("current");
        $(this).addClass("current");

        trackProcessPlay();

        trackPlay($(this));

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

            $("#current-track").text($(".current > .track-title").text() + " [" + duration + "]");

            $("#track-slider").html('<input class="slider" style="width: 174px;" />');

            slider = $(".slider").kendoSlider({
                showButtons: false,
                tickPlacement: "none",
                change: function(e) { player.currentTime = e.value; },
                min: 0,
                max: player.duration
            }).data("kendoSlider");
        }

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
        }

        var onEnd = function() {
            var currenttrack = $(".current");

            $(".track").removeClass("current");
            $(currenttrack).next().addClass("current");

            trackPlay($(".current"));
        }

        player.addEventListener('canplay', onStart);
        player.addEventListener('timeupdate', onTimeupdate);
        player.addEventListener('ended', onEnd);
    });

    function trackProcessPlay() {
        var current = $("#player-controls > .track-play > i");

        $(current).removeClass("icon-play");
        $(current).addClass("icon-pause");
    }

    function trackProcessPause() {
        var current = $("#player-controls > .track-pause > i");

        $(current).removeClass("icon-pause");
        $(current).addClass("icon-play");
    }

    $("#player-controls").on("click", ".track-play", function(){
        trackProcessPlay();

        player.play();
    });

    $("#player-controls").on("click", ".track-pause", function(){
        trackProcessPause();

        player.pause();
    });

    $("#track-prev").click(function(){
        var currenttrack = $(".current");

        $(".track").removeClass("current");
        $(currenttrack).prev(".track").addClass("current");

        trackPlay($(".current"));
    });

    $("#track-next").click(function(){
        var currenttrack = $(".current");

        $(".track").removeClass("current");
        $(currenttrack).next().addClass("current");

        trackPlay($(".current"));
    });

    $("#track-stop").click(function(){
        trackProcessPause()

        player.pause();
        player.currentTime = 0;
    });

    function trackPlay(track) {
        player.src = $(track).attr("data-id");

        player.play();
    }

    var audio = new Audio();
    $(".droptarget").kendoDropTarget({
        drop: function(e) {
            audio.src = "http://fm/get/?id=" + e.draggable.currentTarget.attr("data-id");

            $("#pl-audio").append("<div class='track' data-id='" + audio.src + "'><div class='track-title'>" + e.draggable.currentTarget.attr("title") + "</div><div class='track-duration'></div></div>");

            //var r = "<marquee behavior='alternate' scrolldelay='350'";

            audio.addEventListener('canplay', getDuration);
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
            //$(".track-title", this).text();

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