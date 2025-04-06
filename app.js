// --- Data Mapping ---
const countryCodeMap = { // 2-letter to 3-letter ISO
  "GN": "GIN", "CY": "CYP", "FJ": "FJI", "PG": "PNG", "VE": "VEN", "ML": "MLI", "SD": "SDN",
  "FI": "FIN", "GW": "GNB", "SZ": "SWZ", "EC": "ECU", "RO": "ROU", "DZ": "DZA", "CA": "CAN",
  "GH": "GHA", "SV": "SLV", "BN": "BRN", "SN": "SEN", "EG": "EGY", "JO": "JOR", "BG": "BGR",
  "KR": "KOR", "BA": "BIH", "NL": "NLD", "OM": "OMN", "SL": "SLE", "IT": "ITA", "AT": "AUT",
  "AF": "AFG", "GQ": "GNQ", "MZ": "MOZ", "KW": "KWT", "RW": "RWA", "NG": "NGA", "PR": "PRI",
  "NI": "NIC", "PA": "PAN", "BO": "BOL", "BZ": "BLZ", "GL": "GRL", "CL": "CHL", "MY": "MYS",
  "GB": "GBR", "MX": "MEX", "AZ": "AZE", "GT": "GTM", "UY": "URY", "IE": "IRL", "NE": "NER",
  "DK": "DNK", "CZ": "CZE", "XK": "XKX", "LT": "LTU", "JP": "JPN", "CR": "CRI", "BW": "BWA",
  "CF": "CAF", "LB": "LBN", "BR": "BRA", "MN": "MNG", "SR": "SUR", "AR": "ARG", "IS": "ISL",
  "DO": "DOM", "CN": "CHN", "SA": "SAU", "TR": "TUR", "ZA": "ZAF", "IR": "IRN", "LY": "LBY",
  "SO": "SOM", "MA": "MAR", "AL": "ALB", "SI": "SVN", "TJ": "TJK", "MG": "MDG", "IN": "IND",
  "PL": "POL", "TN": "TUN", "BY": "BLR", "SE": "SWE", "DJ": "DJI", "LK": "LKA", "QA": "QAT",
  "AO": "AGO", "BF": "BFA", "MT": "MLT", "DE": "DEU", "ZW": "ZWE", "LR": "LBR", "CU": "CUB",
  "IQ": "IRQ", "LS": "LSO", "GF": "GUF", "RU": "RUS", "ME": "MNE", "AE": "ARE", "KZ": "KAZ",
  "NO": "NOR", "TD": "TCD", "AM": "ARM", "GY": "GUY", "KP": "PRK", "HT": "HTI", "KH": "KHM",
  "NZ": "NZL", "TH": "THA", "UG": "UGA", "VN": "VNM", "CH": "CHE", "ES": "ESP", "IL": "ISR",
  "FR": "FRA", "PK": "PAK", "EE": "EST", "PE": "PER", "UZ": "UZB", "GE": "GEO", "MR": "MRT",
  "BD": "BGD", "SY": "SYR", "AU": "AUS", "YE": "YEM", "CO": "COL", "CM": "CMR", "LU": "LUX",
  "BM": "BMU", "HN": "HND", "ZM": "ZMB", "BE": "BEL", "KE": "KEN", "TM": "TKM", "MD": "MDA",
  "LV": "LVA", "BJ": "BEN", "BT": "BTN", "HU": "HUN", "ET": "ETH", "HR": "HRV", "GM": "GMB",
  "KG": "KGZ", "PT": "PRT", "GR": "GRC", "LA": "LAO", "JM": "JAM", "BI": "BDI", "NP": "NPL",
  "PY": "PRY", "ER": "ERI", "VU": "VUT", "ID": "IDN", "GA": "GAB", "TT": "TTO", "SK": "SVK",
  "MW": "MWI", "PH": "PHL", "TG": "TGO", "UA": "UKR", "SB": "SLB", "NC": "NCL"
};
// Create reverse map for easy lookup: ISO_A3 -> ISO_A2
const iso3ToIso2Map = Object.fromEntries(Object.entries(countryCodeMap).map(([key, value]) => [value, key]));

// --- Global Variables ---
let scene, camera, renderer, globe, controls, globeGroup;
let points = []; // Array for THREE.js point meshes
let currentMode = "points"; // "points" or "heatmap" (heatmap now refers to the flat map modal)
let covidData = [], maxDate = 0, currentDateIndex = 0;
let maxCasesCurrentDate = 0; // Max cases for the currently selected date

