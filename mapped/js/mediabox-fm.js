
    function remove(e) {
        var files = e.files;

        $.each(files, function(key, file) {
            removeFile(file.name)
        });
    }

    function removeFile(filename) {
        $.ajax({ type: "GET", url: 'fm/remove/', dataType: "JSON", data: "file=" + encodeURIComponent(filename)})
            .done(function(res) {
                $.each(res, function(key, value) {
                    $.ajax({ type: "get", url: $("#storage").val() + '/remove/', data: "id=" + value, dataType: "JSONP" })
                        .done(function(res) {
                            // Remove from FS Structure
                            $(".dfile[data-id='"+value+"']").fadeOut();
                        })
                });
            })
    }

    function removeDir(dirname) {
        $.ajax({ type: "GET", url: "fm/rmFolder/", data: "name=" + encodeURIComponent(dirname) })
            .done(function(res) {
                //!!! Remove folders from fs structure
            });
    }

    function chdir(start_id, type) {
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
                    }
                    if(key == "image") {
                        $("#typeImage").html(value);
                    }
                    if(key == "video") {
                        $("#typeVideo").html(value);
                    }
                    if(key == "audio") {
                        $("#typeAudio").html(value);
                    }
                })
            })

        var fs;
        $.ajax({ type: "GET", url: 'fm/chdir/', dataType: "JSON", data: "id=" + start_id + "&type=" + type })
            .done(function(res) {
                $.each(res, function(key, value) {
                    if (value["obj"] == "folder") {
                        addFolderToFS(value);
                    } else if (value["obj"] == "file") {
                        addFileToFS(type, value);
                    }
                })

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

        var timestamp = new Date(value["date"]);
        var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        var time = timestamp.getHours() + ":" + timestamp.getMinutes() + ", " + timestamp.getDate() + "-" + monthNames[timestamp.getMonth()] + "-" + timestamp.getFullYear();
        var data = [
            {
                name:   value["name"],
                id:     value["id"],
                date:   time
            }
        ];

        var result = kendo.render(template, data);

        $("#fm_folders").append(result);
    }

    function addFileToFS(type, value) {
        var templateContent = $("#"+type+"Template").html();
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

        if (type == "image") {
            $("#fm_images").append(result);
        } else if (type == "video") {
            $("#fm_video").append(result);
        } else if (type == "audio") {
            $("#fm_audio").append(result);
        } else {
            $("#fm_files").append(result);
        }
    }

    function copyFiles() {
        var selfiles = Array(); var i = 0;

        $(".dfile").each(function(value) {
            if ($("div", this).hasClass("fm_sellabel")) {
                selfiles[i] = encodeURIComponent($(this).attr("data-id"));
                i++;
            }
        });

        $.ajax({ type: "POST", url: "fm/copy/", data: selfiles.join("&"), dataType: "JSON" })
            .done(function(res) {
                $.each(res, function(key, value) {
                    if (key == "buffer")
                        $("#buffer").html(value);
                    if (key == "count")
                        $("#buffer_count").html("("+value+")");
                });
            })
    }

    $.ajax({ type: "GET", url: baseUrl + "fm/buffer/", dataType: "JSON" })
        .done(function(res) {
            var _id; var name;
            $.each(res, function(i, part) {
                $.each(part, function(key, value) {
                    if(key=="name") {
                        name = value;
                    }
                    if(key=="_id") {
                        _id = value;
                    }
                });

                $("#buffer").append("<div data-id='"+_id+"'>"+name+"</div>")
            });


        })

    function pastFiles() {
        $.ajax({ type: "GET", url: "fm/past/", dataType: "JSON" })
            .done(function(res) {
                $("#buffer").html("");
                $("#buffer_count").html("(0)");
                $.each(res, function(key, value) {
                    $("#fm_uploadDir").append(value);
                });
            })
            .fail(function(res) {
                alert(res.responseText);
            })
    }
