var node_line = [];
var flightPath = null;

var maxid = 0;
var offset = 0;
var count = 10;
var max_length = 300;
var diff_nums = 0; // グラフの未表示部分
var node_graph = []; // グラフデータの配列
var endFlag = false;
var device = 1;

var g_acc = 9.8;
var diff_x_acc = 0;
var diff_y_acc = 0;
var diff_z_acc = 0;

// データを取得
function getData(filename){
    var tmp_sum = 0;
    var params;
    var device;
    var station_json;
        station_json = "/data/station_list.json";

    var url = location.href;
    idx = url.indexOf("?");
    if(idx != -1) {
        params = getParam();
        station_id = params["station_id"];
        station_json = "/data/" + station_id + "/waveform_list_" + station_id + ".json";
    }

    let h1List = document.getElementsByTagName('h1');
    let h2List = document.getElementsByTagName('h2');
    let list = document.getElementById('station_list');

    $.ajax({
        url: station_json,
        type: "GET",
        cache: false,
        dataType: "json",
        success: function(res){
            // DEBUG
            console.log(res);
            if ( res.hasOwnProperty("csn_station") ) {
                // 観測点リストを取得
                let station_list = res["csn_station"];

                Object.keys(station_list).forEach(function(station_name){ 
                    //ref = '<a href="/station/detail/' + station_list[station_name]["station_id"] + '">' + station_name + '</a>';
                    ref = '<a href="/station/?station_id=' + station_list[station_name]["station_id"] + '">' + station_name + '</a>';
                    let li = document.createElement('li');
                    li.innerHTML = ref;
                    list.appendChild(li);
                });

            } else if ( res.hasOwnProperty("waveforms") ) {
                waveform_data = res['waveforms'];
                h1List[0].innerText = "CSN::観測点::" + waveform_data['station_name'];
                h2List[0].innerText = "観測された波形";

                Object.keys(waveform_data['waveform']).forEach(function(waveform){
                    console.log(waveform_data['waveform'][waveform]);
                    ref = '<a href="/static/?detect=' + waveform_data['waveform'][waveform]['json_filename'] + '">' + waveform_data['waveform'][waveform]['detect_date'] + '</a>';
                    let li = document.createElement('li');
                    li.innerHTML = ref;
                    list.appendChild(li);
                });
            }

        },
        error: function(xhr, textStatus, errorThrown){
            //alert('Error');
        }
    });

}


// 初期データ
$(function(){
    let station_json = "/data/station_list.json";
    getData(station_json);
});

function getParam() {
    var url   = location.href;
    parameters    = url.split("?");
    params   = parameters[1].split("&");
    var paramsArray = [];
    for ( i = 0; i < params.length; i++ ) {
        neet = params[i].split("=");
        paramsArray.push(neet[0]);
        paramsArray[neet[0]] = neet[1];
    }
    var values = [];
    values["device"] = paramsArray["device"];
    if(values["device"] == null){
        values["device"] = 1;
    }
    values["datetime"] = paramsArray["datetime"];
    if(values["datetime"] == null){
        values["datetime"] = "20150513";
    }
    //return values;
    return paramsArray;
}

//タイムスタンプを指定の日時にフォーマット化
function unixdateformat(str){
    var objDate = new Date(str);
    var nowDate = new Date();

    //現在時間との差
    myHour = Math.floor((nowDate.getTime()-objDate.getTime()) / (1000*60*60)) + 1;

    var year = objDate.getFullYear();
    var month = objDate.getMonth() + 1;
    var date = objDate.getDate();
    var hours = objDate.getHours();
    var minutes = objDate.getMinutes();
    var seconds = objDate.getSeconds();

    if ( hours < 10 ) { hours = "0" + hours; }
    if ( minutes < 10 ) { minutes = "0" + minutes; }
    if ( seconds < 10 ) { seconds = "0" + seconds; }

    str = year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    var rtnValue = str;

    return rtnValue;

}
