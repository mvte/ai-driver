class NeuralNetwork {
    constructor(neuronCounts) {
        this.layers = [];

        for(let i = 0; i < neuronCounts.length-1; i++) {
            this.layers.push(new Layer(
                neuronCounts[i], neuronCounts[i+1]
            ));
        }
    }

    static feedForward(givenInputs, network) {
        let outputs = Layer.feedForward(
            givenInputs, network.layers[0]);

        for(let i = 1; i < network.layers.length; i++) {
            outputs = Layer.feedForward(
                outputs, network.layers[i]);
        }

        return outputs;
    }

    static mutate(network, amount = 1) {
        network.layers.forEach(layer => {
            //mutate biases
            for(let i = 0; i < layer.biases.length; i++) {
                layer.biases[i] = lerp(
                    layer.biases[i],
                    Math.random()*2-1,
                    amount
                )
            }

            //mutate weights
            for(let i = 0; i < layer.weights.length; i++) {
                for(let j = 0; j < layer.weights[i].length; j++) {
                    layer.weights[i][j] = lerp(
                        layer.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}



class Layer{
    constructor(inputCount, outputCount) {
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);

        //biases determine when a node is activated
        this.biases = new Array(outputCount);
        //weights determine the "strength" of the connection between two nodes
        this.weights = [];

        for(let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }

        Layer.#randomize(this);
    }

    //randomize the weights and biases between -1 and 1
    static #randomize(layer) {
        for(let i = 0; i < layer.inputs.length; i++) {
            for(let j = 0; j < layer.outputs.length; j++) {
                layer.weights[i][j] = Math.random()*2-1;
            }
        }
        
        for(let i = 0; i < layer.biases.length; i++) {
            layer.biases[i] = Math.random()*2-1;
        }
    }

    //determines activation values of the output nodes given the input nodes
    static feedForward(givenInputs, layer) {
        for(let i = 0; i < layer.inputs.length; i++) {
            layer.inputs[i] = givenInputs[i];
        }

        for(let i = 0; i < layer.outputs.length; i++) {
            let sum = 0;
            for(let j = 0; j < layer.inputs.length; j++) {
                sum += layer.inputs[j]*layer.weights[j][i];
            }

            if(sum>layer.biases[i]) {
                layer.outputs[i] = 1;
            } else {
                layer.outputs[i] = 0;
            }
        }

        return layer.outputs;
    }
}
