//Arrayのプロトタイプにshuffle()メソッドを追加
//シャッフルされた配列を返す
Array.prototype.shuffle = function () {
    var i = this.length;
    while (i) {
        var j = Math.floor(Math.random() * i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}

// invalid enter key
//フォーム送信を防止
function invalid_enter() {
    if (window.event.keyCode == 13) {
        return false;
    }
}

// start experiment
function start_experiment() {
    // get user name
    var name = document.getElementById("name").value.replace(" ", "_");
    if (name == "") {
        alert("Please enter your name.");
        return false;
    }

    // get setlist number
    var set_num = "0"
    var number = document.getElementsByName("set");
    for (var i = 0; i < number.length; i++) {
        if (number[i].checked) {
            set_num = number[i].value;
        }
    }

    if (set_num == "0") {
        alert("Please press the setlist number button.");
        return false;
    }

    // convert display
    Display();

    /*
        you have to customize this part
    */
    var method_list_path = [];
    // the first one is the reference method
    //data pathのリストのpathを格納
    method_list_path.push(wav_dir + "set" + set_num + "/mix_anchors.list");
    method_list_path.push(wav_dir + "set" + set_num + "/drums_anchors.list");
    method_list_path.push(wav_dir + "set" + set_num + "/bass_anchors.list");
    method_list_path.push(wav_dir + "set" + set_num + "/piano_anchors.list");
    method_list_path.push(wav_dir + "set" + set_num + "/guitar_anchors.list");
    // the following ones are methods you want to compare
    // positive
    method_list_path.push(wav_dir + "set" + set_num + "/mix_positive.list");
    method_list_path.push(wav_dir + "set" + set_num + "/drums_positive.list");
    method_list_path.push(wav_dir + "set" + set_num + "/bass_positive.list");
    method_list_path.push(wav_dir + "set" + set_num + "/piano_positive.list");
    method_list_path.push(wav_dir + "set" + set_num + "/guitar_positive.list");
    //negative
    method_list_path.push(wav_dir + "set" + set_num + "/mix_negatives.list");
    method_list_path.push(wav_dir + "set" + set_num + "/drums_negatives.list");
    method_list_path.push(wav_dir + "set" + set_num + "/bass_negatives.list");
    method_list_path.push(wav_dir + "set" + set_num + "/piano_negatives.list");
    method_list_path.push(wav_dir + "set" + set_num + "/guitar_negatives.list");
    /*
        end
    */

    file_list = makeFileList(method_list_path);
    outfile = "inst_simi_" + name + "_set" + set_num + ".csv";
    scores = (new Array(file_list.length)).fill(0);
    eval = document.getElementsByName("eval");
    init();

}

// convert display
function Display() {
    document.getElementById("Display1").style.display = "none";
    document.getElementById("Display2").style.display = "block";
}

// load text file
//ファイル名受け取り->中身を読み込んで改行文字で分割=>popで末尾消して配列に格納して返す
function loadText(filename) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename, false);
    xhr.send(null);
    var list = xhr.responseText.split(/\r\n|\r|\n/);
    list.pop();

    return list;
}

// make file list
//methodに全wavファイル名を格納->pairsにそれらをトリプレットにして入れ直す
function makeFileList(method_list_path) {
    // prepare file list of all methods
    var method = Array();
    for (var i = 0; i < method_list_path.length; i++) {
        // method[0] is the reference method
        // method[1]~ are the methods you compare
        method.push(loadText(method_list_path[i]));
    }

    var files = Array();
    for (var i = 0; i < method[0].length; i++) {
        // TODO: automate here
        /*
            you have to customize this part
            if you don't want to compare 3 methods
            you need to rewrite 'pairs'.
            'pairs' consists of n_P_2 triplets, where
            'n' is num of methods you want to compare.
        */
        if (i % 2 == 0) {
            pairs = [
                [method[0][i], method[5][i], method[10][i]],
                [method[1][i], method[6][i], method[11][i]],
                [method[2][i], method[7][i], method[12][i]],
                [method[3][i], method[8][i], method[13][i]],
                [method[4][i], method[9][i], method[14][i]],
            ]
        }
        else {
            pairs = [
                [method[0][i], method[10][i], method[5][i]],
                [method[1][i], method[11][i], method[6][i]],
                [method[2][i], method[12][i], method[7][i]],
                [method[3][i], method[13][i], method[8][i]],
                [method[4][i], method[14][i], method[9][i]],
            ]
        }


        /*
            end
        */

        for (var j = 0; j < pairs.length; j++) {
            files.push(pairs[j]);
        }
    }
    files.shuffle();
    return files;
}

