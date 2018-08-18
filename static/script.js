let currentScreenName = '';

let model;
tf.loadModel('model/model.json').then(loadedModel => {
    model = loadedModel;
});

$("#selectedFile").on("change", function (e) {
    var file = e.target.files[0];
    if (file.type.indexOf("image") < 0) {
        showAlert("画像ファイルを選択してください。");
        return;
    }

    setPreviewImage(file);
    currentScreenName = '';
});

$("#searchButton").click(function (e) {
    var screenName = $("#screenNameText").val();
    $.ajax({
        type: "GET",
        url: "api/get_icon_url/" + screenName,
        dataType: "json"
    }).done(function (data, textStatus, jqXHR) {
        if (!data.success) {
            showAlert("アイコンが取得できませんでした。");
            gtag('event', 'get_icon_url', {'event_label': 'failure'});
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", data.url, true);
        xhr.responseType = "blob";
        xhr.onload = function (oEvent) {
            setPreviewImage(xhr.response);
            currentScreenName = screenName;

            gtag('event', 'get_icon_url', {'event_label': 'success'});
        };
        xhr.send();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        showAlert("アイコンが取得できませんでした。");
        gtag('event', 'get_icon_url', {'event_label': 'failure'});
    });
});

$("#classifyButton").click(function (e) {
    const img = getImage();

    let score;
    try {
        score = predict(img);
    } catch (e) {
        showAlert("診断できませんでした。");
        gtag('event', 'classify', {'event_label': 'failure'})
        return;
    }

    showResult(score);
    gtag('event', 'classify', {'event_label': 'success'});
});

function setPreviewImage(bytes) {
    var reader = new FileReader();
    reader.onload = function () {
        imageDate = reader.result;
        
        var prev = $("#imagePreview");
        prev.empty();
        prev.append($("<img>").attr({
            src: imageDate,
            class: "img-fluid"
        }));
        
        $("#classifyContainer").show();
        $("#alert").hide();
    };
    reader.readAsDataURL(bytes);
}

function getImage() {
    const inputImageWidth = 224, inputImageHeight = 224;

    const context = document.createElement("canvas").getContext("2d");
    const imgElement = $("#imagePreview").children("img")[0];
    context.drawImage(imgElement, 0, 0, inputImageWidth, inputImageHeight);
    
    const img = context.getImageData(0, 0, inputImageWidth, inputImageHeight);
    return img;
}

function predict(img) {
    let inputTensor = tf.fromPixels(img, 3);
    inputTensor = tf.cast(inputTensor, 'float32').div(tf.scalar(255));
    inputTensor = inputTensor.expandDims();

    const scores = model.predict(inputTensor).dataSync();
    return scores[0];
}

function showResult(score) {
    var resultText = (score * 100.0).toFixed(2) + "%";
    $("#result").text(resultText);
    
    var description = getLevel(score) + "です。";
    if (currentScreenName.length > 0) {
        description = "@" + currentScreenName + "さんは" + description;
    }
    $("#resultDescription").text(description);

    $("#tweetButton").attr("href", getShareUrl(resultText, description));

    $("#classifyContainer").hide();
    $("#menuContainer").hide();
    $("#resultContainer").fadeIn(1000, function () {
        $("#reloadButton").fadeIn(1000);
    });
}

function getLevel(score) {
    if (score < 0.1) {
        return "疑いようのない陰キャ";
    } else if (score < 0.2) {
        return "陰キャ";
    } else if (score < 0.4) {
        return "やや陰キャ";
    } else if (score < 0.6) {
        return "どっちつかずのキャラ";
    } else if (score < 0.8) {
        return "ちょい陽キャ";
    } else if (score < 0.9) {
        return "陽キャ";
    } else {
        return "めっちゃ陽キャ(ｳｪｲｳｪｲ↑";
    }
}

function getShareUrl(result, description) {
    var encodedText = encodeURI(description + "陽キャ度: " + result + " | 機械学習でTwitterアイコンを陽キャ・陰キャ診断");
    return "https://twitter.com/intent/tweet?text=" + encodedText + "&url=https://twitter-icon-classifier.andooown.com/&hashtags=陽キャ陰キャ診断";
}

function showAlert(caption) {
    $("#alertCaption").text(caption);
    $("#alert").show();
}
