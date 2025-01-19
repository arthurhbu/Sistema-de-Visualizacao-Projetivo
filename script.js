function calculateVector(PA,PB) { 
    return [PB[0] - PA[0], PB[1] - PA[1], PB[2] - PA[2]];
}

function crossProduct(v1,v2) { 
    const Nx = v1[1] * v2[2] - v1[2] * v2[1];
    const Ny = v1[2] * v2[0] - v1[0] * v2[2];
    const Nz = v1[0] * v2[1] - v1[1] * v2[0];
    return [Nx, Ny, Nz];
}

function calculateDistance(p0, p, normalVector) { 
    const [x0, y0, z0] = p0;
    const [a, b, c] = p;
    const [nx, ny, nz] = normalVector;

    const d0 = x0*nx + y0*ny + z0*nz;
    const d1 = a*nx + b*ny + c*nz;

    const d = d0 - d1;

    return {d0, d1, d};
}

function calculatePerspectiveMatrix(d, d0, p, normalVector) { 
    const [nx, ny, nz] = normalVector;
    const [a, b, c] = p;

    return [
        [d + a*nx, a*ny, a*nz, -a*d0],
        [b*nx, d + b*ny, b*nz, -b*d0],
        [c*nx, c*ny, d + c*nz, -c*d0],
        [nx, ny, nz, d],
    ]
}

function calculateCoordinatesInProjectionPlane(p, perspectiveMatrix) { 
    const [x,y,z,w=1] = p;
    const resultado = [
        perspectiveMatrix[0][0]*x + perspectiveMatrix[0][1]*y + perspectiveMatrix[0][2]*z + perspectiveMatrix[0][3]*w,
        perspectiveMatrix[1][0]*x + perspectiveMatrix[1][1]*y + perspectiveMatrix[1][2]*z + perspectiveMatrix[1][3]*w,
        perspectiveMatrix[2][0]*x + perspectiveMatrix[2][1]*y + perspectiveMatrix[2][2]*z + perspectiveMatrix[2][3]*w,
        perspectiveMatrix[3][0]*x + perspectiveMatrix[3][1]*y + perspectiveMatrix[3][2]*z + perspectiveMatrix[3][3]*w,
    ];
    return resultado;
}

function toHomogeneousCoordinates(homogeneousPoint) {
    const [x, y, z, w] = homogeneousPoint;
    return [x/w, y/w, z/w];
}

function toCartesianCoordinates(cartesianPoint) { 
    const [XC,YC] = cartesianPoint;
    return [XC,YC];
}

function janela_viewport(x, y, Xmin, Xmax, Ymin, Ymax, Umin, Umax, Vmin, Vmax){

    U = Umin + ((x - Xmin) / (Xmax - Xmin)) * (Umax - Umin)
    V = Vmin + ((y - Ymin) / (Ymax - Ymin)) * (Vmax - Vmin)

    return [U, V]
}

