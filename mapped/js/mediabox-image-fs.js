
    /**
     * Image FS
     */
    function loadImgFs() {
        var fs;

        $("#fm_images_structure").html("");
        $.ajax({ type: "GET", url: baseUrl + 'image/getFsImg/', dataType: "JSON" })
            .done(function(res) {
                $.each(res, function(key, value) {
                    var templateContent = $("#imageTemplate").html();
                    var template = kendo.template(templateContent);

                    var timestamp = new Date(value["date"]);
                    var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                    var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ", " + timestamp.getDate() + "-" + monthNames[timestamp.getMonth()] + "-" + timestamp.getFullYear();

                    var size;
                    if ((value["size"] / 1024 / 1024) > 1) {
                        size = (value["size"] / 1024 / 1024).toFixed(2) + " Mb";
                    } else if ((value["size"] / 1024) > 1) {
                        size = (value["size"] / 1024).toFixed(2) + " Kb";
                    } else {
                        size = value["size"] + " Б";
                    };

                    var data = [
                        {
                            id:         value["id"],
                            name:       value["name"],
                            shortname:  value["shortname"],
                            date:       time,
                            size:       size,
                            ico:        value["ico"],
                            ext:        value["ext"],
                            href:       $("#storage").val()+"/get/?id=" + value["id"]
                        }
                    ];

                    var result = kendo.render(template, data);

                    $("#fm_images_structure").append(result);

                })

                $(".fm_ajax-loader").hide();
                $(".swipebox").swipebox();
            })
    }

    getTagsAndCrops();
    function getTagsAndCrops() {
        $("#imageview #allTags").html("");
        $.ajax({ type: "GET", url: baseUrl + 'image/getAllTags/', dataType: "JSON" })
            .done(function(res) {
                $.each(res, function(key, value) {
                    $("#imageview #allTags").append("<span class='tagAll k-content'>" + value.tag + "</span> ");
                });

                $("#imageview #allCrops").html("");
                $.ajax({ type: "GET", url: baseUrl + 'image/getAllCrops/', dataType: "JSON" })
                    .done(function(res) {
                        $.each(res, function(key, value) {
                            $("#imageview #allCrops").append("<span class='cropAll k-content'>" + value.description + "</span> ");
                        });

                        //scrollbar
                        //$("#imageview").mCustomScrollbar({scrollInertia:150});
                    })
            });
    }

    $("#allTags").on("click", ".tagAll", function(){
        $.ajax({ type: "GET", url: baseUrl + 'image/selTag/', data: "tag=" + encodeURIComponent($(this).text()) })
            .done(function(res) {
                getTagsAndCrops();
                loadImgFs();
            })
    });

    $("#allCrops").on("click", ".cropAll", function(){
        $.ajax({ type: "GET", url: baseUrl + 'image/selCrop/', data: "crop=" + encodeURIComponent($(this).text()) })
            .done(function(res) {
                getTagsAndCrops();
                loadImgFs();
            })
    });
    // End Image Fs
