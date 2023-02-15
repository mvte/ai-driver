self.importScripts('car.js', 'network.js', 'sensor.js', 'road.js', 'utils.js', 'controls.js');

let frameCount = 0;
let lastScore = 0;

let generation;
let cars;
let bestCar;
let road; 
let traffic;
let n;
let bestCarBrain;

self.onmessage = (event) => {
    console.log('worker thread received message: ' + event.data.type);
    switch(event.data.type) {
        case "auto":
            initializeTraining(event);
            train();
            break;
        default:
            console.log("unrecognized message type");
    }
}

function initializeTraining(event) {
    generation = event.data.gen;

    let bestCarData = event.data.bestCar;
    if(bestCarData) {
        bestCar = new Car(bestCarData.x, bestCarData.y, bestCarData.width, 
            bestCarData.height, "AI", bestCarData.speed, 
            bestCarData.generation, bestCarData.id);
        bestCar.brain = bestCarData.brain;
    }
    
    let roadData = event.data.road;
    road = new Road(roadData.x, roadData.width, roadData.laneCount);

    n = event.data.n;
}

/**
 * Begins the training process. This function is called when the user clicks the
 * "train" button. It will generate 25 generations of cars, each generation 
 * consisting of 1000 cars. The best car of each generation will be saved and used
 * as the starting point for the next generation. 
 */
function train() {
    console.log('training started: 100 generations');

    do {
        //generate a new generation of cars
        cars = generateCars(n, generation);
        
        if(bestCarBrain) {
            for(let i = 0; i < cars.length; i++) {
                cars[i].brain = JSON.parse(JSON.stringify(bestCarBrain));
                if(i !=  0) {
                    NeuralNetwork.mutate(cars[i].brain, 0.12);
                }
            }
        }
        // why does this break everything?
        // ...ur assigning a reference and then mutating the reference, so everything gets mutated..

        //run the current generation of cars
        frameCount = 0;
        console.log('simulating gen: ' + generation);
        simulateCurrentGen();
        
        //save the best car
        lastScore = 0;
        save();

        //repeat steps 1-3 until the desired number of generations is reached
        generation++;

        //update the info box with the latest generation and car
        console.log("sending to main thread: " + bestCar.name);
        postMessage({
            "type": "training_update", 
            "generation": generation, 
            "bestCar": bestCar
        });

    } while (generation%100 != 0);

    postMessage({
        "type": "training_complete", 
        "generation": generation,
        "cars": cars, 
        "bestCar": bestCar
    });
}

function findBestCar(cars) {
    let bestCarCandidates = cars.filter(c => c.score == Math.max(
        ...cars.map(c => c.score)));
    let best = bestCarCandidates.find(c => c.y == Math.min(
        ...bestCarCandidates.map(c => c.y)));
    return best;
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

function simulateCurrentGen() {
    frameCount = 0;
    traffic = generateTraffic();
    for(let i = 0; i < cars.length; i++) {              
        cars[i].reset(road.getLaneCenter(1), 100);
    }
    simulate();
}

function save() {
    bestCarBrain = bestCar.brain;
    console.log("saved brain of " + bestCar.name);
    console.log(bestCar.brain);
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

    if(bestCar.damaged == true) {
        frameCount++;
        if(frameCount > 300) {
            return;
        }
    } else if (lastScore == bestCar.score) {
        frameCount++;
        if(frameCount > 700) {
            return;
        }
    } else {
        frameCount = 0;
        if(bestCar.score != lastScore) {
            console.log("score: " + bestCar.score);
            lastScore = bestCar.score != lastScore ? bestCar.score : lastScore;
        }
    }

    simulate();
}