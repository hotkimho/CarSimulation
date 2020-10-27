class Game {
	constructor() {
		const game = this;
		const tt = 3;
		this.socket = io();
		this.socket.emit("connection", 1);

		this.initPosition = new THREE.Vector3(-3, 0, 0);
		//localStorage.setItem("test", "test");
		this.gui = new dat.GUI();
		this.testso;
		this.carFolder = this.gui.addFolder("car");
		this.gui.domElement.id = "gui";
		//guiContainer.appendChild(gui.domElement);
		//차의 힘
		this.speed = 10;
		this.force = 10;
		this.wheelForce = 0;
		this.speed_Sensor = 0;
		this.force_Sensor = 0;
		this.wheelForce_Sensor = 0;
		//this.breakforce = 10;
		//대쉬보드 변수
		this.dashboardSpeed = 0;
		this.dashboardWheelAngle = 0;
		//리플레이 변수
		this.replayVector = [];
		this.replayQuaternion = [];
		this.isReplay = false;
		this.replayCount = 0;
		//Ray
		this.raycaster = new THREE.Raycaster(
			new THREE.Vector3(-1.2, 0.2, 0),
			new THREE.Vector3(0, 0, 0)
		);
		//카메라 전환 오브젝트트
		this.initCamera = new THREE.Object3D();
		this.initCamera.position.set(-3, 1, -8);
		this.carCameraObj2 = new THREE.Object3D();
		this.carCameraObj2.position.set(-3, 6, 10);
		this.carCameraObj = new THREE.Object3D();
		this.carCameraObj.position.set(-3, 12, 0);
		this.carCameraObj3 = new THREE.Object3D();
		this.carCameraObj3.position.set(-3, 2.3, -0.1);
		this.currentCamera = this.carCameraObj2;
		this.oriVec = new THREE.Vector3();
		this.desVec = new THREE.Vector3();
		this.cameraFlag = true;
		this.rearCamera;
		this.leftSideCamera;
		this.rightSideCamera;
		this.isRear = false;
		//카메라 캡쳐 카메라
		this.saveCam1;
		this.saveCam2;

		//핸들 보조선
		this.handleLine1 = new THREE.Object3D();
		this.handleLine2 = new THREE.Object3D();
		this.handleLine3 = new THREE.Object3D();
		this.handleLine4 = new THREE.Object3D();
		this.handleLine1.position.set(-3, 1.2, -3.1);
		this.handleLine2.position.set(-3, 1.2, -4.1);
		this.handleLine3.position.set(-3, 1.2, -5.5);
		this.handleLine4.position.set(-3, 1.2, -6.1);

		//레이 캐스터 오브젝트
		this.rayOriginList = [];
		const rayList = [
			new THREE.Vector3(-1.2, 1.4, -2.4),
			new THREE.Vector3(-1.2, 1.4, 0),
			new THREE.Vector3(-1.2, 1.4, 2.4),
			new THREE.Vector3(1.2, 1.4, -2.3),
			new THREE.Vector3(1.2, 1.4, 0),
			new THREE.Vector3(1.2, 1.4, 2.4),
			new THREE.Vector3(-1.1, 1.4, -2.8),
			new THREE.Vector3(0, 1.4, -3),
			new THREE.Vector3(1.1, 1.4, -2.8),
			new THREE.Vector3(-1.1, 1.4, 3.1),
			new THREE.Vector3(0, 1.4, 3),
			new THREE.Vector3(1.1, 1.4, 3.1),
		];
		for (let i = 0; i < 12; i++) {
			const tmp = new THREE.Object3D();
			tmp.position.copy(rayList[i]);
			this.rayOriginList.push(tmp);
			//console.log(this.rayOriginList[i]);
		}

		//깜박임
		this.flicker = 0;
		this.isFlicker = false;

		//충돌하기전 위험
		this.isCollisionPrediction = false;
		this.collisionSec = 500;
		this.collisionScore = 0;
		//바닥에 그려지는 라인 그룹
		this.lineGroup = [];

		this.min = 0;

		//웹 소켓
		this.beta;
		this.gamma;

		//시간
		this.time = new THREE.Clock();

		//중앙선
		this.cityList = [];
		//바운딩박스

		this.init();
	}

	rayInit() {}
	init() {
		const game = this;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		this.renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);

		//this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.camera.position.copy(this.carCameraObj2.position);
		this.camera.name = "mainCamera";

		this.saveCam1 = this.camera.clone();
		this.saveCam2 = this.camera.clone();
		this.rearCamera = this.camera.clone();
		this.leftSideCamera = this.camera.clone();
		this.rightSideCamera = this.camera.clone();
		this.saveCam1.position.copy(this.carCameraObj.position.clone());
		this.saveCam2.position.copy(this.carCameraObj2.position.clone());

		this.saveCam1.lookAt(this.scene.position);
		this.saveCam2.lookAt(this.scene.position);

		this.rearCamera.position.set(-3, 1.5, 3.3);
		this.rearCamera.lookAt(new THREE.Vector3(-3, 1.5, 4));

		this.leftSideCamera.position.set(-4.5, 1.4, -0.5);
		this.rightSideCamera.position.set(-1.5, 1.4, -0.5);
		this.leftSideCamera.lookAt(new THREE.Vector3(-8, 1.4, 5));
		this.rightSideCamera.lookAt(new THREE.Vector3(2, 1.4, 5));
		const he = new THREE.CameraHelper(this.leftSideCamera);
		//	this.scene.add(he);
		//사운드
		this.audioListener = new THREE.AudioListener();
		this.camera.add(this.audioListener);
		this.sound = new THREE.Audio(this.audioListener);
		this.audioLoader = new THREE.AudioLoader();

		this.audioLoader.load("./gamesrc/sound/warning.mp3", function (buffer) {
			game.sound.setBuffer(buffer);
			game.sound.setLoop(true);
			game.sound.setVolume(0.1);
		});

		//this.camera.quaternion.copy(tt);
		//this.camera.rotateZ(140);
		//this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.replayCamera = this.camera.clone();
		this.replayCamera.lookAt(this.scene.position);
		this.replayCamera.position.set(0, 30, 0);
		this.scene.add(this.camera);
		this.scene.add(this.replayCamera);

		//this.controls = new THREE.OrbitControls(this.camera);
		//this.controls = new THREE.OrbitControls(this.replayCamera);
		//this.controls.update();
		//this.camera.position = this.car.position.clone();

		const helper = new THREE.CameraHelper(this.camera);
		//this.scene.add(helper);

		//this.light = new THREE.DirectionalLight("0xffffff", 1);
		this.light = new THREE.AmbientLight("0xffffff", 1.5);
		this.light.castShadow = true;
		this.light.position.x = 0;
		this.light.position.y = 100;
		this.light.position.z = 0;
		this.light.name = "mainLight";
		this.light.lookAt(this.scene.position);
		this.scene.add(this.light);
		new CannonHelper();
		//xyz 좌표계 보이기
		var axesHelper = new THREE.AxesHelper(100);
		//this.scene.add(axesHelper);

		const test = new THREE.Object3D();

		//베지어곡선 (핸들 보조라인)
		this.curve = new THREE.CubicBezierCurve3(
			this.handleLine1.position,
			this.handleLine2.position,
			this.handleLine3.position,
			this.handleLine4.position
		);

		var points = this.curve.getPoints(50);
		var bezierGeometry = new THREE.BufferGeometry().setFromPoints(points);

		var bezierMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

		// Create the final object to add to the scene
		this.curveObject = new THREE.Line(bezierGeometry, bezierMaterial);
		this.scene.add(this.curveObject);
		this.scene.add(this.handleLine1);
		this.scene.add(this.handleLine2);
		this.scene.add(this.handleLine3);
		this.scene.add(this.handleLine4);
		//physics
		this.world = new CANNON.World();
		this.world.gravity.set(0, -10, 0); // m/s²
		this.world.broadphase = new CANNON.SAPBroadphase(this.world);
		this.helper = new CannonHelper(this.scene);
		//this.helper.addLights(this.renderer);

		//차 크기 초기화
		this.cannonDebugRenderer = new THREE.CannonDebugRenderer(
			this.scene,
			this.world
		);
		//this.carScale = new CANNON.Vec3(1.2, 1, 3.1); car1
		this.carScale = new CANNON.Vec3(1.2, 0.8, 3.1);

		//three는 cannon 사이즈 2배를 가진다.
		//수치당 m임

		//큐브맵
		/*
		this.scene.background = new THREE.CubeTextureLoader()
			.setPath("gamesrc/texture/")
			.load([
				"posx.jpg",
				"negx.jpg",
				"posy.jpg",
				"negy.jpg",
				"posz.jpg",
				"negz.jpg",
			]);
			*/
		const geometry = new THREE.BoxGeometry(2, 2, 2);
		const material = new THREE.MeshBasicMaterial({
			color: 0xababab,
		});
		this.testCube = new THREE.Mesh(geometry, material);

		//	this.testCube2 = this.testCube.clone();
		//this.scene.add(this.testCube);
		//	this.scene.add(this.testCube2);
		this.testCube.position.set(0, 0.2, -10);
		//	this.testCube2.position.set(0, 2, -7);

		this.loadModel();

		const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
		const cannonMaterial = new CANNON.Material();
		const body = new CANNON.Body({ mass: 0, material: cannonMaterial });
		body.addShape(shape);

		body.position.set(0, 0, -10);
		this.testCube.name = "testCube";

		//this.scene.add(this.testCube);
		//console.log(this.testCube);
		//	this.world.add(body);

		//this.createCube(1, 4, 0, -10, "gamesrc/texture/road.png");

		//this.createMap();
		//	this.createCube(5, 0, -5, 0, "gamesrc/texture/road.png");
		//		this.createCube(5, 0, -5, -10, "gamesrc/texture/road.png");
		//		this.createCube(5, 0, -5, 10, "gamesrc/texture/road.png");
	}
	eventList() {
		const game = this;

		window.addEventListener(
			"keydown",
			(event) => {
				this.keyCode = event.keyCode;
				this.keydown = true;
				this.keyup = false;
			},
			false
		);
		window.addEventListener(
			"keyup",
			(event) => {
				this.keyCode = event.keyCode;
				this.down = false;
				this.keyup = true;
				game.city.position.y += 0;
			},
			false
		);
		window.addEventListener(
			"resize",
			() => {
				this.onWindowResize();
			},
			false
		);

		this.speedDom = document.getElementById("speed");
		this.timeDom = document.getElementById("time");
		this.scoreDom = document.getElementById("score");
		this.wheelDom = document.getElementById("wheel");
		this.warningDom = document.getElementById("warning");
		this.warningDom.style.display = "none";

		//this.warningDom.style.display = "block";
		this.cam1 = document.getElementById("cam1");
		this.cam2 = document.getElementById("cam2");
		this.cam3 = document.getElementById("cam3");
		this.cam1.addEventListener(
			"click",
			() => {
				this.cam1Click = true;
				this.cam2Click = false;
				this.cam3Click = false;
				this.alpha = 0.0;
				this.isRear = false;
				//console.log(this.camera.quaternion);
			},
			false
		);
		this.cam2.addEventListener(
			"click",
			() => {
				this.cam1Click = false;
				this.cam2Click = true;
				this.cam3Click = false;
				this.alpha = 0.0;
				this.isRear = false;
				//console.log(this.camera.quaternion);
			},
			false
		);
		this.cam3.addEventListener(
			"click",
			() => {
				this.cam1Click = false;
				this.cam2Click = false;
				this.cam3Click = true;
				this.alpha = 0.0;
				this.isRear = true;
				//console.log(this.camera.quaternion);
			},
			false
		);
	}
	loadModel() {
		var loader = new THREE.FBXLoader();

		const game = this;

		//여기서 404 서버 에러 발생함!! 근데 작동됨
		//신호등 모델
		loader.load(
			"./gamesrc/model/traffic_light.fbx",
			function (object) {
				object.scale.multiplyScalar(0.05);
				object.position.set(2, 0, 0);

				game.traffic_light = object;
				game.trafficLightClone = object.clone();

				//game.scene.add(game.traffic_light);
				/*
				object.traverse((child) => {
					// convert the buffer geometry
					if (child.isMesh && child.geometry.isBufferGeometry) {
						const bg = child.geometry;
						child.geometry = new THREE.Geometry().fromBufferGeometry(bg);
						console.log(child.geometry);
						const co = new CANNON.ConvexPolyhedron(
							child.geometry.vertices,
							child.geometry.faces
						);
						//console.log(co);
					}
				});
				*/

				var boxHelper = new THREE.BoxHelper(object);
				//game.scene.add(boxHelper);
				const box3 = new THREE.Box3();
				const size = new THREE.Vector3();

				box3.setFromObject(boxHelper); // or from mesh, same answer

				const test = new CANNON.Vec3();
				//test.copy(box3.max);

				//	console.log(boxHelper);
				test.x = box3.max.x / 2;
				test.y = box3.max.y - box3.min.y;
				test.z = box3.max.z / 2;
				game.trafficLightBox = test;
				const box = new CANNON.Box(test);
				const body = new CANNON.Body({ mass: 0 });
				body.addShape(box);
				body.quaternion.setFromAxisAngle(
					new CANNON.Vec3(0, 1, 0),
					-Math.PI / 2
				);
				body.position.copy(object.position);

				//game.world.add(body);
				//game.helper.addVisual(body);

				//box3.getSize(size); // pass in size so a new Vector3 is not allocated
			},
			function (xhr) {
				// 모델이 로드되는 동안 호출되는 함수
				//console.log((xhr.loaded / xhr.total) * 100, "% loaded");
			},
			function (error) {
				// 모델 로드가 실패했을 때 호출하는 함수
				//alert(error);
			}
		);

		//도시 생성
		loader.load(
			"./gamesrc/model/drivecourse/sim/Scene/Scene_City.fbx",
			function (object) {
				//object.scale.multiplyScalar(1);
				object.position.set(0, -1, 0);

				game.city = object; //game = this
				object.name = "city";

				let vehicleList = [];
				let test = [];
				let tt;
				object.traverse((child) => {
					if (child.name.includes("Vehicle")) vehicleList.push(child);
					//else if (child.name.includes("Corner")) {
					//tt = object.getObjectByName(child.name);
					else if (
						child.name.includes("Road") ||
						child.name.includes("Wings") ||
						child.name.includes("city")
					) {
					} else {
						game.cityList.push(child);
					}
				});

				for (let i = 0; i < vehicleList.length; i++) {
					const vehicle = object.getObjectByName(vehicleList[i].name);
					const parent = vehicle.parent;
					//if (tt) parent.remove(tt);
					parent.remove(vehicle);
				}

				//console.log(test);
				//console.log(object);
				//game.cityList = test;
				console.log(object.children.length);
				game.scene.add(object);
				game.createCenter();
			},
			function (xhr) {
				// 모델이 로드되는 동안 호출되는 함수
				console.log((xhr.loaded / xhr.total) * 100, "City % loaded");
			},
			function (error) {
				// 모델 로드가 실패했을 때 호출하는 함수
				//alert(error);
			}
		);

		//자동차 추가
		loader.load(
			"./gamesrc/model/car3.fbx",
			function (object) {
				object.traverse((child) => {
					console.log(child.name);
				});
				// 모델 로드가 완료되었을때 호출되는 함수
				//실제 차량 모델은 보여주기만 할
				//실제로 캐논 박스의 물리적인 모델이 물리적인 역할을 대신한다.
				//object.rotateY(Math.PI);
				object.scale.multiplyScalar(0.015);
				object.position.set(-3, 0, 0);
				object.castShadow = true;
				object.receiveShadow = false;

				game.car = object;
				game.car.wheel = [];
				game.car.name = "car";

				game.replayCar = object.clone();

				game.scene.add(game.replayCar);
				game.scene.add(game.car);
				game.replayCar.visible = false;

				game.boxHelper = new THREE.BoxHelper(object, 0xff0000);
				//game.boundingBox = new THREE.Box3();
				game.boxHelper.update();

				game.scene.add(game.boxHelper);
				game.boxHelper.visible = false;
				//	game.boundingBox.setFromObject(game.boxHelper);
				game.car.attach(game.boxHelper);

				//console.log(game.boundingBox);
				game.eventList();
				game.createCar();
				game.guiController();

				object.traverse((child) => {
					if (child.name.includes("Wheel")) {
						child.visible = false;
						//console.log(child);
						//game.scene.add(child);
					}
				});

				//바운딩 박스

				//자동차 화면전환 카메라
				game.camera.lookAt(game.car.position);
				game.car.attach(game.initCamera);
				game.car.attach(game.carCameraObj);
				game.car.attach(game.carCameraObj2);
				game.car.attach(game.carCameraObj3);
				game.car.attach(game.camera);
				game.car.attach(game.rearCamera);
				game.car.attach(game.leftSideCamera);
				game.car.attach(game.rightSideCamera);
				//보조선 위치값으로 쓰일 오브젝트들
				game.car.attach(game.handleLine1);
				game.car.attach(game.handleLine2);
				game.car.attach(game.handleLine3);
				game.car.attach(game.handleLine4);

				// If you want a visible bounding box
				//game.scene.add(helper);
				//game.car.attach(helper);
				// If you just want the numbers

				//console.log(helper.box.max);
				//캡쳐용 카메라
				game.car.attach(game.saveCam1);
				game.car.attach(game.saveCam2);

				//차량 레이 캐스터

				for (let i = 0; i < game.rayOriginList.length; i++) {
					game.car.attach(game.rayOriginList[i]);
				}
			},
			function (xhr) {
				// 모델이 로드되는 동안 호출되는 함수
				console.log((xhr.loaded / xhr.total) * 100, "Car % loaded");
			},
			function (error) {
				// 모델 로드가 실패했을 때 호출하는 함수
				//alert(error);
			}
		);
		//console.dir(this.car);
	}

	createColliders() {
		const world = this.world;
		const scaleAdjust = 0.9;
		const divisor = 2 / scaleAdjust;
		const halfExtents = new CANNON.Vec3(
			this.cityMesh.scale.x,
			this.cityMesh.scale.y,
			this.cityMesh.scale.z
		);
		//	this.cityMesh.visible = false;
		const box = new CANNON.Box(halfExtents);
		const body = new CANNON.Body({ mass: 0 });
		body.addShape(box);

		//body.position.copy(this.cityMesh.position);
		//body.quaternion.copy(this.cityMesh.quaternion);

		//console.log(this.cityMesh.matrixWorld.multiplyVector3(new THREE.Vector3()));
		let test = this.cityMesh.getWorldPosition();

		console.log(test);
		world.add(body);
	}
	//큐브크기, (x,y,z),  텍스쳐 경로
	createCube(cubeSize, x, y, z, image) {
		const texture = new THREE.TextureLoader().load(image);

		const geometry = new THREE.BoxGeometry(
			cubeSize * 2,
			cubeSize * 2,
			cubeSize * 2
		);
		const material = new THREE.MeshBasicMaterial({ map: texture });
		const cube = new THREE.Mesh(geometry, material);

		const shape = new CANNON.Box(new CANNON.Vec3(cubeSize, cubeSize, cubeSize));
		const cannonMaterial = new CANNON.Material();
		const body = new CANNON.Body({ mass: 0, material: cannonMaterial });
		body.addShape(shape);

		body.position.set(x, y, z);
		cube.position.set(x, y, z);
		this.scene.add(cube);
		this.world.add(body);
	}

	createCar() {
		const world = this.world;
		const game = this;
		const groundShape = new CANNON.Plane();
		const groundMaterial = new CANNON.Material("groundMaterial");
		const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
		groundBody.quaternion.setFromAxisAngle(
			new CANNON.Vec3(1, 0, 0),
			-Math.PI / 2
		);

		groundBody.position.set(4, 0, 0);
		groundBody.addShape(groundShape);
		this.world.add(groundBody);
		//this.helper.addVisual(groundBody, 0xff);

		//const groundMaterial = new CANNON.Material("groundMaterial");
		const wheelMaterial = new CANNON.Material("wheelMaterial");
		const wheelGroundContactMaterial = new CANNON.ContactMaterial(
			wheelMaterial,
			groundMaterial,
			{
				friction: 0.3,
				restitution: 0,
				contactEquationStiffness: 1000,
			}
		);
		world.addContactMaterial(wheelGroundContactMaterial);

		//	this.gui.add(this.controls, "mass", 0, 200);
		//this.gui.add("controls", )
		//차의 물리적 body(형태, 질량)
		const chassisShape = new CANNON.Box(this.carScale);
		const chassisBody = new CANNON.Body({ mass: 150 });
		const pos = this.car.position.clone();
		pos.y += 2;
		chassisBody.addShape(chassisShape);
		chassisBody.position.copy(pos);
		chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
		chassisBody.angularVelocity.set(0, 0, 0);
		chassisBody.threemesh = this.car;

		//물리적으로 작용하는 차체는 보여지지 않는다.
		//추가해버리면 얘한테 threemesh가 이전됨
		//this.helper.addVisual(chassisBody, "car");

		//this.followCam = new THREE.Object3D();
		//	this.followCam.position.copy(this.camera.position);
		//		this.scene.add(this.followCam);
		//this.followCam.parent = chassisBody.threemesh;

		let options = {
			radius: 0.5,
			directionLocal: new CANNON.Vec3(0, -1, 0),
			suspensionStiffness: 30,
			suspensionRestLength: 0.3,
			frictionSlip: 5,
			dampingRelaxation: 2.3,
			dampingCompression: 4.4,
			maxSuspensionForce: 1000,
			rollInfluence: 0.01,
			axleLocal: new CANNON.Vec3(-1, 0, 0),
			chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
			maxSuspensionTravel: 0.3,
			customSlidingRotationalSpeed: -30,
			useCustomSlidingRotationalSpeed: true,
		};

		this.vehicle = new CANNON.RaycastVehicle({
			chassisBody: chassisBody,
			indexRightAxis: 0,
			indexUpAxis: 1,
			indexForwardAxis: 2,
		});
		//차체 휠 연결
		const axleX = 1.3;
		const axleY = -0.3;
		const axleZ = 2.2;
		options.chassisConnectionPointLocal.set(axleX, axleY, -axleZ);
		this.vehicle.addWheel(options);

		options.chassisConnectionPointLocal.set(-axleX, axleY, -axleZ);
		this.vehicle.addWheel(options);

		options.chassisConnectionPointLocal.set(axleX, axleY, axleZ - 0.3);
		this.vehicle.addWheel(options);

		options.chassisConnectionPointLocal.set(-axleX, axleY, axleZ - 0.3);
		this.vehicle.addWheel(options);

		this.vehicle.addToWorld(this.world);

		const wheelBodies = [];
		this.vehicle.wheelInfos.forEach(function (wheel) {
			const cylinderShape = new CANNON.Cylinder(
				wheel.radius,
				wheel.radius,
				wheel.radius / 2,
				20
			);
			const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial });
			const q = new CANNON.Quaternion();
			q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
			wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q);
			wheelBodies.push(wheelBody);
			game.helper.addVisual(wheelBody, "wheel");
		});
		world.addEventListener("postStep", function () {
			let index = 0;
			game.vehicle.wheelInfos.forEach(function (wheel) {
				game.vehicle.updateWheelTransform(index);
				const t = wheel.worldTransform;
				wheelBodies[index].threemesh.position.copy(t.position);
				wheelBodies[index].threemesh.quaternion.copy(t.quaternion);
				index++;
			});
		});

		this.animate();
	}

	updateDrive(event) {
		//if (event.type != "keydown" && event.type != "keyup") return;
		//console.log("test");
		const engineForce = this.force;
		const breakeForce = 5;
		const steerVal = 0.02;
		if (this.force >= 300) this.force = 300;
		if (this.force <= 0) this.force = 0;
		if (this.wheelForce >= 0.65) this.wheelForce = 0.65;
		if (this.wheelForce <= -0.65) this.wheelForce = -0.65;
		if (this.handleLine4.position.x > 90) this.handleLine4.position.x = 90;
		if (this.handleLine4.position.x < -90) this.handleLine4.position.x = -90;
		//	console.log(this.wheelForce);
		if (this.keyup) {
			this.breakforce = 10;
			//자동차 브레이크
			this.vehicle.setBrake(breakeForce, 0);
			this.vehicle.setBrake(breakeForce, 1);
			this.vehicle.setBrake(breakeForce, 2);
			this.vehicle.setBrake(breakeForce, 3);
			//휠 원대래로
			if (this.wheelForce > 0) this.wheelForce -= steerVal / 2;
			if (this.wheelForce < 0) this.wheelForce += steerVal / 2;
			this.vehicle.setSteeringValue(this.wheelForce, 2);
			this.vehicle.setSteeringValue(this.wheelForce, 3);

			//핸들라인 원래대로
			if (this.handleLine4.position.x > 0) this.handleLine4.position.x -= 2;
			if (this.handleLine4.position.x < 0) this.handleLine4.position.x += 2;
		} else {
			this.breakforce = 0;
			this.vehicle.setBrake(0, 0);
			this.vehicle.setBrake(0, 1);
			this.vehicle.setBrake(0, 2);
			this.vehicle.setBrake(0, 3);
			if (this.keyCode == 87) {
				this.force += this.speed;
				this.vehicle.applyEngineForce(-engineForce, 0);
				this.vehicle.applyEngineForce(-engineForce, 1);
			}
			if (this.keyCode == 65) {
				this.testCube.position.set(-10, 1, -10);
				this.wheelForce += steerVal;
				this.dashboardWheelAngle -= 0.5;
				this.vehicle.setSteeringValue(this.wheelForce, 2);
				this.vehicle.setSteeringValue(this.wheelForce, 3);
				//핸들 보조라인
				this.handleLine4.position.x += 2;
			}
			if (this.keyCode == 68) {
				this.testCube.position.y += 1;
				//this.camera.position.x += 1;
				//	this.camera.position.x += 2;
				this.wheelForce -= steerVal;
				this.dashboardWheelAngle += 0.5;

				this.vehicle.setSteeringValue(this.wheelForce, 2);
				this.vehicle.setSteeringValue(this.wheelForce, 3);

				this.handleLine4.position.x -= 2;
			}
			if (this.keyCode == 83) {
				this.force += this.speed;
				this.vehicle.applyEngineForce(engineForce, 0);
				this.vehicle.applyEngineForce(engineForce, 1);
			}
			/*
			
			switch (this.keyCode) {
				case 87: //forward
					//this.camera.position.z -= 2;
					//this.testCube.position.z -= 0.1;
					this.force += this.speed;
					this.vehicle.applyEngineForce(-engineForce, 0);
					this.vehicle.applyEngineForce(-engineForce, 1);
					break;
				case 65: //left:
					//자동차
					this.wheelForce += steerVal;
					this.dashboardWheelAngle -= 0.5;
					this.vehicle.setSteeringValue(this.wheelForce, 2);
					this.vehicle.setSteeringValue(this.wheelForce, 3);
					//핸들 보조라인
					this.handleLine4.position.x -= 0.02;
					break;
				case 68: //right:
					//	this.testCube.position.x += 0.1;
					//this.camera.position.x += 1;
					//	this.camera.position.x += 2;
					this.wheelForce -= steerVal;
					this.dashboardWheelAngle += 0.5;

					this.vehicle.setSteeringValue(this.wheelForce, 2);
					this.vehicle.setSteeringValue(this.wheelForce, 3);

					this.handleLine4.position.x += 0.02;
					break;
				case 83: //backward
					//this.car.add(this.testCube);
					//	this.testCube.position.z += 0.1;
					this.force += this.speed;
					this.vehicle.applyEngineForce(engineForce, 0);
					this.vehicle.applyEngineForce(engineForce, 1);

					//for (let i = 0; i < this.replayVector.length; i++)
					//	console.log(this.replayVector[i]);

					break;
				default:
					break;
			}
			*/
		}
	}

	updateDrive_sensor() {
		const beta = this.beta;
		const gamma = this.gamma;

		//console.log(this.a, this.b);
		//if (event.type != "keydown" && event.type != "keyup") return;
		//beta 음수 < 양수 > gamma 음수 앞, 양수 뒤
		let up,
			down,
			left,
			right = false;
		if (beta < -20) left = true;
		if (beta > 20) right = true;
		if (gamma < 0) up = true;
		if (gamma > 0) down = true;

		const engineForce = this.force;
		const breakeForce = 5;
		const steerVal = 0.01;

		if (this.force >= 300) this.force = 300;
		if (this.force <= 0) this.force = 0;
		if (this.wheelForce >= 0.65) this.wheelForce = 0.65;
		if (this.wheelForce <= -0.65) this.wheelForce = -0.65;
		if (this.handleLine4.position.x > 90) this.handleLine4.position.x = 90;
		if (this.handleLine4.position.x < -90) this.handleLine4.position.x = -90;

		//	console.log(this.wheelForce);
		if ((gamma > -90 && gamma < -70) || (gamma < 90 && gamma > 70)) {
			console.log("break");
			this.breakforce = 20;
			//자동차 브레이크
			this.vehicle.setBrake(breakeForce, 0);
			this.vehicle.setBrake(breakeForce, 1);
			this.vehicle.setBrake(breakeForce, 2);
			this.vehicle.setBrake(breakeForce, 3);
			//휠 원대래로
			if (this.wheelForce > 0) this.wheelForce -= steerVal / 2;
			if (this.wheelForce < 0) this.wheelForce += steerVal / 2;
			this.vehicle.setSteeringValue(this.wheelForce, 2);
			this.vehicle.setSteeringValue(this.wheelForce, 3);

			//핸들라인 원래대로
			if (this.handleLine4.position.x > 0 && !right && !left)
				this.handleLine4.position.x -= 2;
			if (this.handleLine4.position.x < 0 && !right && !left)
				this.handleLine4.position.x += 2;
		} else {
			//	console.log("acc");
			this.breakforce = 0;
			this.vehicle.setBrake(0, 0);
			this.vehicle.setBrake(0, 1);
			this.vehicle.setBrake(0, 2);
			this.vehicle.setBrake(0, 3);
			if (up) {
				console.log("up");
				this.force += this.speed;
				this.vehicle.applyEngineForce(-engineForce, 0);
				this.vehicle.applyEngineForce(-engineForce, 1);
			} else if (down) {
				console.log("down");
				this.force += this.speed;
				this.vehicle.applyEngineForce(engineForce, 0);
				this.vehicle.applyEngineForce(engineForce, 1);
			}
		}
		if (left) {
			console.log("left");
			this.wheelForce += steerVal;
			this.dashboardWheelAngle -= 0.5;
			this.vehicle.setSteeringValue(this.wheelForce, 2);
			this.vehicle.setSteeringValue(this.wheelForce, 3);
			//핸들 보조라인
			this.handleLine4.position.x += 2;
		} else if (right) {
			console.log("right");
			this.wheelForce -= steerVal;
			this.dashboardWheelAngle += 0.5;

			this.vehicle.setSteeringValue(this.wheelForce, 2);
			this.vehicle.setSteeringValue(this.wheelForce, 3);

			this.handleLine4.position.x -= 2;
		}
	}
	updateCamera() {
		this.camera.position.lerp(
			this.followCam.getWorldPosition(new THREE.Vector3()),
			0.05
		);
		this.camera.lookAt(this.vehicle.chassisBody.threemesh.position);
		if (this.helper.sun != undefined) {
			this.helper.sun.position.copy(this.camera.position);
			this.helper.sun.position.y += 1;
		}
	}

	dashBoard() {
		this.speedDom.textContent = this.force;
		this.wheelDom.style.transform = `rotate(${this.dashboardWheelAngle}deg)`;

		let sec = this.time.getElapsedTime();

		this.timeDom.textContent = parseInt(sec);
	}

	createMap() {
		const map = [
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		];

		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				const mapType = map[i][j];
				if (mapType === 0) {
					this.createCube(
						7,
						-i * 14,
						-7.6,
						-j * 14,
						"gamesrc/texture/road.png"
					);
				} else if (mapType === 2) {
					this.createCube(
						7,
						-i * 14,
						-7.6,
						-j * 14,
						"gamesrc/texture/weeds.png"
					);
				}
			}
		}

		var geo = new THREE.PlaneBufferGeometry(110, 10, 8, 8);
		var mat = new THREE.MeshBasicMaterial({
			color: 0x525252,
			side: THREE.DoubleSide,
		});
		let wire = new THREE.LineSegments(geo, mat);
		var plane = new THREE.Mesh(geo, mat);
		//plane.add(wire);
		var plane2 = plane.clone();
		plane.name = "wall";
		plane2.name = "Wall";
		plane.position.set(-7, 0, -62);
		plane.rotateY(-Math.PI / 2);
		plane2.position.set(7, 0, -62);
		plane2.rotateY(-Math.PI / 2);
		this.scene.add(plane);
		this.scene.add(plane2);
	}

	switchCamera() {
		this.camera.lookAt(this.car.position);

		let alpha = 0.0;
		for (let i = 0; i < 10000; i++) {
			if (this.cam1Click) {
				let moveVector = new THREE.Vector3();
				let cameraVec = new THREE.Vector3();
				let cameraVec2 = new THREE.Vector3();

				this.camera.getWorldPosition(cameraVec);
				this.carCameraObj.getWorldPosition(cameraVec2);

				moveVector.lerpVectors(cameraVec, cameraVec2, alpha);

				//this.camera.translateX(moveVector.x);
				this.camera.translateY(moveVector.y);
				this.camera.translateZ(moveVector.z);
				this.camera.lookAt(this.car.position);
				//console.log(moveVector);
				//console.log;
				console.log(i);
				alpha += 0.0001;
			}
			//console.log("ee");
		}

		this.cam1Click = false;
		this.cam2Click = false;
	}
	guiController() {
		const game = this;
		let controls = new (function () {
			//car
			this.mass = 150;
			this.speed = 150;

			//trafficLight
			this.objectX = 2;
			this.objectY = 0;
			this.objectZ = 0;

			//replay
		})();

		let fnControls = new (function () {
			this.addTrafficLight = function () {
				//	console.log(objectX);
				game.trafficLightClone.position.set(
					controls.objectX,
					controls.objectY,
					controls.objectZ
				);

				const box = new CANNON.Box(game.trafficLightBox);
				const body = new CANNON.Body({ mass: 0 });
				body.addShape(box);
				body.quaternion.setFromAxisAngle(
					new CANNON.Vec3(0, 1, 0),
					-Math.PI / 2
				);
				body.position.copy(game.trafficLightClone.position);

				game.world.add(body);
				game.scene.add(game.trafficLightClone.clone());
			};

			this.replayBtn = () => {
				game.isReplay = true;
				game.replayVectorCount = game.replayVector.length;
			};
			this.result = () => {
				game.socket.emit("score", game.collisionScore);
				let win = window.open("chart.html", "popupView");
			};

			this.testBtn = () => {
				const geometry = new THREE.BoxGeometry(1, 1, 1);
				const material = new THREE.MeshBasicMaterial({
					color: 0xababab,
				});
				const boundingBox = new THREE.Box3();
				boundingBox.setFromObject(game.boxHelper);
				const cube = new THREE.Mesh(geometry, material);

				const tmp = cube.clone();
				const tmp2 = cube.clone();

				tmp.position.set(-4.5, 1.2, -0.5);
				tmp2.position.set(-1.5, 1.2, -0.5);
				console.log(boundingBox.min, boundingBox.max);
				game.scene.add(tmp);
				game.scene.add(tmp2);
				//game.getBoundingBox();
				//game.sendImage(game.saveCam1, game.saveCam2);
				//let win = window.open("chart.html", "popupView");
				//game.sound.play();
				//game.renderer.render(game.scene, game.replayCamera);
				/*
				var strDownloadMime = "image/octet-stream";
				var strMime = "image/jpeg";
				//game.saveCam1.position.y -= 1;
				//game.scene.attach(game.saveCam1);

				game.renderer.render(game.scene, game.saveCam2);
				game.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
				let imgData = game.renderer.domElement.toDataURL(strMime);

				const imageData = imgData.replace(strMime, strDownloadMime);
				console.log(imageData);
				game.socket.emit("image", imageData);
				*/
				//game.saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");
				//game.data();
				/*the 
				let url = "chart.html";
				let frmPop = document.frmPopup;
				win = window.open("chart.html", "popupView");

				frmPop.action = url;
				frmPop.target = "popupView";
				frmPop.arg1.value = "test";
				frmPop.arg2.value = "Test2";
				frmPop.submit();
				*/
				//	this.container = this.win.document.getElementById("chart");
				//	this.win.document.write("<p>wewee</p>");
				//	var container = document.getElementById("container");
				//this.win.document.
				var data = {
						categories: ["cate1", "cate2", "cate3"],
						series: [
							{
								name: "Legend1",
								data: [20, 30, 50],
							},
							{
								name: "Legend2",
								data: [40, 40, 60],
							},
							{
								name: "Legend3",
								data: [60, 50, 10],
							},
							{
								name: "Legend4",
								data: [80, 10, 70],
							},
						],
					},
					options = {
						chart: {
							width: 500,
							height: 400,
							title: "Chart Title",
						},
						yAxis: {
							title: "Y Axis Title",
						},
						xAxis: {
							title: "X Axis Title",
						},
					};

				//	tui.chart.barChart(this.container, data, options);

				/*
				for (let i = 0; i < game.rayVec.length; i++) {
					const cube = new THREE.Mesh(geometry, material);
					let tmp = new THREE.Vector3();
					game.rayOriginList[i].getWorldPosition(tmp);
					cube.position.copy(tmp);
					//game.scene.add(cube);
					console.log(tmp);
				}
				I */
			};
		})();
		//this.carFolder.add(controls, "mass", 0, 400);

		//this.trafficLightFolder = this.gui.addFolder("trafficLight");
		//this.obstacleFolder = this.gui.addFolder("obstacle");
		this.worldLightFolder = this.gui.addFolder("world");
		this.replayFolder = this.gui.addFolder("replay");

		//	this.trafficLightFolder.add(controls, "trafficLightPosition", 0, 100);

		//this.trafficLightFolder.add(controls, "objectX", 0, 100, 10);
		//this.trafficLightFolder.add(controls, "objectY", 0, 100, 10);
		//this.trafficLightFolder.add(controls, "objectZ", 0, 100, 10);
		//this.trafficLightFolder.add(fnControls, "addTrafficLight");

		this.replayFolder.add(fnControls, "replayBtn");
		this.testtt = this.gui.add(fnControls, "testBtn");
		this.resultBtn = this.gui.add(fnControls, "result");
	}

	drawCurve(carPosition) {
		var dotGeometry = new THREE.Geometry();
		dotGeometry.vertices.push(carPosition);
		var dotMaterial = new THREE.PointsMaterial({
			size: 3,
			sizeAttenuation: false,
		});
		var dot = new THREE.Points(dotGeometry, dotMaterial);
		this.scene.add(dot);

		this.lineGroup.push(dot);
		if (!this.isReplay) {
			this.replayVector.push(this.car.position.clone());
			this.replayQuaternion.push(this.car.quaternion.clone());
		}
	}

	changeCam() {
		if (this.cam1Click) {
			let moveVector = new THREE.Vector3();

			if (this.cameraFlag) {
				this.currentCamera.getWorldPosition(this.oriVec);
				this.carCameraObj.getWorldPosition(this.desVec);
				//this.oriVec.z += 5;

				this.cameraFlag = false;
				this.scene.attach(this.camera);
			}

			moveVector.lerpVectors(this.oriVec, this.desVec, this.alpha);
			console.log(this.oriVec, this.desVec, moveVector);
			this.camera.position.copy(moveVector);
			this.camera.lookAt(this.car.getWorldPosition());
			this.alpha += 0.01;
			if (this.alpha > 0.98) {
				this.alpha = 0.0;
				this.cam2Click = false;
				this.cam1Click = false;
				this.cam3Click = false;
				this.cameraFlag = true;
				this.currentCamera = this.carCameraObj;
				this.car.attach(this.camera);
			}
		}
		if (this.cam2Click) {
			let moveVector = new THREE.Vector3();

			if (this.cameraFlag) {
				this.currentCamera.getWorldPosition(this.oriVec);
				this.carCameraObj2.getWorldPosition(this.desVec);
				//this.oriVec.z += 5;

				this.cameraFlag = false;
				this.scene.attach(this.camera);
			}

			moveVector.lerpVectors(this.oriVec, this.desVec, this.alpha);
			this.camera.position.copy(moveVector);
			this.camera.lookAt(this.car.getWorldPosition());
			this.alpha += 0.01;
			if (this.alpha > 1) {
				this.alpha = 0.0;
				this.cam2Click = false;
				this.cam1Click = false;
				this.cam3Click = false;
				this.cameraFlag = true;
				this.currentCamera = this.carCameraObj2;
				this.car.attach(this.camera);
			}
		}
		if (this.cam3Click) {
			let moveVector = new THREE.Vector3();

			if (this.cameraFlag) {
				this.currentCamera.getWorldPosition(this.oriVec);
				this.carCameraObj3.getWorldPosition(this.desVec);
				//this.oriVec.z += 5;

				this.cameraFlag = false;
				this.scene.attach(this.camera);
			}

			moveVector.lerpVectors(this.oriVec, this.desVec, this.alpha);
			console.log(this.oriVec, this.desVec, moveVector);
			this.camera.position.copy(moveVector);
			this.camera.lookAt(this.initCamera.getWorldPosition());

			this.alpha += 0.01;
			if (this.alpha > 1) {
				this.alpha = 0.0;
				this.cam2Click = false;
				this.cam1Click = false;
				this.cam3Click = false;
				this.cameraFlag = true;
				this.currentCamera = this.carCameraObj3;
				this.car.attach(this.camera);
			}
		}
		/*
		if (this.cam1Click) {
			let moveVector = new THREE.Vector3();
			let cameraVec = new THREE.Vector3();
			let cameraVec2 = new THREE.Vector3();

			this.camera.getWorldPosition(cameraVec);
			this.carCameraObj.getWorldPosition(cameraVec2);

			moveVector.lerpVectors(cameraVec, cameraVec2, this.alpha);
			this.camera.translateY(moveVector.y);
			this.camera.translateZ(moveVector.z);
			this.camera.lookAt(this.car.position);

			this.alpha += 0.01;
			if (this.alpha >= 0.92) {
				this.alpha = 0.0;
				this.cam2Click = false;
				this.cam1Click = false;

				//this.camera.matrixAutoUpdate();
				//this.camera.lookAt(this.car.position);
			}
		}
		if (this.cam2Click) {
			let moveVector = new THREE.Vector3();
			let cameraVec = new THREE.Vector3();
			let cameraVec2 = new THREE.Vector3();

			this.camera.getWorldPosition(cameraVec);
			this.carCameraObj2.getWorldPosition(cameraVec2);

			moveVector.lerpVectors(cameraVec, cameraVec2, this.alpha);
			moveVector.y = -moveVector.y;
			moveVector.z = -moveVector.z;

			this.camera.translateY(moveVector.y);
			this.camera.translateZ(moveVector.z);
			this.camera.lookAt(this.car.position);

			this.alpha += 0.01;
			if (this.alpha >= 0.92) {
				this.alpha = 0.0;
				this.cam2Click = false;
				this.cam1Click = false;

				//	this.camera.matrixAutoUpdate();
			}
		}
		*/
	}

	replay() {
		const index = this.replayCount++;
		if (this.replayCount > this.replayVectorCount) {
			this.isReplay = false;
			this.replayCount = 0;
			this.replayCar.visible = false;

			for (let i = 0; i < this.lineGroup.length; i++)
				this.scene.remove(this.lineGroup[i]);
			return;
		}

		this.renderer.render(this.scene, this.replayCamera);
		this.replayCamera.lookAt(this.replayVector[index]);
		this.replayCar.visible = true;

		this.replayCar.position.copy(this.replayVector[index]);
		this.replayCar.quaternion.copy(this.replayQuaternion[index]);
	}

	detection() {
		//-1.2 0 2.3
		/*
		7 8 9
		1   4
		2	5
		3	6
		10 11 12
		*/

		const rayDirectionList = [
			new THREE.Vector3(-1, 0, 0),
			new THREE.Vector3(-1, 0, 0),
			new THREE.Vector3(-1, 0, 0),
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(1, 0, 0),
			new THREE.Vector3(-1, 0, -1).normalize(),
			new THREE.Vector3(0, 0, -1).normalize(),
			new THREE.Vector3(1, 0, -1).normalize(),
			new THREE.Vector3(-1, 0, 1).normalize(),
			new THREE.Vector3(0, 0, 1),
			new THREE.Vector3(1, 0, 1).normalize(),
		];

		const ray = new THREE.Raycaster(
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(-1, 0, 0),
			0,
			5
		);

		const rayOriginList = this.rayOriginList;
		for (let k = 0; k < rayOriginList.length; k++) {
			let tmp = new THREE.Vector3();
			rayOriginList[k].getWorldPosition(tmp);

			ray.set(tmp, rayDirectionList[k]);
			var intersects = ray.intersectObjects(this.cityList);
			//console.log(intersects);
			//console.log(intersects.length);
			let val = 5;
			//if (this.sound.isPlaying) this.sound.stop();
			//this.sound.playbackRate = 1;
			let name = "";
			for (var i = 0; i < intersects.length; i++) {
				if (val > intersects[i].distance) {
					val = intersects[i].distance;
					name = intersects[i].object.name;
					this.isSound = true;
				} else {
					this.isSound = false;
				}
				//console.log(k + 1, intersects[i].object.name, intersects[i].distance);
				//	console.log(this.warningDom.style.display);
				//if (intersects[i].object.name != "" && intersects[i].distance < 5) {
				//console.log(intersects[i].object.name);
				//	this.warningDom.style.display = "block";
				//} else this.warningDom.style.display = "none";
				/*
				
				An intersection has the following properties :
					- object : intersected object (THREE.Mesh)
					- distance : distance from camera to intersection (number)
					- face : intersected face (THREE.Face3)
					- faceIndex : intersected face index (number)
					- point : intersection point (THREE.Vector3)
					- uv : intersection point in the object's UV coordinates (THREE.Vector2)
				*/
			}
			//if (val > 0 && val < 10) console.log(name, val);
			if (val < 4) {
				const tmp = val / 2;
				if (tmp <= 1) this.sound.playbackRate = 1;
				else this.sound.playbackRate = val;
				//if (this.sound.isPlaying) this.sound.stop();
			}
		}
	}
	flickerWarning() {
		if (this.flicker > 60) {
			this.flicker = 0;
			this.isFlicker = !this.isFlicker;
			return;
		}

		if (this.isFlicker) {
			this.warningDom.style = "block";
		} else this.warningDom.style = "none";
		this.flicker += 1;
	}

	drawHandleLine() {
		const game = this;
		const tmp = this.curveObject;
		let vec1 = new THREE.Vector3();
		let vec2 = new THREE.Vector3();
		let vec3 = new THREE.Vector3();
		let vec4 = new THREE.Vector3();
		//this.handleLine1.position.set()
		//this.handleLine2.position.add(this.car.position);
		//this.handleLine3.position.add(this.car.position);
		//this.handleLine4.position.add(this.car.position);
		//onsole.log(this.handleLine1.position);
		//	this.handleLine1.position.z = this.car.position.z - 5.1;
		//	this.handleLine1.position.z = this.car.position.z - 6.1;
		//	this.handleLine1.position.z = this.car.position.z - 7.1;
		//	this.handleLine1.position.z = this.car.position.z - 8.1;
		this.handleLine1.getWorldPosition(vec1);
		this.handleLine2.getWorldPosition(vec2);
		this.handleLine3.getWorldPosition(vec3);
		this.handleLine4.getWorldPosition(vec4);
		//vec4.add(new THREE.Vector3(0.1, 0, 0));
		this.curve.v0 = vec1;
		this.curve.v1 = vec2;
		this.curve.v2 = vec3;
		this.curve.v3 = vec4;

		var points = this.curve.getPoints(50);
		var bezierGeometry = new THREE.BufferGeometry().setFromPoints(points);

		var bezierMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

		// Create the final object to add to the scene
		this.curveObject = new THREE.Line(bezierGeometry, bezierMaterial);
		this.scene.add(this.curveObject);
		this.scene.remove(tmp);
	}

	data() {
		let data1 = 10;
		let data2 = 20;
		let data3 = 30;
		let win = window.open(
			"chart.html?data1=" + data1 + "&data2=" + data2 + "&data3=" + data3,
			"child"
		);
		win.document.getElementById("tt").nodeValue = "test";
	}

	connection(beta, gamma) {
		let test;

		this.beta = beta;
		this.gamma = gamma;
		//this.socket.on("setId", function (data) {
		//	game.gameso = game.socket.id;
		//console.log(test); //id 출력
		//	});
		//console.log(this.socket.id); //undefined
	}
	plyaSound() {
		if (this.isSound) this.sound.play();
		else {
			if (this.sound.isPlaying) this.sound.stop();
		}
	}
	//(point.x >= box.minX && point.x <= box.maxX) &&
	//(point.y >= box.minY && point.y <= box.maxY) &&
	//(point.z >= box.minZ && point.z <= box.maxZ);
	getBoundingBox() {
		const boundingBox = new THREE.Box3();
		boundingBox.setFromObject(this.boxHelper);
		if (this.cityList)
			for (let i = 1; i < this.cityList.length; i++) {
				if (
					this.cityList[i].position.x >= boundingBox.min.x &&
					this.cityList[i].position.x <= boundingBox.max.x &&
					this.cityList[i].position.z >= boundingBox.min.z &&
					this.cityList[i].position.z <= boundingBox.max.z
				) {
					//console.log(this.collisionSec);
					if (this.collisionSec >= 50) {
						//if (this.collisionSec >= 0) {
						console.log(this.cityList[i].name);
						this.collisionScore++;
						this.scoreDom.textContent = 100 - this.collisionScore;
						this.collisionSec = 0;
						this.sendImage(game.saveCam1, game.saveCam2);
					}
				}
			}
		//console.log(boundingBox.min);
		//console.log(boundingBox.max);
		/*
		if (this.boxHelper) this.scene.remove(this.boxHelper);

		const boxHelper = new THREE.BoxHelper(this.car, 0xff0000);
		const boundingBox = new THREE.Box3();
		boxHelper.update();

		this.scene.add(boxHelper);
		boundingBox.setFromObject(boxHelper);

		this.boxHelper = boxHelper;
		*/
	}

	sendImage(image1, image2) {
		const data = [];
		var strDownloadMime = "image/octet-stream";
		var strMime = "image/jpeg";
		game.renderer.setSize(600, 600);
		//game.renderer.setSize(200, 200);
		game.renderer.render(game.scene, image1);
		let imgData = game.renderer.domElement.toDataURL(strMime);
		let imageData = imgData.replace(strMime, strDownloadMime);

		game.renderer.render(game.scene, image2);
		imgData = game.renderer.domElement.toDataURL(strMime);
		let imageData2 = imgData.replace(strMime, strDownloadMime);

		game.socket.emit("image", imageData, imageData2);
		console.log("전송완료");
		game.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	createCenter() {
		const planeGeometry = new THREE.PlaneGeometry(5, 5);
		const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		plane.rotation.y = -0.5 * Math.PI;
		plane.position.set(0, 0, 0);
		plane.name = "centerLine";

		/*
		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff,
		});

		var points = [];
		for (let i = 0; i < 50; i++) {
			points.push(new THREE.Vector3(0, 0.5, -i));
		}
		var geometry = new THREE.BufferGeometry().setFromPoints(points);

		var line = new THREE.Line(geometry, material);
		line.name = "centerLine";
		this.scene.add(line);
		this.cityList.push(line);
		*/
		//console.log(this.cityList);
		//this.scene.add(plane);
	}
	createRearCamera() {}
	animate() {
		const game = this;
		requestAnimationFrame(function () {
			game.animate();
		});

		this.collisionSec++;
		const now = Date.now();
		if (this.lastTime === undefined) this.lastTime = now;
		const dt = (Date.now() - this.lastTime) / 1000.0;
		this.FPSFactor = dt;
		this.lastTime = now;
		this.world.step(1.0 / 60.0, dt);
		//이건 world에 있는 모든 캐논, three의 위치와 각도를 맞춰주는 업데이트 나는 수동으로 해야함!
		//this.helper.updateBodies(this.world);

		//핸들 데이터를 받아온다.
		this.socket.on("drive", function (data) {
			game.connection(data[1], data[2]);
			//game.updateDrive_sensor(data[1], data[2]);
		});
		//this.plyaSound();
		//	this.updateDrive_sensor();
		this.drawHandleLine();
		if (this.min > 5) {
			this.getBoundingBox();
			this.detection();

			this.min = 0;
		}

		this.min++;
		//물리적인 모든 물체 순회
		this.world.bodies.forEach(function (body) {
			//자동차 위치 각도 계속 초기화
			if (body.threemesh != undefined) {
				//물리 바디와 카의 y같을 매칭시켜야한당
				const pos = body.position.clone();

				pos.y -= 1.2;
				body.threemesh.position.copy(pos);
				body.threemesh.quaternion.copy(body.quaternion);
				//	game.camera.quaternion.copy(body.quaternion);

				if (body == game.car.chassisBody) {
					const elements = body.threemesh.matrix.elements;

					const yAxis = new THREE.Vector3(
						elements[4],
						elements[5],
						elements[6]
					);
					body.threemesh.position.sub(yAxis.multiplyScalar(0.6));
				}
			}
		});

		//와이어 프레임
		//this.cannonDebugRenderer.update();
		//차 이동

		this.updateDrive();
		//this.updateCamera();
		//대쉬보드
		this.dashBoard();
		//지나간 위치를 표시해줌
		//this.drawCurve(this.car.position);
		//if (this.isCollisionPrediction) this.flickerWarning();
		//리플레이
		if (this.isReplay) this.replay();
		//카메라 전환
		this.changeCam();
		//	game.controls.update();

		//	if (cityList) {

		//}
		//console.log(this.car.position);
		if (this.isRear) {
			//console.log("true!");
			this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.camera);

			this.renderer.setViewport(520, window.innerHeight - 150, 420, 150);
			this.renderer.setScissor(520, window.innerHeight - 150, 420, 150);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.rearCamera);

			this.renderer.setViewport(0, window.innerHeight / 2 - 50, 200, 200);
			this.renderer.setScissor(0, window.innerHeight / 2 - 50, 200, 200);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.leftSideCamera);

			this.renderer.setViewport(
				window.innerWidth - 200,
				window.innerHeight / 2 - 50,
				200,
				200
			);
			this.renderer.setScissor(
				window.innerWidth - 200,
				window.innerHeight / 2 - 50,
				200,
				200
			);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.rightSideCamera);
		} else if (this.isReplay) {
			this.renderer.render(this.scene, this.replayCamera);
		} else {
			//console.log("not");
			this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
			this.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
			this.renderer.setScissorTest(true);
			this.renderer.render(this.scene, this.camera);
			//	this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.render(this.scene, this.camera);
		}

		//리플레이가 아니면 차량으로 카메라 작동
		//if (!this.isReplay)
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	saveFile(strData, filename) {
		var link = document.createElement("a");
		if (typeof link.download === "string") {
			document.body.appendChild(link); //Firefox requires the link to be in the body
			link.download = filename; //파일 이름
			link.href = strData;
			//서버에 데이터 전송
			this.socket.emit("image", strData);
			//link.click();
			document.body.removeChild(link); //remove the link when done
		} else {
			location.replace(uri);
		}
	}
}