function drawProjection(surfaceData, vertices){ 

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    surfaceData.forEach(face => {
        ctx.beginPath();
        face.forEach((vertexIndex, i) => {
            const [x, y] = vertices[vertexIndex];
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.stroke();
    });

}

function generateProjection(pointOfView, p1, p2, p3, verticeData, scaleFactor) { 

    const canvas = document.getElementById("canvas");
    const perspectiveVertices = []
    const homogeneousVertices = []

    const v1 = calculateVector(p2, p1);
    const v2 = calculateVector(p2, p3);
    const normalVectorPlane = crossProduct(v1, v2);

    const { d0, d1, d } = calculateDistance(p1, pointOfView, normalVectorPlane);

    const perspectiveMatrix = calculatePerspectiveMatrix(d, d0, pointOfView, normalVectorPlane);
    
    const projectionVertices = verticeData.map(vertex => {
        const perspectiveVertex = calculateCoordinatesInProjectionPlane(vertex, perspectiveMatrix);
        perspectiveVertices.push(perspectiveVertex)
        const homogeneous = toHomogeneousCoordinates(perspectiveVertex);
        homogeneousVertices.push(homogeneous)
        return homogeneous;
    });

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const Xmin = Math.min(...projectionVertices.map(v => v[0]));
    const Xmax = Math.max(...projectionVertices.map(v => v[0]));
    const Ymin = Math.min(...projectionVertices.map(v => v[1]));
    const Ymax = Math.max(...projectionVertices.map(v => v[1]));

    const objectCenterX = (Xmin + Xmax) / 2;
    const objectCenterY = (Ymin + Ymax) / 2;

    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;
    const offsetX = canvasCenterX - objectCenterX;
    const offsetY = canvasCenterY - objectCenterY;

    const scaledAndCenteredVertices = projectionVertices.map(([x, y]) => [
        (x - objectCenterX) * scaleFactor + objectCenterX + offsetX,
        -(y - objectCenterY) * scaleFactor + objectCenterY + offsetY // Inverte o eixo Y
    ]);

    const viewportCoordinates = projectionVertices.map((vertex) => {
        const invertedY = -vertex[1];
        return janela_viewport(vertex[0], invertedY, Xmin, Xmax, Ymin, Ymax, 100, canvas.width, 100, canvas.height);
    });

    const generationInfos = {
        normalVectorPlane: normalVectorPlane,
        distance: {d0,d1,d},
        perspectiveMatrix: perspectiveMatrix,
        perspectiveVertices: perspectiveVertices,
        homogeneousVertices: homogeneousVertices,
        viewportCoordinates: viewportCoordinates,
        scaledAndCenteredVertices: scaledAndCenteredVertices,
    }

    return generationInfos

}

document.addEventListener("DOMContentLoaded", () => {

    let scaleFactor = 200;

    let canvas = document.getElementById("canvas");
    let isCanvasFocused = false;

    document.getElementById("projection_infos").value = `{
        "pontoPerspectiva": [10, 20, 150],
        "p1": [1, 0, 0],
        "p2": [0, 0, 0],
        "p3": [0, 1, 0],
        "vertices": [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
        "faces": {
            "numberSurfaces": 6,
            "surfaces": [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]]
        }
        }`;

    const mObjVerticesInfo = document.getElementById("objectVerticesMatrix");
    const mObjSurfacesInfo = document.getElementById("objectSurfacesMatrix");
    const normalVectorInfo = document.getElementById("normalVector");
    const distancesInfo = document.getElementById("distances");
    const matrixPerspectiveInfo = document.getElementById("matrixPerspective");
    const homogeneousVerticesInfo = document.getElementById("homogeneousVertices");
    const viewportVerticesInfo = document.getElementById("viewportVertices");

    const surfacesContainer = document.getElementById("surfaces-inputs");
    const addSurfaceBtn = document.getElementById("add-surface");
    const removeSurfaceBtn = document.getElementById("remove-surface");
    let surfaceCount = -1;

    const verticesContainer = document.getElementById("vertices-inputs");
    const addVertexBtn = document.getElementById("add-vertex");
    const removeVertexBtn = document.getElementById("remove-vertex");
    let vertexCount = -1;

    const sendDataBtn = document.getElementById("send-data");
    const sendJsonBtn = document.getElementById("send-json");

    const cubeExampleBtn = document.getElementById("cube-example");
    const octhaedronExampleBtn = document.getElementById("octhaedron-example");
    const pyramidExampleBtn = document.getElementById("pyramid-example");
    const triangularPrismExampleBtn = document.getElementById("traingularPrism-example");
    const scaleFactorBtn = document.getElementById("scaleFactor-btn")

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    let p1 = [1,0,0] 
    let p2 = [0,0,0] 
    let p3 = [0,1,0]

    let projectionInfos = {};

    let surfacesData = [];
    let verticesData = [];

    function createVectorPoints(numberPoint) { 
        const px = document.getElementById(`p${numberPoint}x`).value;
        const py = document.getElementById(`p${numberPoint}y`).value;
        const pz = document.getElementById(`p${numberPoint}z`).value;
        return [parseFloat(px), parseFloat(py), parseFloat(pz)];
    }

    function collectVerticesData() { 
        verticesData = [];
        for (let i = 1; i <= vertexCount; i++) {
            const x = document.getElementById(`x${i}`).value;
            const y = document.getElementById(`y${i}`).value;
            const z = document.getElementById(`z${i}`).value;
            verticesData.push([x, y, z]);
        }
        return verticesData;
    }

    function collectSurfaceData() { 
        surfaces = [];
        for(let i = 1; i <= surfaceCount; i++) {
            const numVertices = parseInt(document.getElementById(`num-vertices-s${i}`).value);
            const surfaceVertices = document.getElementById(`vertices-s${i}`).value.split(",")
                .map(vertexId => parseInt(vertexId.trim()));
            
            surfaces.push(surfaceVertices);
        }
        
        return {numberSurfaces: surfaceCount, surfaces: surfaces};
    }

    function processJSON() { 
        var texto = document.getElementById("projection_infos").value;

        var jsonData = JSON.parse(texto);

        return jsonData;
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
                <input class="form__input" type="number" id="x${vertexCount}" name="x${vertexCount}" step="0.1" placeholder="Ex: 1.0" autocomplete"on">
                <label for="y${vertexCount}">Y:</label>
                <input class="form__input" type="number" id="y${vertexCount}" name="y${vertexCount}" step="0.1" placeholder="Ex: 2.0" autocomplete"on">
                <label for="z${vertexCount}">Z:</label>
                <input class="form__input" type="number" id="z${vertexCount}" name="z${vertexCount}" step="0.1" placeholder="Ex: 3.0" autocomplete"on">
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


    sendJsonBtn.addEventListener("click", () => { 
        jsonData = processJSON();

        const pointOfView = jsonData.pontoPerspectiva;
        p1 = jsonData.p1;
        p2 = jsonData.p2;
        p3 = jsonData.p3;
        
        verticesData = jsonData.vertices;
        surfacesData = jsonData.faces;

        [angleX, angleY, angleZ] = pointOfView;

        mObjVerticesInfo.innerHTML = verticesData.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        mObjSurfacesInfo.textContent = JSON.stringify(surfacesData)

        projectionInfos = generateProjection([angleX,angleY,angleZ], p1, p2, p3, verticesData, scaleFactor);

        normalVectorInfo.textContent = JSON.stringify(projectionInfos.normalVectorPlane);
        distancesInfo.textContent = JSON.stringify(projectionInfos.distance);
        matrixPerspectiveInfo.inerHTML = projectionInfos.perspectiveMatrix.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        homogeneousVerticesInfo.innerHTML = projectionInfos.homogeneousVertices.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        viewportVerticesInfo.innerHTML = projectionInfos.viewportCoordinates.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices, 0, 0, 0);

    });

    sendDataBtn.addEventListener("click", () => {

        const x = document.getElementById("input_a").value;
        const y = document.getElementById("input_b").value;
        const z = document.getElementById("input_c").value;

        const pointOfView = [parseFloat(x), parseFloat(y), parseFloat(z)];
        
        p1 = createVectorPoints(1);
        p2 = createVectorPoints(2);
        p3 = createVectorPoints(3);
        
        surfacesData = collectSurfaceData();
        verticesData = collectVerticesData();

        mObjVerticesInfo.innerHTML = verticesData.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        mObjSurfacesInfo.textContent = JSON.stringify(surfacesData)

        projectionInfos = generateProjection(pointOfView, p1, p2, p3, verticesData, scaleFactor);

        normalVectorInfo.textContent = JSON.stringify(projectionInfos.normalVectorPlane);
        distancesInfo.textContent = JSON.stringify(projectionInfos.distance);
        matrixPerspectiveInfo.inerHTML = projectionInfos.perspectiveMatrix.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        homogeneousVerticesInfo.innerHTML = projectionInfos.homogeneousVertices.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        viewportVerticesInfo.innerHTML = projectionInfos.viewportCoordinates.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices, 0, 0, 0);
        
    });

    scaleFactorBtn.addEventListener("click", () => {
        const sF = document.getElementById("scaleFactor").value;
        if (sF) {
            scaleFactor = sF
        }
    });

    canvas.addEventListener("focus", () => { 
        isCanvasFocused = true;
    });

    canvas.addEventListener("blur", () => { 
        isCanvasFocused = false;
    });

    document.addEventListener("keydown", (event) => {
        if(isCanvasFocused){
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)) {
                event.preventDefault();
                switch (event.key) {
                    case "ArrowUp":
                        angleY += 25;
                        break;
                    case "ArrowDown":
                        angleY -= 25;
                        break;
                    case "ArrowLeft":
                        angleX += 25;
                        break;
                    case "ArrowRight":
                        angleX -= 25;
                        break;
                    case "w":
                        angleY += 25;
                        break;
                    case "s":
                        angleY -= 25;
                        break;
                    case "d":
                        angleX += 25;
                        break;
                    case "a":
                        angleX -= 25;
                        break;
                    default:
                        break;
                }
                projectionInfos = generateProjection([angleX,angleY,angleZ], p1, p2, p3, verticesData, scaleFactor)
                drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices);
            }
        }
    });

    cubeExampleBtn.addEventListener("click", () => {

        angleX = 30;
        angleY = 120;
        angleZ = 200;
        
        verticesData = [
            [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
            [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
        ];

        surfacesData = {
            numberSurface: 6,
            surfaces:     [
                [0, 1, 2, 3], 
                [4, 5, 6, 7], 
                [0, 1, 5, 4], 
                [3, 2, 6, 7], 
                [0, 3, 7, 4], 
                [1, 2, 6, 5]  
            ]};        
        
        // mObjVerticesInfo.textContent = JSON.stringify(verticesData)
        mObjVerticesInfo.innerHTML = verticesData.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        mObjSurfacesInfo.textContent = JSON.stringify(surfacesData)

        projectionInfos = generateProjection([angleX,angleY,angleZ], [1,0,0], [0,0,0], [0,1,0], verticesData, scaleFactor);

        normalVectorInfo.textContent = JSON.stringify(projectionInfos.normalVectorPlane);
        distancesInfo.textContent = JSON.stringify(projectionInfos.distance);
        matrixPerspectiveInfo.inerHTML = projectionInfos.perspectiveMatrix.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        homogeneousVerticesInfo.innerHTML = projectionInfos.homogeneousVertices.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        viewportVerticesInfo.innerHTML = projectionInfos.viewportCoordinates.map(subarray => `[${subarray.join(', ')}]`).join('<br>');

        drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices);
    });

    octhaedronExampleBtn.addEventListener("click", () => {

        angleX = 30;
        angleY = 20;
        angleZ = 200;

       verticesData = [
            [0, 1, 0],   
            [0, -1, 0],  
            [1, 0, 0],  
            [-1, 0, 0],  
            [0, 0, 1],   
            [0, 0, -1],  
        ];

        surfacesData = {
            numberSurface: 8,
            surfaces: [
                [0, 2, 4],  
                [0, 4, 3],  
                [0, 3, 5],  
                [0, 5, 2],
                [1, 2, 4],  
                [1, 4, 3],  
                [1, 3, 5],  
                [1, 5, 2],  
            ]
        };
        
        mObjVerticesInfo.innerHTML = verticesData.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        mObjSurfacesInfo.textContent = JSON.stringify(surfacesData)

        projectionInfos = generateProjection([angleX,angleY,angleZ], [1,0,0], [0,0,0], [0,1,0], verticesData, scaleFactor);

        normalVectorInfo.textContent = JSON.stringify(projectionInfos.normalVectorPlane);
        distancesInfo.textContent = JSON.stringify(projectionInfos.distance);
        matrixPerspectiveInfo.inerHTML = projectionInfos.perspectiveMatrix.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        homogeneousVerticesInfo.innerHTML = projectionInfos.homogeneousVertices.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        viewportVerticesInfo.innerHTML = projectionInfos.viewportCoordinates.map(subarray => `[${subarray.join(', ')}]`).join('<br>');

        drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices);
    });

    pyramidExampleBtn.addEventListener("click", () => {
        angleX = 4;
        angleY = 1;
        angleZ = 200;
        scaleFactor = 100;

        verticesData = [
            [1,1,1,1], 
            [7,1,1,1], 
            [7,1,7,1], 
            [1,1,7,1],
            [4,7,4,1],        
        ];

        surfacesData = {
            numberSurface: 5,
            surfaces: [
                [3,2,4], 
                [2,1,4], 
                [4,1,0], 
                [3,4,0], 
                [3,0,1,2]  
            ]};
        
        mObjVerticesInfo.innerHTML = verticesData.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        mObjSurfacesInfo.textContent = JSON.stringify(surfacesData)

        projectionInfos = generateProjection([angleX,angleY,angleZ], [1,0,0], [0,0,0], [0,1,0], verticesData, scaleFactor);

        normalVectorInfo.textContent = JSON.stringify(projectionInfos.normalVectorPlane);
        distancesInfo.textContent = JSON.stringify(projectionInfos.distance);
        matrixPerspectiveInfo.inerHTML = projectionInfos.perspectiveMatrix.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        homogeneousVerticesInfo.innerHTML = projectionInfos.homogeneousVertices.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        viewportVerticesInfo.innerHTML = projectionInfos.viewportCoordinates.map(subarray => `[${subarray.join(', ')}]`).join('<br>');

        drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices);
    });

    triangularPrismExampleBtn.addEventListener("click", () => {

        angleX = 10;
        angleY = 100;
        angleZ = 200;

        verticesData = [
            [-1, -1, -1], 
            [1, -1, -1],  
            [0, 1, -1],   
            [-1, -1, 1],  
            [1, -1, 1],   
            [0, 1, 1]     
        ];

        surfacesData = {
            numberSurface: 5,
            surfaces: [
                [0, 1, 2],
                [3, 4, 5], 
                [0, 1, 4, 3], 
                [1, 2, 5, 4],
                [2, 0, 3, 5]  
            ]
        };

        mObjVerticesInfo.innerHTML = verticesData.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        mObjSurfacesInfo.textContent = JSON.stringify(surfacesData)

        projectionInfos = generateProjection([angleX,angleY,angleZ], [1,0,0], [0,0,0], [0,1,0], verticesData, scaleFactor);

        normalVectorInfo.textContent = JSON.stringify(projectionInfos.normalVectorPlane);
        distancesInfo.textContent = JSON.stringify(projectionInfos.distance);
        matrixPerspectiveInfo.inerHTML = projectionInfos.perspectiveMatrix.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        homogeneousVerticesInfo.innerHTML = projectionInfos.homogeneousVertices.map(subarray => `[${subarray.join(', ')}]`).join('<br>');
        viewportVerticesInfo.innerHTML = projectionInfos.viewportCoordinates.map(subarray => `[${subarray.join(', ')}]`).join('<br>');

        drawProjection(surfacesData.surfaces, projectionInfos.scaledAndCenteredVertices);
    });
});




    

  

  