// js/app.js
let scene, camera, renderer, globe, controls;
let points = [];
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let tooltip = document.getElementById('tooltip');

// Конфигурация
const GLOBE_RADIUS = 1;
const POINT_RADIUS = 0.015;
const POINT_COLOR = 0xff4444;

init();
animate();

function init() {
    // Инициализация сцены
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Настройка камеры
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 2.5;

    // Настройка рендерера
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Инициализация управления
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;

    // Создание глобуса с альтернативной текстурой
    createGlobe();

    // Освещение
    setupLighting();

    // Загрузка данных
    loadData();

    // Обработчики событий
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
}

function createGlobe() {
    // Используем встроенную текстуру как fallback
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
        (texture) => {
            const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
            const material = new THREE.MeshPhongMaterial({
                map: texture,
                bumpScale: 0.05,
                specular: new THREE.Color('grey'),
                shininess: 5
            });
            
            globe = new THREE.Mesh(geometry, material);
            scene.add(globe);
        },
        undefined,
        (err) => {
            console.error('Error loading texture:', err);
            // Fallback: простой синий глобус
            const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color: 0x2233ff });
            globe = new THREE.Mesh(geometry, material);
            scene.add(globe);
        }
    );
}

async function loadData() {
    try {
        const response = await fetch('data/processed_data.json');
        const data = await response.json();
        
        data.forEach(country => {
            if (!country.latitude || !country.longitude) return;
            
            const position = latLongToVector3(
                country.latitude,
                country.longitude,
                GLOBE_RADIUS * 1.02
            );

            const geometry = new THREE.SphereGeometry(POINT_RADIUS, 8, 8);
            const material = new THREE.MeshBasicMaterial({ 
                color: POINT_COLOR,
                transparent: true,
                opacity: 0.8
            });
            
            const point = new THREE.Mesh(geometry, material);
            point.position.copy(position);
            point.userData = country;
            scene.add(point);
            points.push(point);
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
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

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(points);
    
    if (intersects.length > 0) {
        const country = intersects[0].object.userData;
        showTooltip(event, country);
    } else {
        hideTooltip();
    }
}

function showTooltip(event, country) {
    tooltip.style.opacity = 1;
    tooltip.innerHTML = `
        <strong>${country.country}</strong><br>
        New cases: ${country.new_cases.toLocaleString()}<br>
        Total cases: ${country.cumulative_cases.toLocaleString()}
    `;
    tooltip.style.left = `${event.clientX + 15}px`;
    tooltip.style.top = `${event.clientY + 15}px`;
}

function hideTooltip() {
    tooltip.style.opacity = 0;
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
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