// --- Globe Constants ---
const GLOBE_RADIUS = 1;
const POINT_RADIUS = 0.008; // Made points slightly smaller
const OUTLINE_COLOR = 0x444444;

// --- Color Constants ---
const LOW_COLOR_HEX = 0x00FF00; // Green
const MEDIUM_COLOR_HEX = 0xADFF2F; // Yellow-Green
const HIGH_COLOR_HEX = 0xFFFF00; // Yellow
const VERY_HIGH_COLOR_HEX = 0xFFA500; // Orange
const EXTREME_COLOR_HEX = 0xFF0000; // Red
const NO_DATA_COLOR_HEX = 0x808080; // Grey for no data

// --- Chart Variables ---
let casesChart, cumulativeChart, countryChart;

// --- Flat Map Variables ---
let flatMap; // Leaflet map instance
let geoJsonLayer; // Leaflet GeoJSON layer
let geoJsonData; // Store loaded GeoJSON data

// --- Initialization ---
initGlobe();
loadCovidData(); // Load data first
loadGeoJsonData(); // Load GeoJSON needed for the flat map
animate();

// === GLOBE SETUP ===

function initGlobe() {
  const container = document.getElementById('globe-container');
  scene = new THREE.Scene();
  scene.background = null; // Make background transparent

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 2.5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable alpha for transparency
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1.2;
  controls.maxDistance = 5; // Increased max zoom out
  controls.rotateSpeed = 0.3;

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  setupLighting();
  createGlobeMesh();

  // --- Event Listeners ---
  document.getElementById('dateSlider').addEventListener('input', onSliderChange);
  document.getElementById('dateInput').addEventListener('change', onDateInputChange);
  document.getElementById('heatmapBtn').addEventListener('click', showFlatMapModal); // Changed action
  document.getElementById('pointsBtn').addEventListener('click', showGlobePoints);
  document.getElementById('chartBtn').addEventListener('click', showChartsModal);
  document.querySelector('.chart-close').addEventListener('click', hideChartsModal);
  document.querySelector('.flatmap-close').addEventListener('click', hideFlatMapModal);

  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('mousemove', onMouseMoveGlobe); // Attach to canvas for better precision
}

function setupLighting() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.7)); // Softer ambient light
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);
}

function createGlobeMesh() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
      'PathfinderMap.jpg', // Different texture
      (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace; // Correct color space
          const geometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
          const material = new THREE.MeshPhongMaterial({
              map: texture,
              shininess: 5 // Reduce shininess
          });
          globe = new THREE.Mesh(geometry, material);
          globeGroup.add(globe);

          // Add a subtle outline or atmosphere
          const atmosphereMaterial = new THREE.ShaderMaterial({
               vertexShader: `
                  varying vec3 vNormal;
                  void main() {
                      vNormal = normalize( normalMatrix * normal );
                      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                  }
              `,
              fragmentShader: `
                  varying vec3 vNormal;
                  void main() {
                      float intensity = pow( 0.7 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0 );
                      gl_FragColor = vec4( 0.3, 0.6, 1.0, 1.0 ) * intensity * 0.6; // Blueish glow
                  }
              `,
              side: THREE.BackSide,
              blending: THREE.AdditiveBlending,
              transparent: true,
              depthWrite: false
          });
           const atmosphere = new THREE.Mesh(geometry.clone(), atmosphereMaterial);
           atmosphere.scale.set(1.05, 1.05, 1.05);
           scene.add(atmosphere); // Add atmosphere directly to scene, not globeGroup

      },
      undefined, // Progress callback (optional)
      (error) => console.error('Error loading globe texture:', error)
  );
}

// === DATA LOADING ===

async function loadCovidData() {
console.log("Loading COVID data...");
try {
  // Ensure path is correct relative to the HTML file
  const response = await fetch('data/processed_data_date.json');
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  covidData = await response.json();
  console.log("COVID data loaded:", covidData.length, "countries");

  if (covidData.length > 0 && covidData[0].data && covidData[0].data.length > 0) {
    maxDate = covidData[0].data.length - 1;
    document.getElementById('dateSlider').max = maxDate;
    currentDateIndex = maxDate; // Start at the most recent date
    document.getElementById('dateSlider').value = currentDateIndex;
    updateDateLabel();
    updateVisualization(); // Initial visualization
  } else {
      console.error("COVID data is empty or has incorrect format.");
      document.getElementById('dateLabel').textContent = "Error loading data";
  }

} catch (error) {
  console.error('Error loading COVID data:', error);
  document.getElementById('dateLabel').textContent = "Error loading data";
}
}

