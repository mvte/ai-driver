const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 210;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 350;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width/2, carCanvas.width*0.9, 3);

const n = 1000;
const cars = generateCars(n);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")) {
    for(let i = 1; i < cars.length; i++) {  
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if(i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.15);
        }
    }
}
const traffic = [
    new Car(road.getLaneCenter(0), -300, 30, 50, "NPC", 2),
    new Car(road.getLaneCenter(1), -100, 30, 50, "NPC", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "NPC", 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, "NPC", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "NPC", 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "NPC", 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, "NPC", 2),
];

animate();

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    console.log("saved brain...");
    console.log(bestCar.brain);
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(n) {
    const cars = [];
    for(let i = 0; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 3));
    }

    return cars;
}

function animate() {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    //fitness function (largest y value)
    //experiment with most cars passed?
    bestCar = cars.find(
        c => c.y == Math.min(
            ...cars.map(c => c.y)
        )
    );

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7); //update camera pos every frame

    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, '#F8F0E3');
    }
    carCtx.globalAlpha = 0.2;
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, '#819C8B');
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, '#819C8B', true);
    carCtx.restore();

    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}