class CannonHelper {
	constructor(scene) {
		this.scene = scene;
	}

	addLights(renderer) {
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

		// LIGHTS
		const ambient = new THREE.AmbientLight(0x888888);
		this.scene.add(ambient);

		const light = new THREE.DirectionalLight(0xdddddd);
		light.position.set(3, 10, 4);
		light.target.position.set(0, 0, 0);

		light.castShadow = true;

		const lightSize = 10;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 50;
		light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
		light.shadow.camera.right = light.shadow.camera.top = lightSize;

		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;

		this.sun = light;
		this.scene.add(light);
	}

	createCannonTrimesh(geometry) {
		if (!geometry.isBufferGeometry) return null;

		const posAttr = geometry.attributes.position;
		const vertices = geometry.attributes.position.array;
		let indices = [];
		for (let i = 0; i < posAttr.count; i++) {
			indices.push(i);
		}

		return new CANNON.Trimesh(vertices, indices);
	}

	createCannonConvex(geometry) {
		if (!geometry.isBufferGeometry) return null;

		const posAttr = geometry.attributes.position;
		const floats = geometry.attributes.position.array;
		const vertices = [];
		const faces = [];
		let face = [];
		let index = 0;
		for (let i = 0; i < posAttr.count; i += 3) {
			vertices.push(new CANNON.Vec3(floats[i], floats[i + 1], floats[i + 2]));
			face.push(index++);
			if (face.length == 3) {
				faces.push(face);
				face = [];
			}
		}

		return new CANNON.ConvexPolyhedron(vertices, faces);
	}