async function loadGeoJsonData() {
  console.log("Loading GeoJSON data...");
  try {
      const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      geoJsonData = await response.json();
      console.log("GeoJSON data loaded.");
      // If the flat map modal might be open on load (unlikely, but possible), update it
      if (flatMap && document.getElementById('flatmapModal').style.display === 'block') {
          updateFlatMapData();
      }
  } catch (error) {
      console.error('Error loading GeoJSON data:', error);
      // Handle the error appropriately, maybe disable the heatmap button
  }
}


// === DATE HANDLING ===

function updateDateLabel() {
  const dateLabel = document.getElementById('dateLabel');
  const dateInput = document.getElementById('dateInput');
  const flatmapDateLabel = document.getElementById('flatmapDateLabel');

  if (covidData.length > 0 && covidData[0].data && covidData[0].data[currentDateIndex]) {
      const dateStr = covidData[0].data[currentDateIndex].date; // YYYY-MM-DD format assumed from processing
      try {
          const date = new Date(dateStr + 'T00:00:00Z'); // Treat as UTC to avoid timezone issues
           if (isNaN(date.getTime())) {
              throw new Error("Invalid date string format");
          }
          const year = date.getUTCFullYear();
          const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
          const day = date.getUTCDate().toString().padStart(2, '0');
          const formattedDate = `${day}.${month}.${year}`; // DD.MM.YYYY

          dateLabel.textContent = formattedDate;
          dateInput.value = formattedDate;
          flatmapDateLabel.textContent = formattedDate; // Update flat map modal label too
      } catch (e) {
           console.error("Error parsing date:", dateStr, e);
           const fallbackDate = dateStr || "Invalid Date";
           dateLabel.textContent = fallbackDate;
           dateInput.value = fallbackDate; // Show original string if parsing fails
           flatmapDateLabel.textContent = fallbackDate;
      }

  } else {
      dateLabel.textContent = "No Data";
      dateInput.value = "";
      flatmapDateLabel.textContent = "N/A";
  }
}

function onSliderChange() {
currentDateIndex = parseInt(document.getElementById('dateSlider').value, 10);
updateDateLabel();
updateVisualization();
}

function onDateInputChange() {
  const dateStr = document.getElementById('dateInput').value; // DD.MM.YYYY
  const parts = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (parts) {
      const day = parts[1].padStart(2, '0');
      const month = parts[2].padStart(2, '0');
      const year = parts[3];
      const isoDateStr = `${year}-${month}-${day}`; // Convert to YYYY-MM-DD for searching

      if (covidData.length > 0 && covidData[0].data) {
          const newIndex = covidData[0].data.findIndex(item => item.date === isoDateStr);

          if (newIndex !== -1) {
              currentDateIndex = newIndex;
              document.getElementById('dateSlider').value = currentDateIndex;
              updateDateLabel(); // Update label to confirm
              updateVisualization();
          } else {
              alert(`Date ${dateStr} not found in the dataset.`);
              // Revert input to the current valid date
              updateDateLabel();
          }
      }
  } else {
      alert('Invalid date format. Please use DD.MM.YYYY.');
      // Revert input to the current valid date
      updateDateLabel();
  }
}

// === VISUALIZATION LOGIC ===

