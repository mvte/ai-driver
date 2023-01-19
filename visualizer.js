class Visualizer {
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin*2;
        const height = ctx.canvas.height - margin*2;
        ctx.beginPath();
        const layerHeight = height/(network.layers.length);

        for(let i = 0; i < network.layers.length; i++) {
            const layerTop = top + lerp(
                height-layerHeight, 0, 
                network.layers.length == 1 ? 0.5 : i/(network.layers.length-1)
            );

            Visualizer.drawLayer(ctx, network.layers[i],
                left, layerTop, width, layerHeight,
                i == network.layers.length-1
                    ? ['up', 'left', 'right', 'down'] : []
                );
        }
    }

    static drawLayer(ctx, layer, left, top, width, height, outputLabels) {
        const right = left+width;
        const bottom = top+height;

        const {inputs, outputs, weights, biases} = layer;
        for(let i = 0; i < inputs.length; i++) {
            for(let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    Visualizer.#getNodeX(inputs, i, left, right), 
                    bottom
                );
                ctx.lineTo(
                    Visualizer.#getNodeX(outputs, j, left, right), 
                    top
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = getHEXA(weights[i][j]);
                
                ctx.stroke();
            }
        }


        //input nodes
        const nodeRadius = 20;
        for(let i = 0; i < inputs.length; i++) {
            const x = Visualizer.#getNodeX(inputs, i, left, right)

            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, 2*Math.PI);
            ctx.fillStyle = 'rgb(131, 105, 83)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius*0.85, 0, 2*Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = '#FFFFFF' + alphaToHex(inputs[i]);
            ctx.fill();
            ctx.stroke();
        }

        //output nodes
        for(let i = 0; i < outputs.length; i++) {
            const x = Visualizer.#getNodeX(outputs, i, left, right)

            //draw neuron
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, 2*Math.PI);
            ctx.fillStyle = 'rgb(131, 105, 83)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius*0.85, 0, 2*Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = '#FFFFFF' + alphaToHex(outputs[i]);
            ctx.fill();
            ctx.stroke();

            //draw bias
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius, 0, 2*Math.PI);
            ctx.strokeStyle = getHEXA(biases[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if(outputLabels[i]) {
                ctx.beginPath();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgb(131, 105, 83)';
                ctx.font = nodeRadius*0.6 + 'px Times New Roman';
                ctx.fillText(outputLabels[i], x, top);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[i], x, top);

            }
        }
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(left, right,
            nodes.length == 1 ? 0.5 : index/(nodes.length-1));
    }

} 