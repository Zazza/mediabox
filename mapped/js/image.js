(function( $ ){
    /**
     * Initialize
     */

    var jcrop_api;
    var _id;
    var original_width;
    var original_height;
    var current_width;
    var current_height;
    //$("#image-comment-editor").wysihtml5();
    //$("#image-comment-editor").kendoEditor();

    $("#preview-scroll").css("height", $(window).height() - 67);
    $(window).resize(function() {
        $("#preview-scroll").css("height", $(window).height() - 67);
    });

    $("#preview-scroll").mCustomScrollbar({ scrollInertia:150, advanced:{ updateOnContentResize: true } });

    var methods = {
        init: function( options ) {
            $("#splitter").fadeOut();
            $("#image-preview").delay(500).fadeIn();

            return this;
        },
        close: function() {
            $("#image-preview").fadeOut();
            $("#splitter").delay(500).fadeIn();
        },
        loadImg : function( options ) {
            var src = $(this);
            var per;

            _id = $(src).attr("data-id");
            original_width = $('#preview-img').width();
            original_height = $('#preview-img').height();
            current_width = $('#preview-img').width();
            current_height = $('#preview-img').height();

            /**
             * Get image parameters
             */
            $.ajax({ type: "get", url: $("#storage").val() + '/getImageDesc/', data: "id=" + _id, dataType: "JSONP" })
                .done(function(res) {
                    $.each(res, function(key, value){
                        if (key == "y") {
                            original_height = value;
                            per = original_height / ($(window).height() - 170);
                            current_height = $(window).height() - 170;
                        }
                        if (key == "x") {
                            original_width = value;
                            current_width = original_width / per;
                        }
                    });

                    $("<img id='preview-img' width='" + current_width + "' height='" + current_height + "' src='"+$("#storage").val()+"/get/?id=" + _id + "' />").load(function(){
                        $("#preview-div-img").html(this);

                        /**
                         * Jcrop
                         */
                        $(this).Jcrop({
                            onSelect: showCoords,
                            onChange: showCoords
                        }, function(){
                            jcrop_api = this;
                        });

                        $(src).addClass("current");

                        /**
                         * Get Crops
                         */
                        $.ajax({ type: "GET", dataType: "JSON", url: 'image/getCrops/', data: "id=" + _id })
                            .done(function(res) {
                                $("#image-crops").html("");

                                $.each(res, function(key, value){
                                    $("#image-crops").append('<div class="image-crop" data-x1="'+value.x1+'" data-x2="'+value.x2+'" data-y1="'+value.y1+'" data-y2="'+value.y2+'" data-ws="'+value.ws+'">'+value.description+'</div>');
                                })

                                $("#image-crops").on("mouseover", ".image-crop", function(){
                                    overAXIS(this);
                                })

                                $("#image-crops").on("mouseout", ".image-crop", function(){
                                    outAXIS();
                                })
                            })

                        /**
                         * Get Tags
                         */
                        $.ajax({ type: "GET", dataType: "JSON", url: 'image/getTags/', data: "id=" + _id })
                            .done(function(res) {
                                $("#image-tags").html("");

                                $.each(res, function(key, value){
                                    $("#image-tags").append('<div class="image-tag">'+value.tag+'</div>');
                                })
                            })

                        /**
                         * Show comments
                         */
                        $.ajax({ type: "GET", dataType: "JSON", url: 'image/getComments/', data: "id=" + _id })
                            .done(function(res) {
                                $.each(res, function(key, value){
                                    var timestamp = new Date(value.timestamp);
                                    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                                    var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ", " + timestamp.getDate() + "-" + monthNames[timestamp.getMonth()] + "-" + timestamp.getFullYear();
                                    $("#image-comments").append(time + ": " + decodeURIComponent(value.text));
                                })
                            })
                    });
                });
        },
        preview : function( options ) {
            var xmlhttp;
            var img = this;
            if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            } else { // code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    $(img).attr("src", xmlhttp.responseText);
                }
            };
            xmlhttp.open("GET", 'fm/getThumb/?name='+$(img).attr("data-id") );
            xmlhttp.send(null);
        }
    };
    $.fn.image = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' not found' );
        }
    };

    /**
     * Show select area
     * @param obj
     */
    function overAXIS(obj) {
        var ws = current_width / $(obj).attr("data-ws");
        ws = ws.toFixed(2);

        jcrop_api.setOptions({
            onSelect:    showCoords,
            bgColor:     'black',
            bgOpacity:   .4,
            setSelect:   [$(obj).attr("data-x1") * ws, $(obj).attr("data-y1") * ws, $(obj).attr("data-x2") * ws, $(obj).attr("data-y2") * ws]
        });
    }

    /**
     * Clear select area
     * @returns {boolean}
     */
    function outAXIS() {
        jcrop_api.release();
        jcrop_api.setOptions({ allowSelect: true });

        clearCoords();

        return false;
    }

    // Crop
    $("#saveCrop").click(function(){
        $("#div-crop-object-text").removeClass("error");

        $("#crop-object").kendoWindow({
            width: "300px",
            height: "150px",
            modal: true,
            title: "Crop object"
        });
        $("#crop-object").data("kendoWindow").center().open();
    });

    $("#clearCrop").click(function(){
        jcrop_api.release();
        jcrop_api.setOptions({ allowSelect: true });

        clearCoords();
    });

    $("#crop-object-save").click(function(){
        var x1 = $("#x1").val();
        var x2 = $("#x2").val();
        var y1 = $("#y1").val();
        var y2 = $("#y2").val();
        var desc = $("#crop-object-text").val();

        if (!x1 || !x2 || !y1 || !y2) {
            $("#crop-object").prepend("<div class='k-block k-error-colored crop-error' style='margin-bottom: -10px'>selection area isn't chosen</div>");
        } else if (!desc) {
            $("#div-crop-object-text").addClass("error");
        } else {
            var data = "x1=" + x1 + "&x2=" + x2 + "&y1=" + y1 + "&y2=" + y2 + "&_id=" + _id + "&desc=" + desc + "&ws=" + current_width;

            $.ajax({ type: "GET", url: 'image/setCrop/', data: data })
                .done(function(res) { $("#crop-object").data("kendoWindow").close(); })
        }
    });

    $("#crop-object-close").click(function(){
        $("#crop-object").data("kendoWindow").close();
    });
    // END Crop


    // Tag
    $("#addTag").click(function(){
        $("#div-image-tag-text").removeClass("error");

        $("#image-tag").kendoWindow({
            width: "300px",
            height: "150px",
            modal: true,
            title: "Add tag"
        });
        $("#image-tag").data("kendoWindow").center().open();
    });

    $("#image-tag-save").click(function(){
        var tag = $("#image-tag-text").val();

        if (tag) {
            var data = "_id=" + _id + "&tag=" + tag;

            $.ajax({ type: "GET", url: 'image/addTag/', data: data })
                .done(function(res) { $("#image-tag").data("kendoWindow").close(); })
        } else {
            $("#div-image-tag-text").addClass("error");
        }
    });

    $("#image-tag-close").click(function(){
        $("#image-tag").data("kendoWindow").close();
    });
    // END Tag

    function showCoords(c) {
        $("#x1").val(c.x);
        $("#y1").val(c.y);
        $("#x2").val(c.x2);
        $("#y2").val(c.y2);
    };

    function clearCoords() {
        $("#x1").val('');
        $("#y1").val('');
        $("#x2").val('');
        $("#y2").val('');
    };

    $("#image-comment-save").click(function(){
        $.ajax({ type: "GET", url: 'image/addComment/', dataType: "JSON", data: "id=" + _id + "&text=" + encodeURIComponent($("#image-comment-editor").val()) })
            .done(function(res) { $("#image-comments").append($("#image-comment-editor").val()); })
    });

    $("#image-preview").on("click", "#back", function(){
        $(this).image("close");
        $("div.current").removeClass("current");
    });

    $("#image-preview").on("click", "#next", function(){
        var cur_id = 0; var next = "";
        var imgs = $("div.dfile");

        $.each(imgs, function(key, value) {
            if ($(value).attr("title") == $(".current").attr("title")) {
                cur_id = key;
            }
        });

        if (cur_id == imgs.length-1) {
            next = imgs[0];
        } else {
            var id = parseInt(cur_id) + parseInt(1);
            next = imgs[id];
        }

        $(next).image("loadImg");

        $("div.current").removeClass("current");
        $(next).addClass("current");
    });
    $("#image-preview").on("click", "#prev", function(){
        var cur_id = 0; var prev = "";
        var imgs = $("div.dfile");

        $.each(imgs, function(key, value) {
            if ($(value).attr("title") == $(".current").attr("title")) {
                cur_id = key;
            }
        });

        if (cur_id == 0) {
            prev = imgs[imgs.length-1];
        } else {
            var id = parseInt(cur_id) - parseInt(1);
            prev = imgs[id];
        }

        $(prev).image("loadImg");

        $("div.current").removeClass("current");
        $(prev).addClass("current");
    });
    $("#image-preview").on("click", "#fullscreen", function(){

    });
    $("#image-preview").on("click", "#zoomIn", function(){

    });
    $("#image-preview").on("click", "#zoomOut", function(){

    });
})( jQuery );