function updateVisualization() {
  console.log(`Updating visualization for mode: ${currentMode}, date index: ${currentDateIndex}`);
  calculateMaxCasesForDate(); // Calculate max cases for the current date for scaling
  createLegend(); // Update legend based on new max cases

  if (currentMode === "points") {
      clearGlobePoints();
      showGlobePoints();
      // Ensure flat map is hidden
      hideFlatMapModal();
      // Show points legend, hide heatmap legend
      document.getElementById('points-legend').style.display = 'block';
      document.getElementById('heatmap-legend').style.display = 'none';
       // Make sure globe container is visible
      document.getElementById('globe-container').style.display = 'block';

  } else if (currentMode === "heatmap") {
      // The actual heatmap is now on the flat map modal
      // We might want to clear the globe points when heatmap modal is shown
      clearGlobePoints();
      // Update the flat map data if the modal is currently open
      if (flatMap && document.getElementById('flatmapModal').style.display === 'block') {
          updateFlatMapData();
      }
       // Hide points legend, show heatmap legend (though heatmap is on modal now)
       // Maybe hide both legends when flatmap is open? Or show a specific flatmap legend?
       // Let's hide the globe legends when the flatmap modal is intended.
      document.getElementById('points-legend').style.display = 'none';
      document.getElementById('heatmap-legend').style.display = 'none';
      // Optionally hide the globe container when flat map is showing? Or keep it behind?
      // Keeping it behind seems fine as the modal covers it.
      // document.getElementById('globe-container').style.display = 'none';

  }
}

function calculateMaxCasesForDate() {
   if (!covidData || covidData.length === 0 || !covidData[0].data[currentDateIndex]) {
      maxCasesCurrentDate = 0;
      return;
  }
   maxCasesCurrentDate = Math.max(0, ...covidData.map(c => c.data[currentDateIndex]?.new_cases || 0));
   console.log("Max cases for current date:", maxCasesCurrentDate);
}

function createLegend() {
  if (!covidData.length) return;

  // Use maxCasesCurrentDate for dynamic thresholds
  const maxCases = maxCasesCurrentDate > 0 ? maxCasesCurrentDate : 1; // Avoid division by zero

  // Define thresholds (adjust percentages as needed)
  const mediumThreshold = Math.max(1, Math.round(maxCases * 0.05)); // 5%
  const highThreshold = Math.max(mediumThreshold + 1, Math.round(maxCases * 0.25)); // 25%
  const veryHighThreshold = Math.max(highThreshold + 1, Math.round(maxCases * 0.60)); // 60%
  const extremeThreshold = Math.max(veryHighThreshold + 1, Math.round(maxCases * 0.90)); // 90%


  const formatNumber = (num) => num.toLocaleString(); // Helper for formatting

  const legendHtml = `
      <strong>New Cases Legend:</strong>
      <div><span style="background: #${LOW_COLOR_HEX.toString(16).padStart(6, '0')};"></span> 0 - ${formatNumber(mediumThreshold -1)}</div>
      <div><span style="background: #${MEDIUM_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(mediumThreshold)} - ${formatNumber(highThreshold -1)}</div>
      <div><span style="background: #${HIGH_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(highThreshold)} - ${formatNumber(veryHighThreshold - 1)}</div>
      <div><span style="background: #${VERY_HIGH_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(veryHighThreshold)} - ${formatNumber(extremeThreshold - 1)}</div>
      <div><span style="background: #${EXTREME_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(extremeThreshold)}+</div>
      <div><span style="background: #${NO_DATA_COLOR_HEX.toString(16).padStart(6, '0')}; border: 1px solid #fff;"></span> No Data</div>
  `;

  // Update both globe legends (only one will be visible based on mode)
  const globeLegendPoints = document.getElementById('points-legend');
  const globeLegendHeatmap = document.getElementById('heatmap-legend'); // This one is likely unused now but kept for structure
  if (globeLegendPoints) globeLegendPoints.innerHTML = legendHtml;
  if (globeLegendHeatmap) globeLegendHeatmap.innerHTML = legendHtml; // Update structure if needed

   // Update the flat map legend specifically
  const flatmapLegendDiv = document.getElementById('flatmap-legend');
  if (flatmapLegendDiv) {
      flatmapLegendDiv.innerHTML = `
          <strong>New Cases:</strong>
          <div><span style="background: #${LOW_COLOR_HEX.toString(16).padStart(6, '0')};"></span> 0-${formatNumber(mediumThreshold -1)}</div>
          <div><span style="background: #${MEDIUM_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(mediumThreshold)}-${formatNumber(highThreshold -1)}</div>
          <div><span style="background: #${HIGH_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(highThreshold)}-${formatNumber(veryHighThreshold - 1)}</div>
          <div><span style="background: #${VERY_HIGH_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(veryHighThreshold)}-${formatNumber(extremeThreshold - 1)}</div>
          <div><span style="background: #${EXTREME_COLOR_HEX.toString(16).padStart(6, '0')};"></span> ${formatNumber(extremeThreshold)}+</div>
          <div><span style="background: #${NO_DATA_COLOR_HEX.toString(16).padStart(6, '0')}; border: 1px solid #555;"></span> No Data</div>
      `;
  }

   // Control visibility based on currentMode
   if (currentMode === 'points') {
      if (globeLegendPoints) globeLegendPoints.style.display = 'block';
      if (globeLegendHeatmap) globeLegendHeatmap.style.display = 'none';
   } else { // When heatmap is selected (flat map modal)
      if (globeLegendPoints) globeLegendPoints.style.display = 'none';
      if (globeLegendHeatmap) globeLegendHeatmap.style.display = 'none'; // Hide globe legends
   }
}


