onmessage = function (event) {
	const getData = event.data;
	console.log("worker script!: ", getData);
	postMessage("Worker done!");
}