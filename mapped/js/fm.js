$(document).ready(function() {

    $("#menu").kendoMenu();

    $("#fileRes").kendoWindow({title: "URL:", resizable: false });

    $("#main-menu").kendoMenu({
        closeOnClick: false
    });

    $("#volume").kendoSlider({
        orientation: "vertical",
        min: 0,
        max: 100,
        value: $("#volume-level").val(),
        smallStep: 1,
        largeStep: 20,
        showButtons: false,
        slide: function(e) {
            var player = document.getElementById("audio-player");
            player.volume = e.value/100;
        },
        change: function(e) {
            $.ajax({type:"GET",url:"audio/volume/",data:"level="+e.value});
        }
    });

    $("#fs-menu").kendoTabStrip({
        animation:	{
            open: {
                duration: 100,
                effects: "fadeIn"
            }
        },
        select: function(e) {
            $.ajax({type:"GET",url:"app/fsMenu/",data:"tab="+e.item.id});
        }
    });

    $("#fs-menu-left").kendoTabStrip({
        animation:	{
            open: {
                duration: 100,
                effects: "fadeIn"
            }
        },
        select: function(e) {
            $.ajax({type:"GET",url:"app/fsMenuLeft/",data:"tab="+e.item.id});

            $(".fs-container-div").hide();

            if (e.item.id == "tab-left-images") {
                $("#fs_img").show();

                loadImgFs();
            } else if (e.item.id == "tab-left-fs") {
                $("#fs").show();

                chdir($("#start_dir").val());
            }
        }
    });

    $("#files").kendoUpload({
        showFileList: false,
        select: function(e) {
            var files = e.files;

            $.each(files, function(key, file) {
                upload(file)
            });
        }
    });

    window.onload = function() {
        var dropzone = document.getElementById("adv-menu-upload");
        dropzone.ondragover = dropzone.ondragenter = function(event) {
            event.stopPropagation();
            event.preventDefault();
        }

        dropzone.ondrop = function(event) {
            event.stopPropagation();
            event.preventDefault();

            var filesArray = event.dataTransfer.files;
            for (var i=0; i<filesArray.length; i++) {
                var file = {
                    "name": filesArray[i]["name"],
                    "size": filesArray[i]["size"],
                    "extension": filesArray[i]["name"].substr(filesArray[i]["name"].lastIndexOf('.')),
                    "rawFile": filesArray[i]
                };

                upload(file);
            }
        }
    }

    function sendFile(id, file) {
        var uri = $("#storage").val() + "/save/";
        var xhr = new XMLHttpRequest();

        xhr.open("POST", uri, true);
        var fd = new FormData();

        if (xhr.upload) {
            var templateContent = $("#fileUploadTemplate").html();
            var template = kendo.template(templateContent);

            var data = [
                { name: file.name, id: id }
            ];

            var result = kendo.render(template, data);

            $("#perc").append(result);


            xhr.upload.addEventListener("progress", function(e) {
                var pc = parseInt(e.loaded / e.total * 100);
                $(".k-progress-status", "#u_" + id).css("width", pc);
            }, false);


            xhr.onreadystatechange = function(e) {
                if (xhr.readyState == 4) {
                    $(".k-progress-status", "#u_" + id).css("width", "100%");
                }
            };

            fd.append('files', file);
            fd.append('id', id);
            xhr.send(fd);
        }

        // if remote save success
        return true;
    }

    function addThumb(file, id) {
        window.loadImage(
            file.rawFile,
            function (img) {
                $.ajax({ type: "POST", url: 'thumb/' + id + '/', data: img.toDataURL().replace(/data:image\/png;base64,/, '') });
            },
            {
                maxHeight: 80,
                canvas: true
            }
        )
    }

    function upload(file) {
        var type;
        var _id;
        var file;

        $.ajax({ type: "GET", url: 'fm/upload/', dataType: "JSON", data: "file=" + file.name + "&size=" + file.size + "&extension=" + file.extension.substr(1)})
            .done(function(res) {
                $.each(res, function(key, value) {
                    if (key == "type") {
                        type = value;
                    }
                    if (key == "_id") {
                        _id = value;
                    }
                });

                if (sendFile(_id, file.rawFile)) {
                    if (type == "image") {
                        addThumb(file, _id);
                    }
                }
            })
    }

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

    $("#splitter").kendoSplitter({
        orientation: "horizontal",
        panes: [
            { size: "200px", resizable: true, scrollable: true, min: "130px", max: "300px" },
            { resizable: true, scrollable: false },
            //{ size: "200px", resizable: false, scrollable: true, min: "130px", max: "300px" }
            { size: "0px", resizable: false, scrollable: false }
        ]
    });

    function chdir(start_id) {
        $("#fm_folders").html("");
        $("#fm_files").html("");
        $("#fm_images").html("");
        $("#fm_video").html("");
        $("#fm_music").html("");

        $("#cur_dir").val(start_id);

        $(".fm_ajax-loader").show();

        var fs;
        $.ajax({ type: "GET", url: 'fm/chdir/', dataType: "JSON", data: "id=" + start_id })
        .done(function(res) {
                $.each(res, function(key, value) {
                    if (value["obj"] == "folder") {
                        var templateContent = $("#dirTemplate").html();
                        var template = kendo.template(templateContent);

                        var data = [
                            { name: value["name"], id: value["id"], date: "0000-00-00" }
                        ];

                        var result = kendo.render(template, data);

                        $("#fm_folders").append(result);
                    } else if (value["obj"] == "file") {
                        var templateContent = $("#fileTemplate").html();
                        var template = kendo.template(templateContent);
                        var type = value["type"];

                        var data = [
                            { name: value["name"], shortname: value["shortname"], id: value["id"], date: "0000-00-00", size: value["size"], pre_img: "0", ico: value["ico"], type: type, data: value["data"], ext: value["ext"] }
                        ];

                        var result = kendo.render(template, data);

                        $("#fm_files").append(result);

                        if (type == "image") {
                            var templateContent = $("#imageTemplate").html();
                            var template = kendo.template(templateContent);

                            var data = [
                                { name: value["name"], shortname: value["shortname"], id: value["id"], date: "0000-00-00", size: "0", pre_img: "0", ico: value["ico"], path: $("#storage").val() + "/get/?id=" + value["id"], type: type, ext: value["ext"] }
                            ];

                            var result = kendo.render(template, data);

                            $("#fm_images").append(result);
                        } else if (type == "video") {
                            var templateContent = $("#videoTemplate").html();
                            var template = kendo.template(templateContent);

                            var data = [
                                { name: value["name"], shortname: value["shortname"], id: value["id"], date: "0000-00-00", size: "0", pre_img: "0", ico: value["ico"], type: type, data: value["data"], ext: value["ext"] }
                            ];

                            var result = kendo.render(template, data);

                            $("#fm_video").append(result);
                        } else if (type == "audio") {
                            var templateContent = $("#musicTemplate").html();
                            var template = kendo.template(templateContent);

                            var data = [
                                { name: value["name"], shortname: value["shortname"], id: value["id"], date: "0000-00-00", size: "0", pre_img: "0", ico: value["ico"], type: type, data: value["data"], ext: value["ext"] }
                            ];

                            var result = kendo.render(template, data);

                            $("#fm_music").append(result);
                        }
                    } else if (value["obj"] == "type") {
                        $("#typeAll").html(value["all"]);
                        $("#typeImage").html(value["image"]);
                        $("#typeVideo").html(value["video"]);
                        $("#typeMusic").html(value["music"]);
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

    /**
     * Image FS
     */
    function loadImgFs() {
        var fs;

        $("#fm_images_structure").html("");
        $.ajax({ type: "GET", url: 'image/getFsImg/', dataType: "JSON" })
            .done(function(res) {
                $.each(res, function(key, value) {
                    var templateContent = $("#imageTemplate").html();
                    var template = kendo.template(templateContent);

                    var data = [
                        { name: value["name"], shortname: value["shortname"], id: value["id"], date: "0000-00-00", size: "0", pre_img: "0", ico: value["ico"], path: $("#storage").val() + "/get/?id=" + value["id"], type: value["type"], data: value["data"], ext: value["ext"] }
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
        $.ajax({ type: "GET", url: 'image/getAllTags/', dataType: "JSON" })
            .done(function(res) {
                $.each(res, function(key, value) {
                    $("#imageview #allTags").append("<span class='tagAll k-content'>" + value.tag + "</span> ");
                });

                $("#imageview #allCrops").html("");
                $.ajax({ type: "GET", url: 'image/getAllCrops/', dataType: "JSON" })
                    .done(function(res) {
                        $.each(res, function(key, value) {
                            $("#imageview #allCrops").append("<span class='cropAll k-content'>" + value.description + "</span> ");
                        });

                        $("#imageview").mCustomScrollbar({scrollInertia:150});
                    })
            });
    }

    $("#allTags").on("click", ".tagAll", function(){
        $.ajax({ type: "GET", url: 'image/selTag/', data: "tag=" + encodeURIComponent($(this).text()) })
            .done(function(res) {
                getTagsAndCrops();
                loadImgFs();
            })
    });

    $("#allCrops").on("click", ".cropAll", function(){
        $.ajax({ type: "GET", url: 'image/selCrop/', data: "crop=" + encodeURIComponent($(this).text()) })
            .done(function(res) {
                getTagsAndCrops();
                loadImgFs();
            })
    });
    // End Image Fs


    var fs = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: "fm/fs/",
                dataType: "json"
            }
        },
        schema: {}
    });

    $("#treeview").kendoTreeView({
        dataSource: fs,
        select: function(e) {
            var data = $('#treeview').data('kendoTreeView').dataItem(e.node);

            var splitter = $("#splitter").data("kendoSplitter");
            //splitter.ajaxRequest("#fs", "fm/chdir/", { id: data.id });
            chdir(data.id);
        },
        animation: {
            expand: {
                duration: 0,
                hide: false,
                show: false
            },
            collapse: {
                duration: 0,
                show: false
            }
        },
        expand: function(e) {
            var dataItem = this.dataItem(e.node);
            dataItem.loaded(false);
        },
        dataBound: function(){ treeviewScroll() }
    })

    $("#treeview").css("height", $(window).height() - 87);
    $(window).resize(function() {
        $("#treeview").css("height", $(window).height() - 87);
    });

    $("#splitter").on("click", ".fm_sel", function() {
        $(".fm_unsellabel").removeClass("fm_unsellabel").addClass("fm_sellabel").addClass("k-block").addClass("k-error-colored");
    });

    $("#splitter").on("click", ".fm_unsel", function() {
        $(".fm_sellabel").removeClass("fm_sellabel").addClass("fm_unsellabel").removeClass("k-block").removeClass("k-error-colored");
    });

    $("#fs").on("click", ".fm_unsellabel", function(){
        $(this).removeClass("fm_unsellabel").addClass("fm_sellabel").addClass("k-block").addClass("k-error-colored");
    });

    $("#fs").on("click", ".fm_sellabel", function(){
        $(this).removeClass("fm_sellabel").addClass("fm_unsellabel").removeClass("k-block").removeClass("k-error-colored");
    });

    $(".newDirWin").click(function(){
        createDirDialog();
    });

    $("#rmDir").click(function(){
        $("#rmDir-window").kendoWindow({
            width: "300px",
            height: "100px",
            modal: true,
            title: "Delete folder"
        });
        $("#rmDir-window").data("kendoWindow").center().open();
    });

    function createDirDialog() {
        var fname = prompt("Folder name:", "");
        if (fname != null) {

            var treeview = $("#treeview").data("kendoTreeView");
            var selectNode = treeview.select();

            if ($(selectNode).parent().find(".k-icon").length) {
                if ($(selectNode).parent().find(".k-minus").length) {
                    treeview.collapse(selectNode);
                }
            }

            var data = "name=" + fname;
            $.ajax({ type: "GET", url: "fm/create/", data: data })
                .done(function(res) {
                    treeview.dataItem(selectNode).load();

                    if ($(selectNode).parent().find(".k-icon").length) {
                        treeview.expand(selectNode);
                    }

                    // added folder to right div splitter
                    $("#fm_uploadDir").append(res);
                })
                .fail(function(res) { alert(res.responseText); })
        }

        return true;
    }

    $(".remove").click(function(){
        $("#rm-window").kendoWindow({
            width: "300px",
            height: "100px",
            modal: true,
            title: "Delete"
        });

        $("#rm-window").data("kendoWindow").center().open();
    });

    $("#rm-window-no").click(function(){
        $("#rm-window").data("kendoWindow").close();
    });

    $("#rm-window-yes").click(function(){
        $(".ddir > div").each(function() {
            if ($(this).hasClass("fm_sellabel")) {
                var fname = $(this).attr("id");

                removeDir(fname);
            }
        });

        $(".dfile > div").each(function() {
            if ($(this).hasClass("fm_sellabel")) {
                var fname = $(this).attr("id");

                removeFile(fname);
            }
        });

        $("#rm-window").data("kendoWindow").close();
    });


    /*
    $(".advanced-panel-div").click(function(){
        $(".adv-menu-div").hide();

        if ( ($(this).attr("class") == "advanced-panel-div k-content") ) {
            $(".advanced-panel-div").removeClass("k-content");

            $("#advanced-panel-left").removeClass("advanced-panel-show");

            splitter.size("#advanced-panel", "50px");
            $("#advanced-panel-left").width("0");
        } else {
            $(".advanced-panel-div").removeClass("k-content");

            if ($(this).attr("id") == "upload-show") {
                $("#adv-menu-upload").show();
            } else if ($(this).attr("id") == "buffer-show") {
                $("#adv-menu-buffer").show();
            } else if ($(this).attr("id") == "player-show") {
                $("#adv-menu-audio").show();
            } else if ($(this).attr("id") == "settings-show") {
                $("#adv-menu-settings").show();
            }

            $(this).addClass("k-content");

            $("#advanced-panel-left").addClass("advanced-panel-show");

            splitter.size("#advanced-panel", "240px");
            $("#advanced-panel-left").width("190px");
        }
    });
    */

    $("body").on("click", ".advanced-panel-show", function(){
        if ($("#advanced-panel-left").width() == "190") {
            var splitter = $("#splitter").data("kendoSplitter");
            splitter.size("#advanced-panel", "0px");
            $("#advanced-panel-left").width("0px");

            $(".adv-menu-div").hide();
        } else {
            var splitter = $("#splitter").data("kendoSplitter");
            splitter.size("#advanced-panel", "190px");
            $("#advanced-panel-left").width("190px");

            if ($(this).hasClass("upload")) {
                $("#adv-menu-upload").show();
            } else if ($(this).hasClass("buffer")) {
                $("#adv-menu-buffer").show();
            } else if ($(this).attr("id") == "playlist") {
                $("#adv-menu-audio").show();
            } else if ($(this).attr("id") == "settings") {
                $("#adv-menu-settings").show();
            }
        }
    });

    $("#fs").on("dblclick", ".ddir", function(){
        var splitter = $("#splitter").data("kendoSplitter");
        //splitter.ajaxRequest("#fs", "fm/chdir/", { id: $(this).attr("id") });
        chdir($(this).attr("id"));
    });

    $("#fs").on("dblclick", ".dfile", function(){
        var type = $(".type", this).val();

        var ext = $(this).attr("title");
        ext = ext.substring(ext.lastIndexOf('.')+1);

        if (type == "image") {
            $(this).image("init").image("loadImg");
        } else if (type == "audio") {
            $(".fs-track-current").removeClass("fs-track-current").removeClass("icon-pause").addClass("icon-play");
            $(".icon-play", this).addClass("fs-track-current");

            $(this).player("load").player("play");
        } else if (type == "video") {
            $(this).video("init");
        }
    });
});

/**
 * FILES.HTML
 */
$(".fs-type").css("height", $(window).height() - 65);
$(".structure").css("height", $(".fs-type").height() - 60);
$(".structure-img-fs").css("height", $(".fs-type").height() - 30);
$("#imageview").css("height", $(window).height() - 95);
$(window).resize(function() {
    $(".fs-type").css("height", $(window).height() - 65);
    $(".structure").css("height", $(".fs-type").height() - 60);
    $(".structure-img-fs").css("height", $(".fs-type").height() - 30);
    $("#imageview").css("height", $(window).height() - 95);
});

$(".structure").mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
$(".structure-img-fs").mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
$(".adv-menu-div").mCustomScrollbar({ scrollInertia:150 });
// Left
function treeviewScroll() {
    if (!$("#treeview").hasClass("mCustomScrollbar")) {
        $("#treeview").mCustomScrollbar({
            horizontalScroll:true,
            scrollInertia:150,
            advanced:{
                updateOnContentResize: true,
                autoExpandHorizontalScroll:true
            }
        });
    }
}

var data = [
    { text: "Name", value: "name" },
    { text: "Date", value: "date" },
    { text: "Size", value: "size" }
];

var sort = $(".files-adv-sort").kendoDropDownList({
    dataTextField: "text",
    dataValueField: "value",
    dataSource: data,
    index: 0,
    change: function(e) {
        $.ajax({ type: "POST", url: "view", data: "type=" + sort.data("kendoDropDownList").value() })
            .done(function(res) {
                var splitter = $("#splitter").data("kendoSplitter");
                splitter.ajaxRequest("#fs", "chdir", { id: $("#start_dir").val() });
            })
    }
});

/*
$(".files-actions").on("click", ".upload", function(){
    $(".adv-menu-div").hide();

    $(".advanced-panel-div").removeClass("k-content");
    $(".advanced-panel-div").removeClass("k-widget");

    $("#adv-menu-upload").show();

    $("#upload-show").addClass("k-content");
    $("#upload-show").addClass("k-widget");

    $("#advanced-panel-left").addClass("advanced-panel-show");

    var splitter = $("#splitter").data("kendoSplitter");
    splitter.size("#advanced-panel", "190px");
    $("#advanced-panel-left").width("190px");
});
*/

$(".files-actions").on("click", ".copy", function(){
    copyFiles();
});

$(".files-actions").on("click", ".past", function(){
    pastFiles();
});

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

$.ajax({ type: "GET", url: "fm/buffer/", dataType: "JSON" })
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

$(".fs-footer-menu").on("click",".view",function(){
    $.ajax({ type: "POST", url: "view", data: "type=" + $(this).attr("data-id") })
        .done(function(res) {
            var splitter = $("#splitter").data("kendoSplitter");
            splitter.ajaxRequest("#fs", "chdir", { id: $("#start_dir").val() });
        })
});

$(".fs-footer-menu").kendoMenu({direction: "top right"});

$("#fm-sort").on("click", ".sort", function(){
    $.ajax({ type: "POST", url: "sort", data: "type=" + $(this).attr("data-id"), dataType: "JSON" })
        .done(function() { location.reload(); })
});

$(".fm_total").html('{{ totalsize }}');

// select.html
var themes_data = [
    { text: "Black", value: "black" },
    { text: "Blueopal", value: "blueopal" },
    { text: "Bootstrap", value: "bootstrap" },
    { text: "Default", value: "default" },
    { text: "Highcontrast", value: "highcontrast" },
    { text: "Metroblack", value: "metroblack" },
    { text: "Metro", value: "metro" },
    { text: "Moonlight", value: "moonlight" },
    { text: "Silver", value: "silver" },
    { text: "Uniform", value: "uniform" }
];

var themes = $("#theme-selector").kendoDropDownList({
    dataTextField: "text",
    dataValueField: "value",
    dataSource: themes_data,
    index: 0,
    change: function(e) {
        $.ajax({ type: "GET", url: "app/theme/", data: "theme=" + themes.data("kendoDropDownList").value() })
            .done(function(res) {
                location.reload();
            })
    }
});
// END select.html

// Logout
$("#logout").click(function(){
    $.ajax({ type: "POST", url: "auth/logout/" })
        .done(function(res) {
            location.reload();
        })
})