function showGlobePoints() {
  currentMode = "points";
  updateVisualization(); // This will handle clearing, showing points, and legends
  document.getElementById('globe-container').style.display = 'block'; // Ensure globe is visible
}


function clearGlobePoints() {
  points.forEach(p => {
      if (p.geometry) p.geometry.dispose();
      if (p.material) p.material.dispose();
      globeGroup.remove(p);
  });
  points = [];
}

function showPointsOnGlobeInternal() {
  if (!covidData || covidData.length === 0 || !covidData[0].data[currentDateIndex]) {
      console.warn("No data available to show points for index:", currentDateIndex);
      return;
  }
  console.log("Showing points on globe...");

  covidData.forEach(country => {
      const dataPoint = country.data[currentDateIndex];
      if (!dataPoint || typeof country.latitude !== 'number' || typeof country.longitude !== 'number') {
          // console.warn(`Skipping point for ${country.country}: Missing data or coordinates`);
          return; // Skip if no data for this date or invalid coords
      }

      const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS);
      const cases = dataPoint.new_cases ?? null; // Use null if undefined/null
      const color = getPointColorByCases(cases); // Get THREE.Color

      const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
      const geometry = new THREE.SphereGeometry(POINT_RADIUS, 10, 10); // Slightly more detail
      const point = new THREE.Mesh(geometry, material);

      point.position.copy(position);
      point.lookAt(0, 0, 0); // Orient point slightly (optional)

      // Store data for tooltip
      point.userData = {
          type: 'dataPoint',
          country: country.country,
          country_code: country.country_code, // Store code if needed
          new_cases: cases ?? 'N/A', // Handle null for display
          cumulative_cases: dataPoint.cumulative_cases ?? 'N/A'
      };

      globeGroup.add(point);
      points.push(point);
  });
   console.log("Added", points.length, "points to the globe.");
}
// Replace the direct call in updateVisualization with this wrapper
function showGlobePoints() {
  currentMode = "points"; // Set mode
  document.getElementById('globe-container').style.display = 'block'; // Ensure globe visible
  clearGlobePoints(); // Clear previous points
  showPointsOnGlobeInternal(); // Add new points
  updateLegendVisibility(); // Update legends
}

function updateLegendVisibility() {
  const pointsLegend = document.getElementById('points-legend');
  const heatmapLegend = document.getElementById('heatmap-legend'); // Keep for structure if needed
  const flatmapModalVisible = document.getElementById('flatmapModal').style.display === 'block';

  if (flatmapModalVisible) {
      if (pointsLegend) pointsLegend.style.display = 'none';
      if (heatmapLegend) heatmapLegend.style.display = 'none';
  } else if (currentMode === 'points') {
       if (pointsLegend) pointsLegend.style.display = 'block';
       if (heatmapLegend) heatmapLegend.style.display = 'none';
  } else {
       // Default or other states (e.g., if heatmap was still on globe)
       if (pointsLegend) pointsLegend.style.display = 'none';
       if (heatmapLegend) heatmapLegend.style.display = 'none'; // Generally hide globe heatmap legend
  }
}

// --- Color Calculation (Used by both Globe Points and Flat Map) ---
function getColorByCases(cases) {
  if (cases === null || cases < 0) return NO_DATA_COLOR_HEX; // Grey for no data or negative weirdness
  if (maxCasesCurrentDate <= 0) return LOW_COLOR_HEX; // If no cases anywhere, show all as green

  // Use the same thresholds as the legend
  const maxCases = maxCasesCurrentDate;
  const mediumThreshold = Math.max(1, Math.round(maxCases * 0.05));
  const highThreshold = Math.max(mediumThreshold + 1, Math.round(maxCases * 0.25));
  const veryHighThreshold = Math.max(highThreshold + 1, Math.round(maxCases * 0.60));
  const extremeThreshold = Math.max(veryHighThreshold + 1, Math.round(maxCases * 0.90));

  if (cases === 0) return LOW_COLOR_HEX;
  if (cases < mediumThreshold) return LOW_COLOR_HEX;
  if (cases < highThreshold) return MEDIUM_COLOR_HEX;
  if (cases < veryHighThreshold) return HIGH_COLOR_HEX;
  if (cases < extremeThreshold) return VERY_HIGH_COLOR_HEX;
  return EXTREME_COLOR_HEX; // >= extremeThreshold
}

