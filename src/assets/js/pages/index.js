define(['jquery','echart', 'juicer'], function ($, echarts, juicer) {
	// 这是一个CMD模块例子，可以按此规范进行CMD模块编写

	$('h1').css('color', 'green');
	var myChart = echarts.init(document.getElementById('main'));

	// var url = '/v0/usermanagement/login',
	// 	param = {"userName":"867117888", "password":"123456"};
	// $.ajax({
	// 	url: url,
	// 	type: 'POST',
	// 	dataType: 'json',
	// 	contentType : 'application/json',
	// 	data: JSON.stringify(param),
	// 	success: function(data) {
	// 		console.log('请求成功: ', data);
	// 	},
	// 	error: function() {
	// 		console.log('请求错误！');
	// 	}
	// });
});