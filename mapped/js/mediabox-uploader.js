$(document).ready(function() {

    $("#files").kendoUpload({
        showFileList: false,
        select: function(e) {
            var files = e.files;

            $.each(files, function(key, file) {
                upload(file);
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
            fd.append('name', file.name);
            xhr.send(fd);
        }

        // if remote save success
        return true;
    }

    function addThumb(file, res) {
        window.loadImage(
            file.rawFile,
            function (img) {
                $.ajax({ type: "POST", url: 'thumb/' + res.id + '/', data: img.toDataURL().replace(/data:image\/png;base64,/, '') })
                    .done(function(){ addFileToFS(res); })
            },
            {
                maxHeight: 80,
                canvas: true
            }
        )
    }

    function upload(file) {
        var type;
        var file;

        $.ajax({ type: "GET", url: 'fm/upload/', dataType: "JSON", data: "file=" + file.name + "&size=" + file.size + "&extension=" + file.extension.substr(1)})
            .done(function(res) {
                if (res.type == "image")
                    addThumb(file, res);

                //sendFile(res.id, file.rawFile);
                if (!sendFile(res.id, file.rawFile)) {
                    //removeFile(file.name);
                } else {
                    if (res.type != "image") {
                        addFileToFS(res);
                    }
                }
            });
    }

    $("#perc").on("click", ".uploaderRemove", function(){
        removeFileByName($(this).attr("data-name"));
    })
})