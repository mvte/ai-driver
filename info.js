class Info {
    static update(gen, name) {
        const generation = document.getElementById("generation");
        const bestFitness = document.getElementById("bestFitness");

        generation.innerHTML = gen;
        bestFitness.innerHTML = name;
    }
}