
    function remove(e) {
        var files = e.files;

        $.each(files, function(key, file) {
            removeFile(file.name)
        });
    }

    function removeByStorage(id) {
        $.ajax({ type: "get", url: $("#storage").val() + '/remove/', data: "id=" + id, dataType: "JSONP" });
    }

    function removeFileByName(name) {
        $.ajax({ type: "GET", url: 'fm/removeFileByName/', data: "name=" + name })
            .done(function(res) {
                var id = res;

                removeByStorage(id);

                // Remove from FS Structure
                $(".dfile[data-id='"+id+"']").fadeOut();
            })
    }

    function removeFile(id) {
        $.ajax({ type: "GET", url: 'fm/remove/', dataType: "JSON", data: "id=" + id })
            .done(function(res) {
                removeByStorage(id);

                // Remove from FS Structure
                $(".dfile[data-id='"+id+"']").fadeOut();
            })
    }

    function removeDir(id) {
        $.ajax({ type: "GET", url: "fm/rmFolder/", data: "id=" + id })
            .done(function(res) {
                // Remove folders from fs structure
                $(".ddir[data-id='"+id+"']").fadeOut();
            });
    }

    function chdir(start_id) {
        $("#fm_folders").html("");
        $("#fm_files").html("");
        $("#fm_images").html("");
        $("#fm_video").html("");
        $("#fm_audio").html("");

        $(".fm_ajax-loader").show();

        $("#start_dir").val(start_id);

        $.ajax({ type: "GET", url: 'fm/getTypesNum/', dataType: "JSON", data: "id=" + start_id })
            .done(function(res) {
                $.each(res, function(key, value) {
                    if(key == "all") {
                        $("#typeAll").html(value);
                        $("#fs-menu-1 .numFiles").text(value);
                    }
                    if(key == "image") {
                        $("#typeImage").html(value);
                        $("#fs-menu-2 .numFiles").text(value);
                    }
                    if(key == "video") {
                        $("#typeVideo").html(value);
                        $("#fs-menu-3 .numFiles").text(value);
                    }
                    if(key == "audio") {
                        $("#typeAudio").html(value);
                        $("#fs-menu-4 .numFiles").text(value);
                    }
                })
            })

        var fs;
        $.ajax({ type: "GET", url: 'fm/chdir/', dataType: "JSON", data: "id=" + start_id, cache: false })
            .done(function(res) {
                var size = 0;
                $.each(res, function(key, value) {
                    if (value["obj"] == "folder") {
                        addFolderToFS(value);
                    } else if (value["obj"] == "file") {
                        addFileToFS(value);

                        size += parseInt(value["size"]);
                    }
                })

                $(".sizeFiles").text(formatSize(size));

                $(".fm_file_li:odd").addClass("k-alt");

                $(".dfile").kendoDraggable({
                    hint: function(e) {
                        return e.clone();
                        //return $(".dfile").clone();
                    }
                });

                $(".fm_ajax-loader").hide();
                $(".swipebox").swipebox();
            })
    }

    function addFolderToFS(value) {
        var templateContent = $("#dirTemplate").html();
        var template = kendo.template(templateContent);

        var data = [
            {
                name:   value["name"],
                id:     value["id"],
                date:   formatDate(value["date"])
            }
        ];

        var result = kendo.render(template, data);

        $("#fm_folders").append(result);
    }

    function addFileToFS(value) {

        var templateContent = $("#"+value["tab"]+"Template").html();
        var template = kendo.template(templateContent);

        var data = [
            {
                id:         value["id"],
                name:       value["name"],
                shortname:  value["shortname"],
                date:       formatDate(value["date"]),
                size:       formatSize(value["size"]),
                ico:        value["ico"],
                ext:        value["ext"],
                type:       value["type"],
                href:       $("#storage").val()+"/get/?id=" + value["id"]
            }
        ];

        var result = kendo.render(template, data);

        if (value["tab"] == "image") {
            $("#fm_images").append(result);
        } else if (value["tab"] == "video") {
            $("#fm_video").append(result);
        } else if (value["tab"] == "audio") {
            $("#fm_audio").append(result);
        } else {
            $("#fm_files").append(result);
        }
    }

    function bufferPast(value) {
        var templateContent = $("#bufferFileTemplate").html();
        var template = kendo.template(templateContent);

        var data = [
            {
                id:         value["id"],
                shortname:  decodeURIComponent(value["shortname"]),
                date:       formatDate(value["date"]),
                size:       formatSize(value["size"]),
                ico:        value["ico"],
                obj:        value["obj"]
            } ];

        var result = kendo.render(template, data);

        $("#buffer").append(result);
    }

    function copyFiles() {
        var selfiles = Array();

        $(".ddir").each(function(value) {
            if ($("div", this).hasClass("fm_sellabel")) {
                selfiles[selfiles.length] = "folder=" + $(this).attr("data-id");
            }
        });

        $(".dfile").each(function(value) {
            if ($("div", this).hasClass("fm_sellabel")) {
                selfiles[selfiles.length] = "file=" + $(this).attr("data-id");
            }
        });

        $.ajax({ type: "POST", url: "fm/copy/", data: selfiles.join("&"), dataType: "JSON" })
            .done(function(res) {
                $("#buffer").html("");

                $(".bufferCount").text(res.length);

                $.each(res, function(i, value) {
                    bufferPast(value);
                });
            })
    }

    $.ajax({ type: "GET", url: baseUrl + "fm/buffer/", dataType: "JSON" })
        .done(function(res) {
            if (res && res.length) {
                $(".bufferCount").text(res.length);

                $.each(res, function(i, value) {
                    bufferPast(value);
                });
            }
            else {
                $(".bufferCount").text(0);
            }
        });

    $("#clearBuffer").click(function(){
        $.ajax({ type: "GET", url: baseUrl + "fm/clearBuffer/" })
            .done(function(res){
                $("#buffer").html("");

                $(".bufferCount").text(0);
            })
    });

    $("#buffer").on("click", ".deleteFileFromBuffer", function(){
        $.ajax({ type: "GET", url: baseUrl + "fm/deleteFileFromBuffer/", data: "id="+$(this).attr("data-id"), dataType: "JSON" })
            .done(function(res){
                $("#buffer").html("");

                $(".bufferCount").text(res.length);

                $.each(res, function(i, value) {
                    bufferPast(value);
                })
            })
    });

    $("#buffer").on("click", ".downloadFileFromBuffer", function(){
        window.location.href = $("#storage").val()+"/get/?id=" + $(this).attr("data-id");
    });

    function pastFiles() {
        $.ajax({ type: "GET", url: "fm/past/", dataType: "JSON" })
            .done(function(res) {
                $("#buffer").html("");
                $(".bufferCount").text(0);

                chdir($("#start_dir").val());
            })
            .fail(function(res) {
                alert(res.responseText);
            })
    }

    function formatDate(date) {
        var timestamp = new Date(date);
        var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        if (timestamp.getMinutes() < 10) {
            var min = '0' + timestamp.getMinutes();
        } else {
            var min = timestamp.getMinutes() + '';
        }
        return timestamp.getHours() + ":" + min + ", " + timestamp.getDate() + "-" + monthNames[timestamp.getMonth()] + "-" + timestamp.getFullYear();
    }

    function formatSize(byteSize) {
        var size;
        if ((byteSize / 1024 / 1024) > 1) {
            size = (byteSize / 1024 / 1024).toFixed(2) + " Mb";
        } else if ((byteSize / 1024) > 1) {
            size = (byteSize / 1024).toFixed(2) + " Kb";
        } else {
            size = byteSize + " Б";
        };

        return size;
    }

    function openFile(file) {
        var type = $(file).attr("data-type");

        var ext = $(file).attr("title");
        ext = ext.substring(ext.lastIndexOf('.')+1);

        if (type == "image") {
            $(file).image("init").image("one").image("loadImg");
        } else if (type == "audio") {
            $(".fs-track-current").removeClass("fs-track-current").removeClass("icon-pause").addClass("icon-play");
            $(".icon-play", file).addClass("fs-track-current");

            $(file).player("load").player("play");
        } else if (type == "video") {
            $(file).video("init");
        } else if (type == "all") {
            //stop the browser from following
            //e.preventDefault();
            window.location.href = $("#storage").val()+"/get/?id=" + $(file).attr("data-id");
        }
    }