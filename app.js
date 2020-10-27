const express = require("express");
const app = express();
const fs = require("fs");

const option = {
	key: fs.readFileSync("key.pem", "utf8"),
	cert: fs.readFileSync("cert.pem", "utf8"),
	passphrase: "didakf33",
};

const http = require("https").createServer(option, app);
const io = require("socket.io")(http);
app.use(express.static("./"));

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/main.html");
});

let carId;
let handleData;
let chartId;
let imageData1 = [];
let imageData2 = [];
let scoreData1 = 0;
io.on("connection", function (socket) {
	socket.on("disconnect", function () {});
	socket.on("connection", function (data) {
		console.log("연결되었습니다. ID 설정 실행");
		if (data === 1) {
			carId = socket.id;
			console.log("연결된 자동차 id" + carId);
			socket.emit("setId", carId);
		} else if (data === 2) {
			chartId = socket.id;
			console.log("연결된 차트페이지 id " + chartId);
		}
		if (chartId) {
			io.sockets.to(chartId).emit("imageData", imageData1, imageData2);
			io.sockets.to(chartId).emit("scoreData", scoreData1);
			//imageData = 0;
			console.log("전송완료");
		}
	});

	socket.on("test", function (data, data2) {
		console.log(data, data2);
	});

	//캡쳐 이미지 받기
	socket.on("image", function (data, data2) {
		console.log("이미지 인코딩 수신 완료");
		imageData1.push(data);
		imageData2.push(data2);
	});

	//스코어 점수 받기
	socket.on("score", function (data) {
		scoreData1 = data;
		console.log(data);
	});
	//beta 음수 < 양수 > gamma 음수 앞, 양수 뒤
	socket.on("handle", function (data) {
		handleData = data;
		//console.log(data[1], data[2]);
		//socket.to(carId).emit("test", data);
	});
});
//server
setInterval(() => {
	//console.log("수신된 데이터 : " + handleData);
	if (handleData) io.sockets.to(carId).emit("drive", handleData);
	//handleData = 0;
}, 1000);

http.listen(3000, function () {
	console.log("Listening on port 3000");
});
