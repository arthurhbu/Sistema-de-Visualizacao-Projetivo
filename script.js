
function calculateProjection(vertices, camera, plane) { 
    
}

document.addEventListener("DOMContentLoaded", () => {
    const surfacesContainer = document.getElementById("surfaces-inputs");
    const addSurfaceBtn = document.getElementById("add-surface");
    const removeSurfaceBtn = document.getElementById("remove-surface");
    let surfaceCount = 0;

    const verticesContainer = document.getElementById("vertices-inputs");
    const addVertexBtn = document.getElementById("add-vertex");
    const removeVertexBtn = document.getElementById("remove-vertex");
    let vertexCount = 0;

    vertices_data = [];
    surfaces_data = [];

    function collectVerticesData() { 
        vertices_data = [];
        for (let i = 1; i <= vertexCount; i++) {
            const x = document.getElementById(`x${i}`).value;
            const y = document.getElementById(`y${i}`).value;
            const z = document.getElementById(`z${i}`).value;
            vertices_data.push([x, y, z]);
        }
        return vertices_data;
    }

    function collectSurfaceData() { 
        surfaces_data = [];
        for(let i = 1; i <= surfaceCount; i++) {
            const numVertices = parseInt(document.getElementById(`num-vertices-s${i}`).value);
            const surfaceVertices = document.getElementById(`vertices-s${i}`).value.split(",")
                .map(vertexId => parseInt(vertexId.trim()));
            surfaces_data.push({surfaces: surfaceCount,verticessss: numVertices, vertices: surfaceVertices });
        }
        return surfaces_data;
    }

    addVertexBtn.addEventListener("click", () => {
    vertexCount++;
    const vertexDiv = document.createElement("div");
    vertexDiv.className = "vertex-input";
    vertexDiv.id = `vertex-${vertexCount}`;
    vertexDiv.innerHTML = `
        <p style="font-size: 1.2rem; font-weight: 500; padding: 0; margin: 0;margin-top: 4vh">Vértice: ${vertexCount}</p>
        <div style="padding: 2vh;max-width: fit-content;border: 1px solid #ccc;border-radius: 5px;display: flex; margin-top: 2vh;margin-bootm: 2vh; justify-content: space-around;">
            <label for="x${vertexCount}">X:</label>
            <input class="form__input" type="number" id="x${vertexCount}" name="x${vertexCount}" step="0.1" placeholder="Ex: 1.0" autocomplete"1.0">
            <label for="y${vertexCount}">Y:</label>
            <input class="form__input" type="number" id="y${vertexCount}" name="y${vertexCount}" step="0.1" placeholder="Ex: 2.0" autocomplete"2.0">
            <label for="z${vertexCount}">Z:</label>
            <input class="form__input" type="number" id="z${vertexCount}" name="z${vertexCount}" step="0.1" placeholder="Ex: 3.0" autocomplete"3.0">
        </div>
    `;
    verticesContainer.appendChild(vertexDiv);
    });

    removeVertexBtn.addEventListener("click", () => {
    if (vertexCount > 0) {
        const vertexDiv = document.getElementById(`vertex-${vertexCount}`);
        verticesContainer.removeChild(vertexDiv);
        vertexCount--;
    }
    });

    addSurfaceBtn.addEventListener("click", () => {
    surfaceCount++;
    const surfaceDiv = document.createElement("div");
    surfaceDiv.className = "surface-input";
    surfaceDiv.id = `surface-${surfaceCount}`;
    surfaceDiv.innerHTML = `
        <p style="font-size: 1.2rem; font-weight: 500; padding: 0; margin: 0;margin-top: 4vh"> Superficie: ${surfaceCount}</p>
        <div style="padding: 2vh;max-width: fit-content;border: 1px solid #ccc;border-radius: 5px;display: flex; margin-top: 2vh;margin-bootm: 2vh;">
            <div style="width: 30%;">
                <label for="num-vertices-s${surfaceCount}">Número de Vértices:</label>
                <input class="form__input" type="number" id="num-vertices-s${surfaceCount}" name="num-vertices-s${surfaceCount}" min="3" value="3">
            </div>
            <div style="width: 100%; display: flex; flex-direction: column; justify-content: space-between;">
                <label for="vertices-s${surfaceCount}">Vértices (IDs separados por vírgula):</label>
                <input class="form__input" type="text" id="vertices-s${surfaceCount}" name="vertices-s${surfaceCount}" placeholder="Ex: 1,2,3">
            </div>
        </div>
    `;
    surfacesContainer.appendChild(surfaceDiv);
    });

    removeSurfaceBtn.addEventListener("click", () => {
    if (surfaceCount > 0) {
        const surfaceDiv = document.getElementById(`surface-${surfaceCount}`);
        surfacesContainer.removeChild(surfaceDiv);
        surfaceCount--;
    }
    });

    const sendDataBtn = document.getElementById("send-data");
    sendDataBtn.addEventListener("click", () => {
        surface_data = collectSurfaceData();
        vertice_data = collectVerticesData();

        console.log("Vertices Data:", vertices_data);
        console.log("Surfaces Data:", surfaces_data);
    });
});



    

  

  