	addVisual(body, name, castShadow = true, receiveShadow = true) {
		body.name = name;
		if (this.currentMaterial === undefined)
			this.currentMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
		if (this.settings === undefined) {
			this.settings = {
				stepFrequency: 60,
				quatNormalizeSkip: 2,
				quatNormalizeFast: true,
				gx: 0,
				gy: 0,
				gz: 0,
				iterations: 3,
				tolerance: 0.0001,
				k: 1e6,
				d: 3,
				scene: 0,
				paused: false,
				rendermode: "solid",
				constraints: false,
				contacts: false, // Contact points
				cm2contact: false, // center of mass to contact points
				normals: false, // contact normals
				axes: false, // "local" frame axes
				particleSize: 0.1,
				shadows: false,
				aabbs: false,
				profiling: false,
				maxSubSteps: 3,
			};
			this.particleGeo = new THREE.SphereGeometry(1, 16, 8);
			this.particleMaterial = new THREE.MeshLambertMaterial({
				color: 0xff0000,
			});
		}
		// What geometry should be used?
		let mesh;
		if (body instanceof CANNON.Body)
			mesh = this.shape2Mesh(body, castShadow, receiveShadow);

		if (mesh) {
			// Add body
			body.threemesh = mesh;
			mesh.castShadow = castShadow;
			mesh.receiveShadow = receiveShadow;
			this.scene.add(mesh);
		}
	}

