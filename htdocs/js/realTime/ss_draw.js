// グラフ描画領域の初期設定
var w = 800;
var h = 200;

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


// 再描画処理
function draw(data) {
    var yMax = 0.01;
    var yMin = -1 * yMax;
    var yLen = yMax - yMin;

    // 描画データ用の設定
    var displayNum = data.length - 1; // 表示日数
    var dayWidth = (w - (xAxisPadding * 2) - (padding * 3) ) / displayNum; // 1日分の横幅

// 軸
    // X軸の設定
    var xScale = d3.time.scale()
	    .range([padding, w - xAxisPadding - padding - yAxisPadding]);

    var xAxis = d3.svg.axis()
	    .scale(xScale)
	    .ticks(20);

    // Y軸の設定
    var yScale = d3.scale.linear()
	    .domain([yMax, yMin])
	    .range([padding, h - yAxisPadding - padding]);

    var yAxis = d3.svg.axis()
	    .scale(yScale)
	    .orient("left");

    var yAxisLeft = d3.svg.axis().scale(yScale) 
	    .orient("left");
    var yAxisRight = d3.svg.axis().scale(yScale) 
	    .orient("right");

/*
 * X方向の加速度表示
 */
    // 設定したXY軸を表示
    svgX.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + xAxisPadding + ", " + (h - yAxisPadding) / 2 + ")")
	    .call(xAxis)
	    .selectAll("text")
	    .attr("x", 10)
	    .attr("y", -5)
	    .attr("transform", "rotate(30)")
	    .style("text-anchor", "start");

    svgX.append("g")
	    .attr("class", "yLeftAxis")
	    .attr("transform", "translate(" + xAxisPadding + ", 0)")
	    .call(yAxisLeft)
                        .append("text")
                        .text("振幅（cm/s/s）")
                        .attr("transform", "rotate(90, " + xAxisPadding + ", 0)")
                        .attr("x", 50)
                        .attr("y", 30);
    svgX.append("g")
	    .attr("class", "yRightAxis")
	    .attr("transform", "translate(" + (w - yAxisPadding) + ", 0)")
	    .call(yAxisRight)
                        .append("text")
                        .text("振幅（cm/s/s）")
                        .attr("transform", "rotate(90, " + -xAxisPadding + ", 0)")
                        .attr("x", -20)
                        .attr("y", -20);

/*
 * Y方向の加速度表示
 */
    // 設定したXY軸を表示
    svgY.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + xAxisPadding + ", " + (h - yAxisPadding) / 2 + ")")
	    .call(xAxis)
	    .selectAll("text")
	    .attr("x", 10)
	    .attr("y", -5)
	    .attr("transform", "rotate(30)")
	    .style("text-anchor", "start");

    svgY.append("g")
	    .attr("class", "yLeftAxis")
	    .attr("transform", "translate(" + xAxisPadding + ", 0)")
	    .call(yAxisLeft)
                        .append("text")
                        .text("振幅（cm/s/s）")
                        .attr("transform", "rotate(90, " + xAxisPadding + ", 0)")
                        .attr("x", 50)
                        .attr("y", 30);
    svgY.append("g")
	    .attr("class", "yRightAxis")
	    .attr("transform", "translate(" + (w - yAxisPadding) + ", 0)")
	    .call(yAxisRight)
                        .append("text")
                        .text("振幅（cm/s/s）")
                        .attr("transform", "rotate(90, " + -xAxisPadding + ", 0)")
                        .attr("x", -20)
                        .attr("y", -20);

/*
 * Z方向の加速度表示
 */
    // 設定したXY軸を表示
    svgZ.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + xAxisPadding + ", " + (h - yAxisPadding) / 2 + ")")
	    .call(xAxis)
	    .selectAll("text")
	    .attr("x", 10)
	    .attr("y", -5)
	    .attr("transform", "rotate(30)")
	    .style("text-anchor", "start");

    svgZ.append("g")
	    .attr("class", "yLeftAxis")
	    .attr("transform", "translate(" + xAxisPadding + ", 0)")
	    .call(yAxisLeft)
                        .append("text")
                        .text("振幅（cm/s/s）")
                        .attr("transform", "rotate(90, " + xAxisPadding + ", 0)")
                        .attr("x", 50)
                        .attr("y", 30);
    svgZ.append("g")
	    .attr("class", "yRightAxis")
	    .attr("transform", "translate(" + (w - yAxisPadding) + ", 0)")
	    .call(yAxisRight)
                        .append("text")
                        .text("振幅（cm/s/s）")
                        .attr("transform", "rotate(90, " + -xAxisPadding + ", 0)")
                        .attr("x", -20)
                        .attr("y", -20);

/*
 * X方向の折れ線グラフ
 */
    lineX = d3.svg.line()
	    .x(function(d, i){
		    return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .y(function(d){
		    return (h - yAxisPadding) / 2 - ((h - yAxisPadding - padding) / yLen * d[1]);
	    });

svgX.append("path")
	.attr("class", "speed")
	.attr("d", lineX(data))
	.attr("stroke", "#ed5454")
	.attr("fill", "none");

/*
 * Y方向の折れ線グラフ
 */
    lineY = d3.svg.line()
	    .x(function(d, i){
		    return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .y(function(d){
		    return (h - yAxisPadding) / 2 - ((h - yAxisPadding - padding) / yLen * d[2]);
	    });
svgY.append("path")
	.attr("class", "speed")
	.attr("d", lineY(data))
	.attr("stroke", "#3874e3")
	.attr("fill", "none");

/*
 * Z方向の折れ線グラフ
 */
    lineZ = d3.svg.line()
	    .x(function(d, i){
		    return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .y(function(d){
		    return (h - yAxisPadding) / 2 - ((h - yAxisPadding - padding) / yLen * d[3]);
	    });
svgZ.append("path")
	.attr("class", "speed")
	.attr("d", lineZ(data))
	.attr("stroke", "#6ce26c")
	.attr("fill", "none");

}

// 再描画用関数
function reDraw(data) {
    var yMax = 0.01;
    var yMin = -1 * yMax;
    var yLen = yMax - yMin;

    // 描画データ用の設定
    var displayNum = data.length - 1; // 表示日数
    var dayWidth = (w - (xAxisPadding * 2) - (padding * 3) ) / displayNum; // 1日分の横幅

/*
 * X方向の折れ線グラフ
 */
    lineX = d3.svg.line()
	    .x(function(d, i){
		    return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .y(function(d){
		    return (h - yAxisPadding) / 2 - ((h - yAxisPadding - padding) / yLen * d[1]);
	    });
    svgX.selectAll(".speed")
        //.transition()
        //.duration(500)
        .attr("d", lineX(data));

/*
 * Y方向の折れ線グラフ
 */
    lineY = d3.svg.line()
	    .x(function(d, i){
		    return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .y(function(d){
		    return (h - yAxisPadding) / 2 - ((h - yAxisPadding - padding) / yLen * d[2]);
	    });
    svgY.selectAll(".speed")
        //.transition()
        //.duration(500)
        .attr("d", lineY(data));

/*
 * Z方向の折れ線グラフ
 */
    lineZ = d3.svg.line()
	    .x(function(d, i){
		    return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .y(function(d){
		    return (h - yAxisPadding) / 2 - ((h - yAxisPadding - padding) / yLen * d[3]);
	    });
    svgZ.selectAll(".speed")
        //.transition()
        //.duration(500)
        .attr("d", lineZ(data));


}