function getPointColorByCases(cases) {
  // Returns THREE.Color object
  return new THREE.Color(getColorByCases(cases));
}

function getHeatmapFillColor(cases) {
  // Returns hex color string for Leaflet
  const hexColor = getColorByCases(cases);
  return `#${hexColor.toString(16).padStart(6, '0')}`;
}


// === FLAT MAP MODAL LOGIC ===

function showFlatMapModal() {
  console.log("Showing flat map modal...");
  currentMode = "heatmap"; // Set mode conceptually
  const modal = document.getElementById('flatmapModal');
  modal.style.display = 'block';

  // Hide globe legends when flat map is open
  updateLegendVisibility();
  clearGlobePoints(); // Clear points from the globe when showing flat map

  // Initialize map ONLY if it hasn't been initialized yet
  if (!flatMap) {
      try {
          flatMap = L.map('flatmap', {
               center: [20, 0], // Initial center
               zoom: 2, // Initial zoom level
               minZoom: 2,
               maxBounds: [[-90, -180], [90, 180]], // Prevent panning outside world bounds
               worldCopyJump: true // Makes map wrap around horizontally
          });

          // Add a base tile layer (e.g., OpenStreetMap, CartoDB)
           L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', { // Minimalist tiles
              attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: 'abcd',
              maxZoom: 10 // Limit zoom
          }).addTo(flatMap);


          // Invalidate size after modal is fully shown (slight delay)
           setTimeout(() => {
               if(flatMap) flatMap.invalidateSize();
               console.log("Leaflet map initialized and size invalidated.");
               // Load data *after* map is initialized
               if (geoJsonData) {
                   updateFlatMapData(); // Load initial data
               } else {
                   console.warn("GeoJSON data not loaded yet, cannot display heatmap.");
               }
          }, 100); // Delay may need adjustment

      } catch(e) {
          console.error("Error initializing Leaflet map:", e);
          modal.style.display = 'none'; // Hide modal if init fails
          alert("Error initializing the map.");
          currentMode = "points"; // Revert mode
          updateVisualization(); // Go back to points view
      }
  } else {
      // If map already exists, just ensure size is correct and update data
      flatMap.invalidateSize();
      updateFlatMapData(); // Update with current date's data
  }
   updateDateLabel(); // Ensure date label in modal header is correct
   createLegend(); // Ensure flatmap legend inside modal is up-to-date
}


function hideFlatMapModal() {
  const modal = document.getElementById('flatmapModal');
  modal.style.display = 'none';
  // Optionally destroy map instance if performance becomes an issue,
  // but usually just hiding is fine.
  // if (flatMap) {
  //     flatMap.remove();
  //     flatMap = null;
  // }

  // When hiding the flat map, decide what to show on the globe.
  // Defaulting back to points mode seems logical based on the button actions.
  if (currentMode === "heatmap") { // Only switch back if we were conceptually in heatmap mode
     showGlobePoints(); // Explicitly switch back to points view
  }
}

function updateFlatMapData() {
  if (!flatMap) {
      console.warn("Flat map not initialized, cannot update data.");
      return;
  }
  if (!geoJsonData) {
      console.warn("GeoJSON data not available for flat map.");
      return;
  }
   if (!covidData || covidData.length === 0 || !covidData[0].data[currentDateIndex]) {
      console.warn("COVID data not available for the current date index.");
      // Optionally clear the map or show a message
      if(geoJsonLayer) flatMap.removeLayer(geoJsonLayer);
      geoJsonLayer = null;
      return;
  }

  console.log("Updating flat map data for date index:", currentDateIndex);

  // Remove the previous layer if it exists
  if (geoJsonLayer) {
      flatMap.removeLayer(geoJsonLayer);
      geoJsonLayer = null; // Clear reference
  }

  geoJsonLayer = L.geoJSON(geoJsonData, {
      style: styleFeature,
      onEachFeature: onEachFeature // Add interactions like tooltips
  }).addTo(flatMap);

   console.log("GeoJSON layer added/updated on flat map.");
}