	shape2Mesh(body, castShadow, receiveShadow) {
		const obj = new THREE.Object3D();
		const material = this.currentMaterial;
		const game = this;
		let index = 0;

		body.shapes.forEach(function (shape) {
			let mesh;
			let geometry;
			let v0, v1, v2;

			switch (shape.type) {
				case CANNON.Shape.types.SPHERE:
					const sphere_geometry = new THREE.SphereGeometry(shape.radius, 8, 8);
					mesh = new THREE.Mesh(sphere_geometry, material);
					break;

				case CANNON.Shape.types.PARTICLE:
					mesh = new THREE.Mesh(game.particleGeo, game.particleMaterial);
					const s = this.settings;
					mesh.scale.set(s.particleSize, s.particleSize, s.particleSize);
					break;

				case CANNON.Shape.types.PLANE:
					geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
					mesh = new THREE.Object3D();
					const submesh = new THREE.Object3D();
					const ground = new THREE.Mesh(geometry, material);
					ground.scale.set(100, 100, 100);
					submesh.add(ground);

					mesh.add(submesh);
					break;

				case CANNON.Shape.types.BOX:
					const box_geometry = new THREE.BoxGeometry(
						shape.halfExtents.x * 2,
						shape.halfExtents.y * 2,
						shape.halfExtents.z * 2
					);
					mesh = new THREE.Mesh(box_geometry, material);
					break;

				case CANNON.Shape.types.CONVEXPOLYHEDRON:
					const geo = new THREE.Geometry();

					// Add vertices
					shape.vertices.forEach(function (v) {
						geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
					});

					shape.faces.forEach(function (face) {
						// add triangles
						const a = face[0];
						for (let j = 1; j < face.length - 1; j++) {
							const b = face[j];
							const c = face[j + 1];
							geo.faces.push(new THREE.Face3(a, b, c));
						}
					});
					geo.computeBoundingSphere();
					geo.computeFaceNormals();
					mesh = new THREE.Mesh(geo, material);
					break;

				case CANNON.Shape.types.HEIGHTFIELD:
					geometry = new THREE.Geometry();

					v0 = new CANNON.Vec3();
					v1 = new CANNON.Vec3();
					v2 = new CANNON.Vec3();
					for (let xi = 0; xi < shape.data.length - 1; xi++) {
						for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
							for (let k = 0; k < 2; k++) {
								shape.getConvexTrianglePillar(xi, yi, k === 0);
								v0.copy(shape.pillarConvex.vertices[0]);
								v1.copy(shape.pillarConvex.vertices[1]);
								v2.copy(shape.pillarConvex.vertices[2]);
								v0.vadd(shape.pillarOffset, v0);
								v1.vadd(shape.pillarOffset, v1);
								v2.vadd(shape.pillarOffset, v2);
								geometry.vertices.push(
									new THREE.Vector3(v0.x, v0.y, v0.z),
									new THREE.Vector3(v1.x, v1.y, v1.z),
									new THREE.Vector3(v2.x, v2.y, v2.z)
								);
								var i = geometry.vertices.length - 3;
								geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
							}
						}
					}
					geometry.computeBoundingSphere();
					geometry.computeFaceNormals();
					mesh = new THREE.Mesh(geometry, material);
					break;

				case CANNON.Shape.types.TRIMESH:
					geometry = new THREE.Geometry();

					v0 = new CANNON.Vec3();
					v1 = new CANNON.Vec3();
					v2 = new CANNON.Vec3();
					for (let i = 0; i < shape.indices.length / 3; i++) {
						shape.getTriangleVertices(i, v0, v1, v2);
						geometry.vertices.push(
							new THREE.Vector3(v0.x, v0.y, v0.z),
							new THREE.Vector3(v1.x, v1.y, v1.z),
							new THREE.Vector3(v2.x, v2.y, v2.z)
						);
						var j = geometry.vertices.length - 3;
						geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
					}
					geometry.computeBoundingSphere();
					geometry.computeFaceNormals();
					mesh = new THREE.Mesh(geometry, MutationRecordaterial);
					break;

				default:
					throw "Visual type not recognized: " + shape.type;
			}

			mesh.receiveShadow = receiveShadow;
			mesh.castShadow = castShadow;

			mesh.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = castShadow;
					child.receiveShadow = receiveShadow;
				}
			});

			var o = body.shapeOffsets[index];
			var q = body.shapeOrientations[index++];
			mesh.position.set(o.x, o.y, o.z);
			mesh.quaternion.set(q.x, q.y, q.z, q.w);

			obj.add(mesh);
		});

		return obj;
	}

	updateBodies(world) {
		world.bodies.forEach(function (body) {
			if (body.threemesh != undefined) {
				body.threemesh.position.copy(body.position);
				body.threemesh.quaternion.copy(body.quaternion);
			}
		});
	}
}

