// --- Paste the generated countryCodeMap here ---
const countryCodeMap = {
    "GN": "GIN",
    "CY": "CYP",
    "FJ": "FJI",
    "PG": "PNG",
    "VE": "VEN",
    "ML": "MLI",
    "SD": "SDN",
    "FI": "FIN",
    "GW": "GNB",
    "SZ": "SWZ",
    "EC": "ECU",
    "RO": "ROU",
    "DZ": "DZA",
    "CA": "CAN",
    "GH": "GHA",
    "SV": "SLV",
    "BN": "BRN",
    "SN": "SEN",
    "EG": "EGY",
    "JO": "JOR",
    "BG": "BGR",
    "KR": "KOR",
    "BA": "BIH",
    "NL": "NLD",
    "OM": "OMN",
    "SL": "SLE",
    "IT": "ITA",
    "AT": "AUT",
    "AF": "AFG",
    "GQ": "GNQ",
    "MZ": "MOZ",
    "KW": "KWT",
    "RW": "RWA",
    "NG": "NGA",
    "PR": "PRI",
    "NI": "NIC",
    "PA": "PAN",
    "BO": "BOL",
    "BZ": "BLZ",
    "GL": "GRL",
    "CL": "CHL",
    "MY": "MYS",
    "GB": "GBR",
    "MX": "MEX",
    "AZ": "AZE",
    "GT": "GTM",
    "UY": "URY",
    "IE": "IRL",
    "NE": "NER",
    "DK": "DNK",
    "CZ": "CZE",
    "XK": "XKX",
    "LT": "LTU",
    "JP": "JPN",
    "CR": "CRI",
    "BW": "BWA",
    "CF": "CAF",
    "LB": "LBN",
    "BR": "BRA",
    "MN": "MNG",
    "SR": "SUR",
    "AR": "ARG",
    "IS": "ISL",
    "DO": "DOM",
    "CN": "CHN",
    "SA": "SAU",
    "TR": "TUR",
    "ZA": "ZAF",
    "IR": "IRN",
    "LY": "LBY",
    "SO": "SOM",
    "MA": "MAR",
    "AL": "ALB",
    "SI": "SVN",
    "TJ": "TJK",
    "MG": "MDG",
    "IN": "IND",
    "PL": "POL",
    "TN": "TUN",
    "BY": "BLR",
    "SE": "SWE",
    "DJ": "DJI",
    "LK": "LKA",
    "QA": "QAT",
    "AO": "AGO",
    "BF": "BFA",
    "MT": "MLT",
    "DE": "DEU",
    "ZW": "ZWE",
    "LR": "LBR",
    "CU": "CUB",
    "IQ": "IRQ",
    "LS": "LSO",
    "GF": "GUF",
    "RU": "RUS",
    "ME": "MNE",
    "AE": "ARE",
    "KZ": "KAZ",
    "NO": "NOR",
    "TD": "TCD",
    "AM": "ARM",
    "GY": "GUY",
    "KP": "PRK",
    "HT": "HTI",
    "KH": "KHM",
    "NZ": "NZL",
    "TH": "THA",
    "UG": "UGA",
    "VN": "VNM",
    "CH": "CHE",
    "ES": "ESP",
    "IL": "ISR",
    "FR": "FRA",
    "PK": "PAK",
    "EE": "EST",
    "PE": "PER",
    "UZ": "UZB",
    "GE": "GEO",
    "MR": "MRT",
    "BD": "BGD",
    "SY": "SYR",
    "AU": "AUS",
    "YE": "YEM",
    "CO": "COL",
    "CM": "CMR",
    "LU": "LUX",
    "BM": "BMU",
    "HN": "HND",
    "ZM": "ZMB",
    "BE": "BEL",
    "KE": "KEN",
    "TM": "TKM",
    "MD": "MDA",
    "LV": "LVA",
    "BJ": "BEN",
    "BT": "BTN",
    "HU": "HUN",
    "ET": "ETH",
    "HR": "HRV",
    "GM": "GMB",
    "KG": "KGZ",
    "PT": "PRT",
    "GR": "GRC",
    "LA": "LAO",
    "JM": "JAM",
    "BI": "BDI",
    "NP": "NPL",
    "PY": "PRY",
    "ER": "ERI",
    "VU": "VUT",
    "ID": "IDN",
    "GA": "GAB",
    "TT": "TTO",
    "SK": "SVK",
    "MW": "MWI",
    "PH": "PHL",
    "TG": "TGO",
    "UA": "UKR",
    "SB": "SLB",
    "NC": "NCL",
    };
    
    let scene, camera, renderer, globe, controls, globeGroup;
    let points = [], heatmap = [], mode = "points";
    let covidData = [], maxDate = 30, currentDateIndex = 30;
    const GLOBE_RADIUS = 1;
    const POINT_RADIUS = 0.015;
    const HEATMAP_SCALE = 1; // Scaling is now done in showHeatmap
    const OUTLINE_COLOR = 0x444444;
    
    const countryGeometryCache = new Map(); // Cache for country geometries
    
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
        controls.minDistance = 1.2;
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
            if (!response.ok) throw new Error('Failed to load data');
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
    
            const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS + 0.01); // Slightly above the globe
            const color = getColorByCases(country.data[currentDateIndex].new_cases || 0);
            const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
            const point = new THREE.Mesh(new THREE.SphereGeometry(POINT_RADIUS, 8, 8), material);
            point.position.copy(position);
            point.userData = {
                country: country.country,
                ...country.data[currentDateIndex]
            };
            globeGroup.add(point);
            points.push(point);
        });
    }
    
    // --- CORRECTED loadCountryShape ---
    async function loadCountryShape(geojsonId) {
        if (countryGeometryCache.has(geojsonId)) {
            return countryGeometryCache.get(geojsonId);
        }
    
        try {
            const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
            if (!response.ok) throw new Error(`Failed to load GeoJSON: ${response.status}`);
            const geojsonData = await response.json();
    
            const countryData = geojsonData.features.find(f => f.properties.ISO_A3 === geojsonId);
    
            if (!countryData) {
                console.warn(`No GeoJSON data found for ${geojsonId}`);
                return null;
            }
    
            const shape = new THREE.Shape();
            let firstPoint = true;
    
            const processCoordinates = (coords, depth = 0) => {
              coords.forEach(point => {
                if(Array.isArray(point[0])){
                  processCoordinates(point, depth + 1);
                } else {
                  const [lon, lat] = point;
                  const vec = latLongToVector3(lat, lon, GLOBE_RADIUS);
    
                  if(firstPoint){
                    shape.moveTo(vec.x, vec.y);
                    firstPoint = false;
                  } else {
                    shape.lineTo(vec.x, vec.y);
                  }
                }
              });
              if(depth > 0) shape.closePath();
            };
    
            if (countryData.geometry.type === 'MultiPolygon') {
                countryData.geometry.coordinates.forEach(polygon => {
                  processCoordinates(polygon);
                });
            } else {
              processCoordinates(countryData.geometry.coordinates);
            }
    
            const geometry = new THREE.ShapeGeometry(shape);
            countryGeometryCache.set(geojsonId, geometry);
            return geometry;
    
        } catch (error) {
            console.error('Error loading or processing GeoJSON:', error);
            return null;
        }
    }
    
    // --- CORRECTED showHeatmap ---
    function showHeatmap() {
        if (!covidData.length) return;
    
        heatmap.forEach(h => globeGroup.remove(h));
        heatmap = [];
    
        const maxCases = Math.max(...covidData.map(c => c.data[currentDateIndex]?.new_cases || 0));
    
        covidData.forEach(country => {
            const geojsonId = countryCodeMap[country.country_code];
            if (!geojsonId || !country.data[currentDateIndex]) return;
    
            const cases = country.data[currentDateIndex].new_cases;
            const color = new THREE.Color().setHSL(0.6 - (cases / maxCases * 0.6), 0.8, 0.5);
    
            loadCountryShape(geojsonId).then(geometry => {
                if (!geometry) return;
    
                const material = new THREE.MeshPhongMaterial({
                    color,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide // Render both sides - CRITICAL for fixing mirroring
                });
    
                const mesh = new THREE.Mesh(geometry, material);
    
    
                // --- Correct Positioning and Scaling ---
                geometry.computeBoundingBox(); // Compute the bounding box of the geometry
                const centroid = new THREE.Vector3();
                geometry.boundingBox.getCenter(centroid); // Get the center of the bounding box
    
                const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS, 0.01); // Use reported centroid, but add height
                geometry.translate(-centroid.x, -centroid.y, -centroid.z); // Translate to the origin
                mesh.position.copy(position);
                mesh.lookAt(0, 0, 0);
                mesh.scale.setScalar(HEATMAP_SCALE);
    
    
                globeGroup.add(mesh);
                heatmap.push(mesh);
            });
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
    //Corrected height
    function latLongToVector3(lat, lon, radius = GLOBE_RADIUS, height = 0.01) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
    
        const x = -(radius + height) * Math.sin(phi) * Math.cos(theta);
        const y = (radius + height) * Math.cos(phi);
        const z = (radius + height) * Math.sin(phi) * Math.sin(theta);
    
        return new THREE.Vector3(x, y, z);
    }
    
    function getColorByCases(cases) {
        const hue = 240 - Math.min(cases * 0.1, 240); // Blue to red
        return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
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
    
        const mouse = new THREE.Vector3();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        mouse.z = 0.5;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([...points, ...heatmap]); // Check both points and heatmap
    
        if (intersects.length > 0) {
            // Prefer userData, but fall back to parent.userData if necessary (for heatmap)
            let countryData = intersects[0].object.userData;
            if (!countryData || !countryData.country) {
              countryData = intersects[0].object.parent.userData //Try get data from parent
            }
            if (!countryData || !countryData.country) return; //If still no data, return
    
            tooltip.style.opacity = 1;
            tooltip.innerHTML = `
                ${countryData.country} <br/>
                New cases: ${countryData.new_cases.toLocaleString()} <br/>
                Total cases: ${countryData.cumulative_cases.toLocaleString()}
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