function styleFeature(feature) {
  const iso_a3 = feature.properties.ISO_A3;
  const iso_a2 = iso3ToIso2Map[iso_a3]; // Get 2-letter code using the reversed map
  let cases = null;
  let countryName = feature.properties.ADMIN || iso_a3; // Fallback name

  if (iso_a2) {
      const countryData = covidData.find(c => c.country_code === iso_a2);
      if (countryData && countryData.data[currentDateIndex]) {
          cases = countryData.data[currentDateIndex].new_cases ?? null;
           countryName = countryData.country || countryName; // Use name from our data if available
      }
  }

  const fillColor = getHeatmapFillColor(cases); // Get hex color string

  // Store data in feature for tooltip access
  feature.properties.currentCases = cases;
  feature.properties.displayName = countryName;


  return {
      fillColor: fillColor,
      weight: 0.5, // Thinner borders
      opacity: 1,
      color: '#cccccc', // Lighter border color
      fillOpacity: 0.75
  };
}

// Add tooltips/popups to flat map features
function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      // click: zoomToFeature // Optional: zoom on click
  });

   // Create tooltip content
  const props = feature.properties;
  const casesDisplay = (props.currentCases === null || props.currentCases === undefined) ? 'No Data' : props.currentCases.toLocaleString();
  const content = `<b>${props.displayName}</b><br/>New Cases: ${casesDisplay}`;

  layer.bindTooltip(content); // Use bindTooltip for hover info
}

// Highlight feature on hover (for flat map)
function highlightFeature(e) {
  const layer = e.target;
  layer.setStyle({
      weight: 2,
      color: '#666', // Darker border on hover
      fillOpacity: 0.9
  });
   if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
  }
}

// Reset highlight (for flat map)
function resetHighlight(e) {
  if (geoJsonLayer) { // Ensure layer exists
     geoJsonLayer.resetStyle(e.target);
  }
}


// === CHART MODAL LOGIC ===

function showChartsModal() {
  const modal = document.getElementById('chartModal');
  if (!modal) return;
  modal.style.display = 'block';
  createCharts(); // Create or update charts
}

function hideChartsModal() {
  const modal = document.getElementById('chartModal');
  if (!modal) return;
  modal.style.display = 'none';
  // Optional: Destroy charts if they consume too much memory when hidden
  // if (casesChart) casesChart.destroy();
  // if (cumulativeChart) cumulativeChart.destroy();
  // if (countryChart) countryChart.destroy();
  // casesChart = null; cumulativeChart = null; countryChart = null;
}