function setAudio() {
    document.getElementById("page").textContent = "" + (n + 1) + "/" + scores.length;

    document.getElementById("audio_x").innerHTML = 'SoundX:<br>'
        + '<audio src="' + file_list[n][0]
        + '" controls preload="auto">'
        + '</audio>';

    document.getElementById("audio_a").innerHTML = 'SoundA:<br>'
        + '<audio src="' + file_list[n][1]
        + '" controls preload="auto">'
        + '</audio>';

    document.getElementById("audio_b").innerHTML = 'SoundB:<br>'
        + '<audio src="' + file_list[n][2]
        + '" controls preload="auto">'
        + '</audio>';
}

function init() {
    n = 0;
    setAudio();
    evalCheck();
    setButton();
}

function evalCheck() {
    const c = scores[n];
    if ((c <= 0) || (c > eval.length)) {
        for (var i = 0; i < eval.length; i++) {
            eval[i].checked = false;
        }
    }
    else {
        eval[c - 1].checked = true;
    }
}

function setButton() {
    if (n == (scores.length - 1)) {
        document.getElementById("prev").disabled = false;
        document.getElementById("next2").disabled = true;
        document.getElementById("finish").disabled = true;
        for (var i = 0; i < eval.length; i++) {
            if (eval[i].checked) {
                document.getElementById("finish").disabled = false;
                break;
            }
        }
    }
    else {
        if (n == 0) {
            document.getElementById("prev").disabled = true;
        }
        else {
            document.getElementById("prev").disabled = false;
        }
        document.getElementById("next2").disabled = true;
        document.getElementById("finish").disabled = true;
        for (var i = 0; i < eval.length; i++) {
            if (eval[i].checked) {
                document.getElementById("next2").disabled = false;
                break;
            }
        }
    }
}

function evaluation() {
    for (var i = 0; i < eval.length; i++) {
        if (eval[i].checked) {
            scores[n] = i + 1;
        }
    }
    setButton();
}

function exportCSV() {
    var ans = [];
    var ans_AB = [];
    for (var i = 0; i < file_list.length; i++) {
        if (scores[i] == 1) {
            ans[i] = "A+"
            ans_AB[i] = "A"
        }
        else if (scores[i] == 2) {
            ans[i] = "A-"
            ans_AB[i] = "A"
        }
        else if (scores[i] == 3) {
            ans[i] = "B+"
            ans_AB[i] = "B"
        }
        else if (scores[i] == 4) {
            ans[i] = "B-"
            ans_AB[i] = "B"
        }
    }

    var csvData = "";
    csvData += "" + "anchor" + "A" + "," + "B" + "," + "score" + "," + "ans" + "\r\n";
    for (var i = 0; i < file_list.length; i++) {
        csvData += "" + file_list[i][0] + "," + file_list[i][1] + ","
            + file_list[i][2] + ","
            + scores[i] + ","
            + ans[i] + ","
            + ans_AB[i] + "\r\n";
    }

    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display:none";
    const blob = new Blob([csvData], { type: "octet/stream" });
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = outfile;
    link.click();
    window.URL.revokeObjectURL(url);
    link.parentNode.removeChild(link);
}

function next() {
    n++;
    setAudio();
    evalCheck();
    setButton();
}

function prev() {
    n--;
    setAudio();
    evalCheck();
    setButton();
}

function finish() {
    exportCSV();
}


// directory name
const wav_dir = "wav/";

// invalid enter key
document.onkeypress = invalid_enter();

// global variables
var outfile;
var file_list;
var scores;

// since loadText() doesn't work in local
var n = 0;
var eval = document.getElementsByName("eval");