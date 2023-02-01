const carCanvas = document.getElementById('carCanvas');
carCanvas.width = 210;
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = 350;

//counts number of frames since event
let frameCount = 0;
//the latest score recorded
let lastScore = 0;
//the latest generation recorded
let generation = 0;

const carCtx = carCanvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const road = new Road(carCanvas.width/2, carCanvas.width*0.9, 3);
Car.setPassedThreshold(25);
const n = 1000;
let cars = generateCars(n, generation);
let bestCar = cars[0]; 
let traffic = generateTraffic();

Info.update(generation, bestCar.name);
renderFirst();

/**
 * Begins the training process. This function is called when the user clicks the
 * "train" button. It will generate 100 generations of cars, each generation 
 * consisting of 1000 cars. The best car of each generation will be saved and used
 * as the starting point for the next generation. 
 */
function train() {
    console.log('training started: 25 generations');
    /*
    * The training process is broken down into 3 steps:
    * 1. Generate a new generation of cars
    * 2. Run the current generation of cars (sped up by 10x)
    * 3. Save the best car of the current generation
    * 4. Repeat steps 1-3 until the desired number of generations is reached
    */

    while(generation == 0 || generation%25 != 0) {
        //generate a new generation of cars
        cars = generateCars(n, generation);
        bestCar = cars[0];
        if(localStorage.getItem("bestBrain")) {
            for(let i = 1; i < cars.length; i++) {  
                cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
                if(i != 0) {
                    NeuralNetwork.mutate(cars[i].brain, 0.12);
                }
            }
        }

        //run the current generation of cars
        frameCount = 0;
        console.log('simulating gen: ' + generation);
        simulateCurrentGen();

        //save the best car
        save();

        //repeat steps 1-3 until the desired number of generations is reached
        generation++;

        //update the info box with the latest generation and score
        Info.update(generation, bestCar.name);
    }
    
}

function simulateCurrentGen() {
    frameCount = 0;
    traffic = generateTraffic();
    for(let i = 0; i < cars.length; i++) {              
        cars[i].reset(road.getLaneCenter(1), 100);
    }
    simulate();
}

function animateCurrentGen() {
    frameCount = 0;
    traffic = generateTraffic();
    for(let i = 0; i < cars.length; i++) {              
        cars[i].reset(road.getLaneCenter(1), 100);
    }
    animate();
}

function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    console.log("saved brain...");
    console.log(bestCar.brain);
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(n, generation) {
    const cars = [];
    for(let i = 0; i < n; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 3, generation, i));
    }

    return cars;
}

function generateTraffic() {
    // const traffic = [];
    // for(let i = 0; i < 25; i++) {
    //     traffic.push(new Car(road.getLaneCenter(Math.floor(Math.random()*3)), -100*i, 30, 50, "NPC", 2));
    // }

    // return traffic;

    return [
        new Car(road.getLaneCenter(0), -300, 30, 50, "NPC", 2),
        new Car(road.getLaneCenter(1), -100, 30, 50, "NPC", 2),
        new Car(road.getLaneCenter(2), -300, 30, 50, "NPC", 2),
        new Car(road.getLaneCenter(0), -500, 30, 50, "NPC", 2),
        new Car(road.getLaneCenter(1), -500, 30, 50, "NPC", 2),
        new Car(road.getLaneCenter(1), -700, 30, 50, "NPC", 2),
        new Car(road.getLaneCenter(2), -700, 30, 50, "NPC", 2),
    ];
}

function findBestCar(cars) {
    let bestCarCandidates = cars.filter(c => c.score == Math.max(
        ...cars.map(c => c.score)));
    let bestCar = bestCarCandidates.find(c => c.y == Math.min(
        ...bestCarCandidates.map(c => c.y)));
    return bestCar;
}

function renderFirst() {
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;
    road.draw(carCtx);
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, '#F8F0E3');
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, '#819C8B');
    }
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7); 
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
}

function animate() {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
        for(let j = 0; j < traffic.length; j++) {
            cars[i].calculatePassed(traffic[j]);
        }
    }

    bestCar = findBestCar(cars);
    console.log(bestCar.score);

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

    if(bestCar.damaged == true) {
        frameCount++;
        if(frameCount > 300) {
            return;
        }
    } else if (lastScore == bestCar.score && bestCar.score != 0) {
        frameCount++;
        if(frameCount > 700) {
            return;
        }
    } else {
        frameCount = 0;
        lastScore = bestCar.score != lastScore ? bestCar.score : lastScore;
    }
    requestAnimationFrame(animate);
}

function simulate() {
    for(let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for(let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
        for(let j = 0; j < traffic.length; j++) {
            cars[i].calculatePassed(traffic[j]);
        }
    }

    bestCar = findBestCar(cars);

    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    if(bestCar.damaged == true) {
        frameCount++;
        if(frameCount > 300) {
            return;
        }
    } else if (lastScore == bestCar.score && bestCar.score != 0) {
        frameCount++;
        if(frameCount > 700) {
            return;
        }
    } else {
        frameCount = 0;
        lastScore = bestCar.score != lastScore ? bestCar.score : lastScore;
    }
    simulate();
}