function createCharts() {
  if (covidData.length === 0 || !covidData[0].data) {
      console.warn("No data to create charts.");
      // Display a message in the modal?
      return;
  }

   // Get contexts
  const ctxCases = document.getElementById('casesChart')?.getContext('2d');
  const ctxCumulative = document.getElementById('cumulativeChart')?.getContext('2d');
  const ctxCountry = document.getElementById('countryChart')?.getContext('2d');

  if (!ctxCases || !ctxCumulative || !ctxCountry) {
      console.error("Chart canvas elements not found!");
      return;
  }

  // --- Data Prep ---
  // Assuming global data for now (e.g., summing all countries - adjust if needed)
  // Let's use the first country (index 0) as an example for time series,
  // and all countries for the bar chart.
  const exampleCountryData = covidData[0].data;
  const allDates = exampleCountryData.map(d => d.date);
  const totalNewCasesPerDay = allDates.map((_, index) =>
      covidData.reduce((sum, country) => sum + (country.data[index]?.new_cases || 0), 0)
  );
   const totalCumulativeCasesPerDay = allDates.map((_, index) =>
      covidData.reduce((sum, country) => sum + (country.data[index]?.cumulative_cases || 0), 0)
  );


  // Data for the Bar Chart (Top N countries for the current date)
  const currentDateDataRanked = covidData.map(country => ({
      country: country.country,
      cases: country.data[currentDateIndex]?.new_cases || 0
    }))
    .filter(c => c.cases > 0) // Filter out countries with 0 cases for clarity
    .sort((a, b) => b.cases - a.cases) // Sort descending
    .slice(0, 25); // Take top 25

  const currentFormattedDate = document.getElementById('dateLabel').textContent;


  // --- Destroy previous charts ---
  if (casesChart) casesChart.destroy();
  if (cumulativeChart) cumulativeChart.destroy();
  if (countryChart) countryChart.destroy();

  // --- Create New Charts ---

  // 1. Total New Cases Over Time
  casesChart = new Chart(ctxCases, {
      type: 'line',
      data: {
          labels: allDates,
          datasets: [{
              label: 'Total New Cases Globally',
              data: totalNewCasesPerDay,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 1.5,
              pointRadius: 0, // Hide points for cleaner line
              tension: 0.1 // Slight curve
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
           scales: { y: { beginAtZero: true, ticks: { color: '#555'}}, x: { ticks: { color: '#555', maxRotation: 0, autoSkip: true, maxTicksLimit: 15 }}}, // Limit x-axis labels
           plugins: { legend: { labels: { color: '#333' }}}
      }
  });

  // 2. Total Cumulative Cases Over Time
  cumulativeChart = new Chart(ctxCumulative, {
      type: 'line',
      data: {
          labels: allDates,
          datasets: [{
              label: 'Total Cumulative Cases Globally',
              data: totalCumulativeCasesPerDay,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.1
          }]
      },
      options: {
           responsive: true,
          maintainAspectRatio: false,
           scales: { y: { beginAtZero: true, ticks: { color: '#555'}}, x: { ticks: { color: '#555', maxRotation: 0, autoSkip: true, maxTicksLimit: 15 }}},
           plugins: { legend: { labels: { color: '#333' }}}
      }
  });

  // 3. New Cases by Country (Bar Chart for current date)
  countryChart = new Chart(ctxCountry, {
      type: 'bar',
      data: {
          labels: currentDateDataRanked.map(c => c.country),
          datasets: [{
              label: `New Cases by Country on ${currentFormattedDate}`,
              data: currentDateDataRanked.map(c => c.cases),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
          }]
      },
      options: {
          indexAxis: 'y', // Horizontal bars are often better for many categories
          responsive: true,
          maintainAspectRatio: false,
           scales: {
              y: { ticks: { color: '#555', autoSkip: false } }, // Show all country labels
              x: { beginAtZero: true, ticks: { color: '#555' }}
          },
          plugins: {
              legend: { display: true, labels: { color: '#333' } }
          }
      }
  });
}


// === UTILITY FUNCTIONS ===

function latLongToVector3(lat, lon, radius, height = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const effectiveRadius = radius + height;

  const x = -(effectiveRadius * Math.sin(phi) * Math.cos(theta));
  const y = effectiveRadius * Math.cos(phi);
  const z = effectiveRadius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

// === EVENT HANDLERS ===

function onWindowResize() {
  const container = document.getElementById('globe-container');
  if (!container || !camera || !renderer) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  if(flatMap) flatMap.invalidateSize(); // Also invalidate flat map size if it exists
}

function onMouseMoveGlobe(event) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip || currentMode !== 'points' || document.getElementById('flatmapModal').style.display === 'block') {
       if(tooltip) tooltip.style.opacity = 0;
      return; // Only show tooltip for points on globe when globe is active
  }

  // Calculate mouse position relative to the canvas
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  // Important: Set threshold for points
  raycaster.params.Points.threshold = POINT_RADIUS * 5; // Adjust threshold as needed

  const intersects = raycaster.intersectObjects(points); // Check only points

  if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      const countryData = intersectedObject.userData;

      if (countryData && countryData.type === 'dataPoint') {
          tooltip.style.opacity = 1;
          tooltip.innerHTML = `
              <strong>${countryData.country}</strong> <br/>
              New: ${countryData.new_cases.toLocaleString()} <br/>
              Total: ${countryData.cumulative_cases.toLocaleString()}
          `;
          // Position tooltip near the mouse cursor
          tooltip.style.left = `${event.clientX + 10}px`;
          tooltip.style.top = `${event.clientY + 10}px`;
      } else {
          tooltip.style.opacity = 0;
      }
  } else {
      tooltip.style.opacity = 0;
  }
}


// === ANIMATION LOOP ===

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update(); // Update orbit controls
  if (renderer && scene && camera) renderer.render(scene, camera); // Render the 3D scene
}