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
//$(".structure").mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
//$(".structure-img-fs").mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
//$("#pl-audio").parent().mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
//$("#buffer").parent().mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });
//$("#perc").parent().mCustomScrollbar({ advanced:{ updateOnContentResize: true }, scrollInertia:150 });

/**
 * App: kendo structure
 */
$(document).ready(function() {
    $("#pageLoading").hide();

    $("#menu").kendoMenu();

    $("#fileRes").kendoWindow({title: "URL:", resizable: false });

    $("#main-menu").kendoMenu({
        closeOnClick: false
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
            $.ajax({type:"GET",url:baseUrl + "app/fsMenu/",data:"tab="+type,cache: false})
                .done(function(){
                    chdir($("#start_dir").val());
                });
            if (type=="audio") {
                if ($('#adv-menu-audio').is(':hidden')) {
                    openAdvanced($("#playlist"));
                }
            }
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
            $.ajax({type:"GET",url:baseUrl + "app/fsMenuLeft/",data:"tab="+e.item.id,cache: false});

            $(".fs-container-div").hide();

            if (e.item.id == "tab-left-images") {
                $("#fs_img").show();

                loadImgFs();
            } else if (e.item.id == "tab-left-fs") {
                $("#fs").show();
            }
        }
    });

    $("#splitter").kendoSplitter({
        orientation: "horizontal",
        panes: [
            { size: "200px", resizable: true, scrollable: true, min: "130px", max: "300px" },
            { resizable: true, scrollable: false }
            //{ size: "200px", resizable: false, scrollable: true, min: "130px", max: "300px" }
            //{ size: "0px", resizable: false, scrollable: false }
        ]
    });

    var fs = new kendo.data.HierarchicalDataSource({
        transport: {
            read: {
                url: baseUrl + "fm/fs/" + "?noCache=" + (new Date().getTime()) + Math.random(),
                dataType: "json"
            }
        },
        schema: {}
    });

    $("#treeview").kendoTreeView({
        dataSource: fs,
        select: function(e) {
            var data = $('#treeview').data('kendoTreeView').dataItem(e.node);

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
        }
        //dataBound: function(){ treeviewScroll() }
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
                var fname = $(this).parent().attr("data-id");

                removeDir(fname);
            }
        });

        $(".dfile > div").each(function() {
            if ($(this).hasClass("fm_sellabel")) {
                var fname = $(this).parent().attr("data-id");

                removeFile(fname);
            }
        });

        $("#rm-window").data("kendoWindow").close();
    });


    /**
     * Advanced
     */
    $("body").on("click", ".advanced-panel-show", function(){
       openAdvanced(this);
    });

    $("#closeAdvanced").click(function(){
        closeAdvanced();
    });

    function openAdvanced (obj) {
        if ($('.adv-menu-div').is(':hidden')) {
            //var splitter = $("#splitter").data("kendoSplitter");
            //splitter.size("#advanced-panel", "230px");
            $("#splitter").width($(window).width()-230);
            $("#vertical").width($(window).width()-230-$("#left-vertical").width());
            $("#advanced-panel-left").width("230px");
        }

        toggleAdvanced(obj);
    }

    function toggleAdvanced(obj) {
        if ($(obj).hasClass("upload")) {
            if ($('#adv-menu-upload').is(':hidden')) {
                $(".adv-menu-div").hide();
            }
            $('#adv-menu-upload').toggle();

            if ($('#adv-menu-upload').is(':hidden')) {
                closeAdvanced();
            }
        } else if ($(obj).hasClass("buffer")) {
            if ($('#adv-menu-buffer').is(':hidden')) {
                $(".adv-menu-div").hide();
            }
            $('#adv-menu-buffer').toggle();

            if ($('#adv-menu-buffer').is(':hidden')) {
                closeAdvanced();
            }
        } else if ($(obj).attr("id") == "playlist") {
            if ($('#adv-menu-audio').is(':hidden')) {
                $(".adv-menu-div").hide();
            }
            $('#adv-menu-audio').toggle();

            if ($('#adv-menu-audio').is(':hidden')) {
                closeAdvanced();
            }
        }
    }

    function closeAdvanced() {
        //var splitter = $("#splitter").data("kendoSplitter");
        //splitter.size("#advanced-panel", "0");
        $("#splitter").width($(window).width());
        $("#vertical").width($(window).width()-$("#left-vertical").width());
        $("#advanced-panel-left").width(0);

        $(".adv-menu-div").hide();
    }
    /**
     * END Advanced
     */

    $("#fs").on("dblclick", ".ddir", function(){
        chdir($(this).attr("data-id"));
    });

    $(".fs-container-div").on("dblclick", ".dfile", function(e){
        openFile(this);
    });

    /**
     * Context Menu
     */
    $.contextMenu( {
        selector: ".dfile",
        className: 'k-content',
        items: {
            open: {name: "Open", callback: function(key, opt){
                openFile(this);
            }}, //className: 'icon-cursor',
            download: {name: "Download", callback: function(key, opt){
                window.location.href = $("#storage").val()+"/get/?id=" + $(this).attr("data-id");
            }} //className: 'icon-download-alt',
        }
    });

});

// Left

/*
function treeviewScroll() {
    if (!$("#treeview").hasClass("mCustomScrollbar")) {
        $("#treeview").mCustomScrollbar({
            //horizontalScroll:true,
            scrollInertia:150,
            advanced:{
                updateOnContentResize: true,
                autoExpandHorizontalScroll:true
            }
        });
    }
}
*/

$(".files-actions").on("click", ".copy", function(){
    copyFiles();
});

$(".files-actions").on("click", ".past", function(){
    pastFiles();
});

$(".files-actions").on("click", ".toPlaylist", function(){
    $(".dfile").each(function() {
        $("#pl-audio").append("<div class='track' data-ext='"+$(this).attr("data-ext")+"' data-id='" + $(this).attr("data-id") + "' title='"+$(this).attr("title")+"'><div class='track-title'>" + $(this).attr("title") + "</div><div class='track-duration'></div></div>");
    });
    //$("#pl-audio .track:odd").addClass("k-alt");
});

$(".fs-footer-menu").kendoMenu({direction: "top right"});

$(".fs-footer-menu").on("click",".sort_by_name",function(){
    $.ajax({ type: "GET", url: baseUrl + "fm/sort/", data: "type=name" })
        .done(function() { chdir($("#start_dir").val()); })
});

$(".fs-footer-menu").on("click",".sort_by_size",function(){
    $.ajax({ type: "GET", url: baseUrl + "fm/sort/", data: "type=size" })
        .done(function() { chdir($("#start_dir").val()); })
});

$(".fs-footer-menu").on("click",".sort_by_date",function(){
    $.ajax({ type: "GET", url: baseUrl + "fm/sort/", data: "type=date" })
        .done(function() { chdir($("#start_dir").val()); })
});

$("#player-footer").kendoMenu({direction: "top right"});

$("#left-footer").kendoMenu({direction: "top right"});
