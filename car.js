class Car {
    static passed_threshold = 25;
    static setPassedThreshold(value) {
        this.passed_threshold = value;
    }

    constructor(x,y,width,height,controlType,max_vel=3,generation,id) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.name = generation + "." + id;

        this.vel = 0;
        this.acceleration = 0.2;
        this.max_vel = max_vel;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if(controlType != "NPC") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 6, 4] 
            );
        }

        this.controls = new Controls(controlType);

        //fitness function implenentation
        this.score = 0;
        this.passedCars = [];
    }

    reset(x,y) {
        this.x = x;
        this.y = y;
        this.vel = 0;
        this.angle = 0;
        this.damaged = false;
        this.score = 0;
        this.passedCars = [];
    }

    calculatePassed(car) {
        if(this.y < car.y && !this.passedCars.includes(car)) {
            this.passedCars.push(car);
            this.score++;

            if(this.passedCars.length > Car.passed_threshold) {
                this.passedCars.pop();
            }
        }
    }



    /**
     * updates the car and sensor positions/translations
     * @param {[Number, Number]} roadBorders 
     */
    update(roadBorders, traffic) {
        if(!this.damaged) {
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        if(this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s => s==null ? 0 : 1-s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if(this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for(let i = 0; i < roadBorders.length; i++) {
            if(polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for(let i = 0; i < traffic.length; i++) {
            if(polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);

        //top right
        points.push({
            x: this.x - rad*Math.sin(this.angle - alpha),
            y: this.y - rad*Math.cos(this.angle - alpha)
        });
        //top left
        points.push({
            x: this.x - rad*Math.sin(this.angle + alpha),
            y: this.y - rad*Math.cos(this.angle + alpha)
        });
        //bottom left
        points.push({
            x: this.x - rad*Math.sin(Math.PI + this.angle - alpha),
            y: this.y - rad*Math.cos(Math.PI + this.angle - alpha)
        });
        //bottom right
        points.push({
            x: this.x - rad*Math.sin(Math.PI + this.angle + alpha),
            y: this.y - rad*Math.cos(Math.PI + this.angle + alpha)
        });

        return points;
    }

    #move() {
        if(this.controls.forward) {
            this.vel += this.acceleration;
        }
        if(this.controls.reverse) {
            this.vel -= this.acceleration;
        }
        
        if(this.vel>this.max_vel) {
            this.vel = this.max_vel;
        }
        if(this.vel< -this.max_vel/2) {
            this.vel = -this.max_vel/2;
        }

        if(this.vel>0) {
            this.vel -= this.friction;
        }
        if(this.vel<0) {
            this.vel += this.friction;
        }

        if(Math.abs(this.vel)<this.friction) {
            this.vel = 0;
        }

        if(this.vel!=0) {
            const flip = this.vel > 0 ? 1 : -1;
            if(this.controls.left) {
                this.angle += 0.03*flip;
            }
            if(this.controls.right) {   
                this.angle -= 0.03*flip;
            }
        }

        this.x -= this.vel*Math.sin(this.angle);
        this.y -= this.vel*Math.cos(this.angle);
    }

    draw(ctx, color, drawSensor = false) {
        if(this.damaged) {
            ctx.fillStyle = '#7E6363';
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i=1; i<this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();
        if(this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}