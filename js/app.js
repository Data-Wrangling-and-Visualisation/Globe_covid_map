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
    window.addEventListener('mousemove', onMouseMove);
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

        maxDate = covidData[0].data.length - 1;
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
        if (!country.data || !country.data[currentDateIndex]) return;

        const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS * 1.02);
        const color = getColorByCases(country.data[currentDateIndex].new_cases || 0);
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
        const point = new THREE.Mesh(new THREE.SphereGeometry(POINT_RADIUS, 8, 8), material);

        point.position.copy(position);
        point.userData = country.data[currentDateIndex];
        globeGroup.add(point);
        points.push(point);
    });
}

function showHeatmap() {
    if (!covidData || covidData.length === 0) return;

    const positions = [];
    const colors = [];
    const sizes = [];

    covidData.forEach(country => {
        if (!country.data || !country.data[currentDateIndex]) return;

        const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS * 1.02);
        const intensity = (country.data[currentDateIndex].new_cases || 0) / 1000;

        positions.push(position.x, position.y, position.z);
        colors.push(...getColorByCases(intensity).toArray());
        sizes.push(intensity * 0.1);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });

    const heatmapPoints = new THREE.Points(geometry, material);
    globeGroup.add(heatmapPoints);
    heatmap.push(heatmapPoints);
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
            labels: covidData[0].data.map(d => d.date),
            datasets: [{
                label: 'New Cases',
                data: covidData[0].data.map(d => d.new_cases),
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

function onMouseMove(event) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;

    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(points);
    if (intersects.length > 0) {
        const country = intersects[0].object.userData;
        tooltip.style.opacity = 1;
        tooltip.innerHTML = `
            <strong>${country.country}</strong><br>
            New cases: ${country.new_cases.toLocaleString()}<br>
            Total cases: ${country.cumulative_cases.toLocaleString()}
        `;
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
    } else {
        tooltip.style.opacity = 0;
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}