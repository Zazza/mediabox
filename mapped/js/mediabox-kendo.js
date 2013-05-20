/**
 * Set height
 */
$(".fs-type").css("height", $(window).height() - 65);
$(".structure").css("height", $(".fs-type").height() - 60);
$(".structure-img-fs").css("height", $(".fs-type").height() - 30);
$("#imageview").css("height", $(window).height() - 95);
$("#treeview").css("height", $(window).height() - 87);
/**
 * Set height if window resize
 */
$(window).resize(function() {
    $(".fs-type").css("height", $(window).height() - 65);
    $(".structure").css("height", $(".fs-type").height() - 60);
    $(".structure-img-fs").css("height", $(".fs-type").height() - 30);
    $("#imageview").css("height", $(window).height() - 95);
    $("#treeview").css("height", $(window).height() - 87);
});

/**
 * Scrollbars
 */
$(".structure").mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
$(".structure-img-fs").mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
$(".adv-menu-div").mCustomScrollbar({ scrollInertia:150 });

/**
 * App: kendo structure
 */
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
            $.ajax({type:"GET",url:baseUrl + "audio/volume/",data:"level="+e.value});
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
            var type = e.item.id.substring(4);
            $.ajax({type:"GET",url:baseUrl + "app/fsMenu/",data:"tab="+type});
            chdir($("#start_dir").val(), type);
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
            $.ajax({type:"GET",url:baseUrl + "app/fsMenuLeft/",data:"tab="+e.item.id});

            $(".fs-container-div").hide();

            if (e.item.id == "tab-left-images") {
                $("#fs_img").show();

                loadImgFs();
            } else if (e.item.id == "tab-left-fs") {
                $("#fs").show();

                //chdir($("#start_dir").val(), $("#fsMenu").val());
            }
        }
    });

    $("#splitter").kendoSplitter({
        orientation: "horizontal",
        panes: [
            { size: "200px", resizable: true, scrollable: true, min: "130px", max: "300px" },
            { resizable: true, scrollable: false },
            //{ size: "200px", resizable: false, scrollable: true, min: "130px", max: "300px" }
            { size: "0px", resizable: false, scrollable: false }
        ]
    });

    var fs = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: baseUrl + "fm/fs/",
                dataType: "json"
            }
        },
        schema: {}
    });

    $("#treeview").kendoTreeView({
        dataSource: fs,
        select: function(e) {
            var data = $('#treeview').data('kendoTreeView').dataItem(e.node);

            chdir(data.id, $("#fsMenu").val());
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
            $.ajax({ type: "GET", url: baseUrl + "fm/create/", data: data })
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
            }
        }
    });

    $("#fs").on("dblclick", ".ddir", function(){
        chdir($(this).attr("id"), $("#fsMenu").val());
    });

    $(".fs-container-div").on("dblclick", ".dfile", function(e){
        var type = $(this).attr("data-type");

        var ext = $(this).attr("title");
        ext = ext.substring(ext.lastIndexOf('.')+1);

        if (type == "image") {
            $(this).image("init").image("one").image("loadImg");
        } else if (type == "audio") {
            $(".fs-track-current").removeClass("fs-track-current").removeClass("icon-pause").addClass("icon-play");
            $(".icon-play", this).addClass("fs-track-current");

            $(this).player("load").player("play");
        } else if (type == "video") {
            $(this).video("init");
        } else if (type == "all") {
            //stop the browser from following
            e.preventDefault();
            window.location.href = $("#storage").val()+"/get/?id=" + $(this).attr("data-id");
        }
    });
});

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
        $.ajax({ type: "POST", url: baseUrl + "fm/view/", data: "type=" + sort.data("kendoDropDownList").value() })
            .done(function(res) {
//???
                var splitter = $("#splitter").data("kendoSplitter");
                splitter.ajaxRequest("#fs", "chdir", { id: $("#start_dir").val() });
            })
    }
});

$(".files-actions").on("click", ".copy", function(){
    copyFiles();
});

$(".files-actions").on("click", ".past", function(){
    pastFiles();
});

$(".fs-footer-menu").on("click",".view",function(){
    $.ajax({ type: "POST", url: "view", data: "type=" + $(this).attr("data-id") })
        .done(function(res) {
            var splitter = $("#splitter").data("kendoSplitter");
            splitter.ajaxRequest("#fs", "chdir", { id: $("#start_dir").val() });
        })
});

$(".fs-footer-menu").kendoMenu({direction: "top right"});

$("#fm-sort").on("click", ".sort", function(){
    $.ajax({ type: "POST", url: baseUrl + "fm/sort/", data: "type=" + $(this).attr("data-id"), dataType: "JSON" })
        .done(function() { location.reload(); })
});

// Logout
$("#logout").click(function(){
    $.ajax({ type: "POST", url: baseUrl + "auth/logout/" })
        .done(function(res) {
            location.reload();
        })
})