class Preloader {
	constructor(options) {
		this.assets = {};
		for (let asset of options.assets) {
			this.assets[asset] = { loaded: 0, complete: false };
			this.load(asset);
		}
		this.container = options.container;

		if (options.onprogress == undefined) {
			this.onprogress = onprogress;
			this.domElement = document.createElement("div");
			this.domElement.style.position = "absolute";
			this.domElement.style.top = "0";
			this.domElement.style.left = "0";
			this.domElement.style.width = "100%";
			this.domElement.style.height = "100%";
			this.domElement.style.background = "#000";
			this.domElement.style.opacity = "0.7";
			this.domElement.style.display = "flex";
			this.domElement.style.alignItems = "center";
			this.domElement.style.justifyContent = "center";
			this.domElement.style.zIndex = "1111";
			const barBase = document.createElement("div");
			barBase.style.background = "#aaa";
			barBase.style.width = "50%";
			barBase.style.minWidth = "250px";
			barBase.style.borderRadius = "10px";
			barBase.style.height = "15px";
			this.domElement.appendChild(barBase);
			const bar = document.createElement("div");
			bar.style.background = "#2a2";
			bar.style.width = "50%";
			bar.style.borderRadius = "10px";
			bar.style.height = "100%";
			bar.style.width = "0";
			barBase.appendChild(bar);
			this.progressBar = bar;
			if (this.container != undefined) {
				this.container.appendChild(this.domElement);
			} else {
				document.body.appendChild(this.domElement);
			}
		} else {
			this.onprogress = options.onprogress;
		}

		this.oncomplete = options.oncomplete;

		const loader = this;
		function onprogress(delta) {
			const progress = delta * 100;
			loader.progressBar.style.width = `${progress}%`;
		}
	}

	checkCompleted() {
		for (let prop in this.assets) {
			const asset = this.assets[prop];
			if (!asset.complete) return false;
		}
		return true;
	}

	get progress() {
		let total = 0;
		let loaded = 0;

		for (let prop in this.assets) {
			const asset = this.assets[prop];
			if (asset.total == undefined) {
				loaded = 0;
				break;
			}
			loaded += asset.loaded;
			total += asset.total;
		}

		return loaded / total;
	}

	load(url) {
		const loader = this;
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", url, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				loader.assets[url].complete = true;
				if (loader.checkCompleted()) {
					if (loader.domElement != undefined) {
						if (loader.container != undefined) {
							loader.container.removeChild(loader.domElement);
						} else {
							document.body.removeChild(loader.domElement);
						}
					}
					loader.oncomplete();
				}
			}
		};
		xobj.onprogress = function (e) {
			const asset = loader.assets[url];
			asset.loaded = e.loaded;
			asset.total = e.total;
			loader.onprogress(loader.progress);
		};
		xobj.send(null);
	}
}
