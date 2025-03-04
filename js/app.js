let scene, camera, renderer, globe, controls, globeGroup;
let points = [], heatmap = [], mode = "points";
let covidData = [], maxDate = 30, currentDateIndex = 30;

const GLOBE_RADIUS = 1;
const POINT_RADIUS = 0.015;

init();
loadData();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 1;
    controls.maxDistance = 4;

    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    setupLighting();
    createGlobe();

    document.getElementById('dateSlider').addEventListener('input', updateDate);
    document.getElementById('heatmapBtn').addEventListener('click', () => switchMode("heatmap"));
    document.getElementById('pointsBtn').addEventListener('click', () => switchMode("points"));
    document.getElementById('chartBtn').addEventListener('click', showCharts);

    window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
}

function createGlobe() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        (texture) => {
            const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
            const material = new THREE.MeshPhongMaterial({ map: texture });
            globe = new THREE.Mesh(geometry, material);
            globeGroup.add(globe);
        }
    );
}

async function loadData() {
    try {
        const response = await fetch('data/processed_data_date.json');
        if (!response.ok) throw new Error('Failed to load');
        covidData = await response.json();

        // Отладочный вывод
        console.log('Loaded data:', covidData);

        // Проверка структуры данных
        if (!covidData || !Array.isArray(covidData) || covidData.length === 0) {
            throw new Error('Invalid data: COVID data is empty or not an array');
        }

        // Проверка, что у первой страны есть данные
        if (!covidData[0].data || !Array.isArray(covidData[0].data)) {
            throw new Error('Invalid data: Missing "data" array in the first country');
        }

        maxDate = covidData[0].data.length - 1; // Используем ключ "data"
        document.getElementById('dateSlider').max = maxDate;
        updateDate();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function updateDate() {
    currentDateIndex = document.getElementById('dateSlider').value;
    document.getElementById('dateLabel').textContent = `Day: ${currentDateIndex}`;

    clearPoints();
    if (mode === "points") showPoints();
    else if (mode === "heatmap") showHeatmap();
}

function showPoints() {
    if (!covidData || covidData.length === 0) return;

    covidData.forEach(country => {
        if (!country.data || !country.data[currentDateIndex]) return; // Используем ключ "data"

        const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS * 1.02);
        const color = getColorByCases(country.data[currentDateIndex].new_cases || 0); // Используем ключ "data"
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
        const point = new THREE.Mesh(new THREE.SphereGeometry(POINT_RADIUS, 8, 8), material);

        point.position.copy(position);
        point.userData = country.data[currentDateIndex]; // Используем ключ "data"
        globeGroup.add(point);
        points.push(point);
    });
}

function showHeatmap() {
    if (!covidData || covidData.length === 0) return;

    covidData.forEach(country => {
        if (!country.data || !country.data[currentDateIndex]) return; // Используем ключ "data"

        const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS * 1.02);
        const intensity = (country.data[currentDateIndex].new_cases || 0) / 1000; // Используем ключ "data"
        const material = new THREE.SpriteMaterial({ color: getColorByCases(intensity), transparent: true, opacity: 0.5 });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.1 + intensity, 0.1 + intensity, 1);
        sprite.position.copy(position);
        globeGroup.add(sprite);
        heatmap.push(sprite);
    });
}

function switchMode(newMode) {
    mode = newMode;
    updateDate();
}

function showCharts() {
    const modal = document.getElementById('chartModal');
    modal.style.display = 'block';

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: covidData[0].data.map(d => d.date), // Используем ключ "data"
            datasets: [{
                label: 'New Cases',
                data: covidData[0].data.map(d => d.new_cases), // Используем ключ "data"
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    document.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
        chart.destroy();
    };
}

function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

function getColorByCases(cases) {
    return new THREE.Color(`hsl(${Math.max(0, 120 - cases * 2)}, 100%, 50%)`);
}

function clearPoints() {
    points.forEach(p => globeGroup.remove(p));
    heatmap.forEach(h => globeGroup.remove(h));
    points = [];
    heatmap = [];
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}