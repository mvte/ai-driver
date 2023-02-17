class Info {

    static updateInfo(gen, name) {
        const generation = document.getElementById("generation");
        const bestFitness = document.getElementById("bestFitness");

        generation.innerHTML = gen;
        bestFitness.innerHTML = name;
    }

    static updateStatus(status) {
        const statusBox = document.getElementById("status");
        statusBox.innerHTML = status;
        if(status == "Complete") statusBox.style.color = "green";
        else if(status == "In Progress") { 
            statusBox.style.color = "orange";
            statusBox.innerHTML += "<br><button> Stop </button>";
        }
    }
}