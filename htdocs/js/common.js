// グラフ描画領域の初期設定
var w = 800;
var h = 450;

var padding = 10; // グラフの余白
var xAxisPadding = 40; // x軸表示余白
var yAxisPadding = 50; // y軸表示余白

// 描画用変数
var lineX,lineY,lineZ;


// SVG作成
var svgX = d3.select("#result_x")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

var tooltipX = d3.select("#result_x")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

var svgY = d3.select("#result_y")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

var tooltipY = d3.select("#result_y")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

var svgZ = d3.select("#result_z")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

var tooltipZ = d3.select("#result_z")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

