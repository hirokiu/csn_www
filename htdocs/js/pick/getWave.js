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

let data_x,data_y,data_z;
let layout;
var g_acc = 9.8;
var diff_x_acc = 0;
var diff_y_acc = 0;
var diff_z_acc = 0;

// データを取得
function getData(filename){
    var tmp_sum = 0;
    var params;
    var device;
    var static_data;
        static_data = "/data/201_1647441346.735300.json";

    var url = location.href;
    idx = url.indexOf("?");
    if(idx != -1) {
        params = getParam();
        device = params["detect"].substring(0,3);
        static_data = "/data/" + device + "/" + params['detect'];
    }

    $('span#device_id').html(device);
    $('span#json_file').html('<a href="' + static_data + '" target="_blank">JSON形式</a>');
    $('span#csv_file').html('<a href="' + static_data.replace('json','csv') + '" target="_blank">CSV形式</a>');


    $.ajax({
        url: static_data,
        type: "GET",
        cache: false,
        dataType: "json",
        success: function(res){
            console.log(res);
            // 追加する分のデータを配列の頭から削除
            count = res.length - 1;
            node_graph.splice(0,count);

            // 差分を取得
            diff_x_acc = res["earthquake"]["EW_ave"];
            diff_y_acc = res["earthquake"]["NS_ave"];
            diff_z_acc = res["earthquake"]["UD_ave"];

//UNIXをJSTにする
            //UNIXタイムをタイムスタンプに変換
            var date = new Date(res["earthquake"]["time"][300] * 1000 );
            //日時にフォーマット化したものを出力
            $("span#result_time").html(unixdateformat(date));
            // ダウンロードファイルをセット


            // plotly で描画するためのデータを生成
            data_x = [
                {
                    x: res["earthquake"]["time"],
                    y: res["earthquake"]["NS"],
                    mode: 'lines',
                    type: 'scatter',
                    line: {
                        color: 'rgb(200, 0, 0)',
                        width: 1
                    }
                }
            ];

            data_y = [
                {
                    x: res["earthquake"]["time"],
                    y: res["earthquake"]["EW"],
                    mode: 'lines',
                    type: 'scatter',
                    line: {
                        color: 'rgb(0, 0, 200)',
                        width: 1
                    }
                }
            ];

            data_z = [
                {
                    //x: res["earthquake"]["time"],
                    x: [...Array(res["earthquake"]["time"].length).keys()],
                    y: res["earthquake"]["UD"],
                    mode: 'lines',
                    type: 'scatter',
                    line: {
                        color: 'rgb(0, 200, 0)',
                        width: 1
                    }
                },
                {
                    x: [800, 800], // 同じx座標を指定
                    y: [res["earthquake"]["UD"].reduce(arrayMax), res["earthquake"]["UD"].reduce(arrayMin)], // 最大値と最小値を指定
                    mode: 'lines',
                    type: 'scatter',
                    line: {
                        color: 'rgb(0, 0, 255)',
                        width: 1
                    }
                }
            ];

            // グラフのレイアウト設定
            layout = {
                dragmode: 'zoom',
                xaxis: {
                    autorange: true,
                    domain: [0, 1],
                    range: [0, res["earthquake"]["time"].length],
                    type: 'linear',
                  },
                yaxis: {
                    autorange: true,
                    //domain: [0, 1],
                    range: [-2, 2],
                    type: 'linear',
                  },
                autosize: true,
                height: 400,
                //width: 1200
                showlegend: false
            };

            // 設定
            // メニューバー(ModeBar)の設定
			var config = {
  				modeBarButtonsToAdd: [
					{
						name: 'pick P wave time',
						icon: Plotly.Icons.pencil,
						click: function(gd) {
        					var newColor = colors[Math.floor(3 * Math.random())]
        					Plotly.restyle(gd, 'line.color', newColor)
      					}
					},{
						name: 'pick S wave time',
						icon: Plotly.Icons.pencil,
						direction: 'up',
						click: function(gd) {alert('button1')
						}
					}
				],
  				modeBarButtonsToRemove: ['toggleSpikelines','hoverClosestGl2d','toggleHover'],
  				displayModeBar: true
			}

            // グラフの描画 
            Plotly.newPlot('result_x', data_x, layout);
            Plotly.newPlot('result_y', data_y, layout);
            Plotly.newPlot('result_z', data_z, layout, config);

            var plot_UD = document.getElementById('result_z');
            plot_UD.on('plotly_click', function(_data){
                var _index = _data['points'][0]['pointIndex']; // クリックした位置のインデックス
                console.log(_data['points'][0]);
                console.log(_index);
                console.log(_data['points'][0]['pointIndex']);
                console.log(_data['points'][0]['data']['x'][_index]);
                console.log(_data['points'][0]['x']);
                //alert('You clicked this Plotly chart!');
                let update_data_z = {
                        x: [[_index, _index]],
                        line: {
                            color: 'rgb(255, 0, 0)',
                            width: 2
                        }
                    };
                let update_layout = [];
                //data_z[1].x = [_index, _index];
                //data_z.line.width = 1;
                Plotly.restyle('result_z', update_data_z, [1]);
            });
        },
        error: function(xhr, textStatus, errorThrown){
            //alert('Error');
        }
    });


}


// 初期データ
$(function(){
    getData();
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
    values["detect"] = paramsArray["detect"];
    if(values["detect"] == null){
        values["detect"] = "";
    }
    return values;
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

const arrayMax = function (a, b) {return Math.max(a, b);}
const arrayMin = function (a, b) {return Math.min(a, b);}
