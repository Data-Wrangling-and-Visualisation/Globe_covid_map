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
    let flatMap, geoJsonLayer, geoJsonData;
    let covidData = [], maxDate = 0, currentDateIndex = 0; // Initialize to 0
    const GLOBE_RADIUS = 1;
    const POINT_RADIUS = 0.015;
    const HEATMAP_SCALE = 1;
    const OUTLINE_COLOR = 0x444444;
    
    // --- Constants for Legend Colors ---
    const LOW_COLOR = 'hsl(120, 100%, 50%)';    // Green
    const MEDIUM_COLOR = 'hsl(90, 100%, 50%)';  // Yellow-Green
    const HIGH_COLOR = 'hsl(60, 100%, 50%)';  // Yellow
    const VERY_HIGH_COLOR = 'hsl(30, 100%, 50%)'; // Orange
    const EXTREME_COLOR = 'hsl(0, 100%, 50%)';   // Red
    
    const countryGeometryCache = new Map();
    
    // --- Chart Variables ---
    let casesChart, cumulativeChart, countryChart;
    
    
    init().then(() => {
      animate();
    }).catch(error => {
      console.error('Initialization failed:', error);
      // Show error message to user
      document.getElementById('dateLabel').textContent = 'Initialization failed - check console';
    });


   // loadData();
   // animate();

    let cameraState = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      target: new THREE.Vector3()
    };

    function getVisibleRegion() {
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion); // Transform forward vector by camera rotation
      return forward;
    }

    async function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 2.5;
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);
    
      // Load data first before proceeding
      await loadData();
      await loadGeoJsonData();
    
      // Setup controls after data is loaded
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.minDistance = 1.2;
      controls.maxDistance = 4;
      
      globeGroup = new THREE.Group();
      scene.add(globeGroup);
      setupLighting();
      createGlobe();
    
      // Add a small delay to ensure the globe is created before adding points
      setTimeout(() => {
        updateVisualization();
      }, 100);
    
        document.getElementById('dateSlider').addEventListener('input', onSliderChange);
        document.getElementById('dateInput').addEventListener('change', onDateInputChange);
        document.getElementById('heatmapBtn').addEventListener('click', showFlatMapModal);
        document.querySelector('.flatmap-close').addEventListener('click', hideFlatMapModal);
        document.getElementById('chartBtn').addEventListener('click', showCharts);
        document.getElementById('modalDateSlider').addEventListener('input', onSliderChange);
        document.getElementById('modalDateInput').addEventListener('change', onDateInputChange);
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
                createGlobeLegend();
            }
        );
    }
    
    async function loadGeoJsonData() {
      try {
          const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          geoJsonData = await response.json();
          console.log('GeoJSON data loaded successfully');
      } catch (error) {
          console.error('Failed to load GeoJSON:', error);
          // Handle error (show message to user, retry logic, etc.)
          throw error; // Re-throw to prevent further execution
      }
  }
  

  function showFlatMapModal() {
    if (!geoJsonData) {
        console.error('GeoJSON data not loaded');
        alert('Map data not available. Please try again later.');
        return;
    }

    const modal = document.getElementById('flatmapModal');
    modal.style.display = 'block';
    
    if (!flatMap) {
        flatMap = L.map('flatmap', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxBounds: [[-90, -180], [90, 180]]
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(flatMap);
    }

    setTimeout(() => {
        flatMap.invalidateSize();
        updateFlatMapData();
    }, 100);
}

      
      function hideFlatMapModal() {
        document.getElementById('flatmapModal').style.display = 'none';
        if (flatMap) flatMap.remove();
        flatMap = null;
      }
      
      function updateFlatMapData() {
        if (!flatMap || !geoJsonData) return;
      
        // Remove existing layer if it exists
        if (geoJsonLayer) {
          flatMap.removeLayer(geoJsonLayer);
        }
      
        // Create new layer with updated styles
        geoJsonLayer = L.geoJSON(geoJsonData, {
          style: styleFeature,
          onEachFeature: onEachFeature
        }).addTo(flatMap);
      
        // Update legend
        createLegend();
      }
      
    
      
    function styleFeature(feature) {
      const iso3 = feature.properties.ISO_A3;
      // Find the 2-letter code using the reverse mapping
      const countryCode = Object.keys(countryCodeMap).find(key => countryCodeMap[key] === iso3);
      const country = covidData.find(c => c.country_code === countryCode);
      
      const cases = country?.data[currentDateIndex]?.new_cases || 0;
      const maxCases = Math.max(1, ...covidData.map(c => c.data[currentDateIndex]?.new_cases || 0));
      
      return {
          fillColor: getHeatmapColor(cases, maxCases),
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
      };
  }
  
    
    
    function getHeatmapColor(cases, maxCases) {
        const ratio = cases / maxCases;
        return ratio > 0.8 ? '#800026' :
               ratio > 0.6 ? '#BD0026' :
               ratio > 0.4 ? '#E31A1C' :
               ratio > 0.2 ? '#FC4E2A' :
               cases === 0 ? '#808080' : // Gray for zero cases
               '#FD8D3C'; // Orange for lowest non-zero
    }
    
      
      function onEachFeature(feature, layer) {
        const iso3 = feature.properties.ISO_A3;
        const country = covidData.find(c => countryCodeMap[c.country_code] === iso3);
        const cases = country?.data[currentDateIndex]?.new_cases || 0;
        
        layer.bindPopup(`
          <strong>${feature.properties.ADMIN}</strong><br>
          New cases: ${cases.toLocaleString()}
        `);
      }      

      async function loadData() {
        try {
            const response = await fetch('/api/data');
            if (!response.ok) throw new Error('Failed to load data');
            covidData = await response.json();
    
            if (covidData.length > 0 && covidData[0].data) {
                maxDate = covidData[0].data.length - 1;
                // Initialize both sliders
                document.getElementById('dateSlider').max = maxDate;
                document.getElementById('modalDateSlider').max = maxDate;
                currentDateIndex = 0;
                document.getElementById('dateSlider').value = currentDateIndex;
                document.getElementById('modalDateSlider').value = currentDateIndex;
                updateDateLabel();
                updateDate();
                createLegend();
    
                // Debug: Log available dates
                console.log('Available dates:', covidData[0].data.map(d => d.date));
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    
    
    
    // --- IMPROVED updateDateLabel ---
// Update the updateDateLabel function
function updateDateLabel() {
    if (covidData.length > 0 && covidData[0].data && covidData[0].data[currentDateIndex]) {
        const dateStr = covidData[0].data[currentDateIndex].date;
        const date = new Date(dateStr);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
        
        // Update all date displays
        document.getElementById('dateLabel').textContent = formattedDate;
        document.getElementById('dateInput').value = formattedDate;
        document.getElementById('flatmapDateLabel').textContent = formattedDate;
        document.getElementById('modalDateInput').value = formattedDate;
        document.getElementById('modalDateSlider').value = currentDateIndex;
    }
}
    
    
    // --- Event handler for slider changes ---
    function onSliderChange(e) {
      // Update from both possible sliders
      const sliderValue = e.target.id === 'modalDateSlider' 
          ? e.target.value 
          : document.getElementById('dateSlider').value;
      
      currentDateIndex = parseInt(sliderValue);
      
      // Sync both sliders
      document.getElementById('dateSlider').value = currentDateIndex;
      document.getElementById('modalDateSlider').value = currentDateIndex;
      
      updateDateLabel();
      updateVisualization();
      
      // Force heatmap update if flatmap modal is open
      if (document.getElementById('flatmapModal').style.display === 'block') {
        updateFlatMapData();
      }
    }
    
  
    
      function onDateInputChange() {
        const dateStr = document.getElementById('modalDateInput').value;
        const newDate = parseDate(dateStr); 
    
        if (isValidDate(newDate)) {
            const formattedDate = newDate.toISOString().split('T')[0];
    
            const newIndex = covidData[0].data.findIndex(item => item.date === formattedDate);
            if (newIndex !== -1) {
                currentDateIndex = newIndex;
                document.getElementById('modalDateSlider').value = currentDateIndex;
                document.getElementById('dateSlider').value = currentDateIndex; // Sync main slider
                updateDateLabel();
                updateVisualization();
                updateFlatMapData(); 
            } else {
                alert('Date not found in data.');
            }
        } else {
            alert('Invalid date format. Please use DD.MM.YYYY.');
        }
    }
  
    // --- Helper function to parse date string ---
    function parseDate(dateStr) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        console.log(`Parsed date: ${year}-${month + 1}-${day}`);
        return new Date(year, month, day);
      }
      return null; // Invalid format
    }
    
    function isValidDate(date) {
      return date instanceof Date && !isNaN(date);
    }
    
    
    function updateDate() {
      updateDateLabel();
      updateVisualization();
    }
    
    // --- Creates Legend (with Numerical Ranges) ---
    function createLegend() {
      if (covidData.length === 0) return;
  
      const maxCases = Math.max(...covidData.map(c => c.data[currentDateIndex]?.new_cases || 0));
      
      // Create legend items for heatmap colors
      const legendItems = [
          { color: '#FD8D3C', label: '1 - ' + Math.floor(maxCases * 0.2).toLocaleString() },
          { color: '#FC4E2A', label: Math.floor(maxCases * 0.2 + 1) + ' - ' + Math.floor(maxCases * 0.4) },
          { color: '#E31A1C', label: Math.floor(maxCases * 0.4 + 1) + ' - ' + Math.floor(maxCases * 0.6) },
          { color: '#BD0026', label: Math.floor(maxCases * 0.6 + 1) + ' - ' + Math.floor(maxCases * 0.8) },
          { color: '#800026', label: Math.floor(maxCases * 0.8 + 1) + '+' },
          { color: '#808080', label: 'No data' }
      ];
  
      const legendHTML = `
      <div class="legend-title">Cases per Country</div>
      ${legendItems.map(item => `
          <div class="legend-item">
              <span class="legend-color" style="background:${item.color}"></span>
              <span class="legend-label">${item.label}</span>
          </div>
      `).join('')}`;
  
      document.getElementById('flatmap-legend').innerHTML = legendHTML;
  }
  
    function createGlobeLegend() {
      const legend = document.createElement('div');
      legend.id = 'globe-legend';
      
      const ranges = [
          { color: LOW_COLOR, label: '1 - 100' },
          { color: MEDIUM_COLOR, label: '101 - 1,000' },
          { color: HIGH_COLOR, label: '1,001 - 10,000' },
          { color: VERY_HIGH_COLOR, label: '10,001 - 50,000' },
          { color: EXTREME_COLOR, label: '50,001+' }
      ];
      
      legend.innerHTML = `
          <div class="legend-title">COVID-19 Cases</div>
          <div class="legend-items">
              ${ranges.map(range => `
                  <div class="legend-item">
                      <span class="legend-color" style="background: ${range.color}"></span>
                      <span class="legend-label">${range.label}</span>
                  </div>
              `).join('')}
          </div>
      `;
      document.body.appendChild(legend);
  }

    
    function showPoints() {
      if (!covidData || covidData.length === 0) return;
    
      covidData.forEach(country => {
        if (!country.data || !country.data[currentDateIndex]) return;
    
        const position = latLongToVector3(country.latitude, country.longitude, GLOBE_RADIUS + 0.01);
        const cases = country.data[currentDateIndex].new_cases || 0;
        const color = getPointColorByCases(cases);
    
        let point = points.find(p => p.userData.country === country.country);
    
        if (point) {
          point.material.color.set(color);
          point.position.copy(position);
          point.userData = {
            country: country.country,
            ...country.data[currentDateIndex]
          };
        } else {
          const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
          point = new THREE.Mesh(new THREE.SphereGeometry(POINT_RADIUS, 8, 8), material);
          point.position.copy(position);
          point.userData = {
            country: country.country,
            ...country.data[currentDateIndex]
          };
          globeGroup.add(point);
          points.push(point);
        }
      });
    }
    
    async function loadCountryShape(geojsonId, is3D = true) {
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
                  if (Array.isArray(point[0])) {
                      processCoordinates(point, depth + 1);
                  } else {
                      const [lon, lat] = point;
                      let x, y;
  
                      if (is3D) {
                          // For 3D mode, project onto the globe
                          const vec = latLongToVector3(lat, lon, GLOBE_RADIUS);
                          x = vec.x;
                          y = vec.y;
                      } else {
                          // For 2D mode, use a flat projection (Mercator or simple scaling)
                          x = (lon / 180) * GLOBE_RADIUS * 2; // Scale longitude to fit within the plane
                          y = (lat / 90) * GLOBE_RADIUS; // Scale latitude to fit within the plane
                      }
  
                      if (firstPoint) {
                          shape.moveTo(x, y);
                          firstPoint = false;
                      } else {
                          shape.lineTo(x, y);
                      }
                  }
              });
              if (depth > 0) shape.closePath();
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
    
    function clearPoints() {
        points.forEach(p => globeGroup.remove(p));
        points = [];
    }
    
    function clearHeatmap() {
        if (geoJsonLayer) {
          geoJsonLayer.remove();
          geoJsonLayer = null;
        }
      }
    
    // --- Heatmap Color Scale (Green to Red) ---
    function getHeatmapColorByCases(cases, maxCases) {
        if (cases === null || cases === undefined) {
            return new THREE.Color(LOW_COLOR); // Default green for no data
        }
      const normalizedCases = Math.min(cases / maxCases, 1); // Normalize and clamp
      const hue = 120 - (normalizedCases * 120); // 120 (green) to 0 (red)
      return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    }
    
    // --- Point Color Scale (Green to Red) ---
    function getPointColorByCases(cases) {
      if (cases === null || cases === undefined) {
         return new THREE.Color(LOW_COLOR);
      }
      const hue = 120 - Math.min(cases * 0.1, 120);
      return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    }
    
    function switchMode(newMode) {
        mode = newMode;
        updateVisualization(); // Use the combined update function
    }
    
    // --- Combined update function ---
    function updateVisualization() {
      clearPoints();
      clearHeatmap();
      if (mode === "points") {
          showPoints();
      } else if (mode === "heatmap") {
          if (document.getElementById('flatmapModal').style.display === 'block') {
              updateFlatMapData(); // Refresh heatmap when date changes
          }
      }
      createLegend();
  }
  
    
    function showCharts() {
      const modal = document.getElementById('chartModal');
      modal.style.display = 'block';
      const ctxCases = document.getElementById('casesChart').getContext('2d');
      const ctxCumulative = document.getElementById('cumulativeChart').getContext('2d');
      const ctxCountry = document.getElementById('countryChart').getContext('2d'); // New chart
    
      // Destroy existing charts if they exist
      if (casesChart) {
        casesChart.destroy();
      }
      if (cumulativeChart) {
        cumulativeChart.destroy();
      }
        if (countryChart) {
        countryChart.destroy();
      }
    
      // --- New Cases Chart (Existing Chart, but now with consistent styling) ---
      casesChart = new Chart(ctxCases, {
        type: 'line',
        data: {
          labels: covidData[0].data.map(d => d.date),
          datasets: [{
            label: 'New Cases',
            data: covidData[0].data.map(d => d.new_cases),
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false // No fill under the line
          }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {  // Add plugins for better control
              legend: {
                display: true, // Show the legend
                position: 'top' // Position the legend at the top
              }
            }
        }
      });
    
      // --- Cumulative Cases Chart ---
      cumulativeChart = new Chart(ctxCumulative, {
        type: 'line',
        data: {
          labels: covidData[0].data.map(d => d.date),
          datasets: [{
            label: 'Cumulative Cases',
            data: covidData[0].data.map(d => d.cumulative_cases),
            borderColor: 'rgba(255, 99, 132, 1)', // Red
            borderWidth: 1,
            fill: false
          }]
        },
           options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            }
        }
      });
    
      // --- New Cases by Country (Bar Chart) ---
      const currentDateData = covidData.map(country => ({
        country: country.country,
        cases: country.data[currentDateIndex]?.new_cases || 0
      }));
    
      // Sort by cases (descending) and take the top 20
      currentDateData.sort((a, b) => b.cases - a.cases);
      const top20Countries = currentDateData.slice(0, 20);
    
    
        countryChart = new Chart(ctxCountry, {
            type: 'bar',
            data: {
                labels: top20Countries.map(c => c.country),
                datasets: [{
                    label: `New Cases on ${covidData[0].data[currentDateIndex]?.date || 'No Data'}`,
                    data: top20Countries.map(c => c.cases),
                    backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true, // Show legend
                        position: 'top'
                    }
                },
                indexAxis: 'x'
            }
        });
    
    
    
      document.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
        // No need to destroy here, we do it at the beginning of showCharts()
      };
    }
    
    function latLongToVector3(lat, lon, radius = GLOBE_RADIUS, height = 0.01) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
    
        const x = -(radius + height) * Math.sin(phi) * Math.cos(theta);
        const y = (radius + height) * Math.cos(phi);
        const z = (radius + height) * Math.sin(phi) * Math.sin(theta);
    
        return new THREE.Vector3(x, y, z);
    }
    
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        controls.update(); // Crucial for OrbitControls
    }
    // --- Mouse Move Event Handler ---
    function onMouseMove(event) {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;
    
        const mouse = new THREE.Vector3();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        mouse.z = 0.5;
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
    
        // Combine points and heatmap meshes into one array for intersection checking
        const objectsToCheck = [...points, ...heatmap];
        const intersects = raycaster.intersectObjects(objectsToCheck);
    
    
        if (intersects.length > 0) {
          let countryData = intersects[0].object.userData;
          if (!countryData || !countryData.country) {
            countryData = intersects[0].object.parent.userData;
          }
          if (!countryData || !countryData.country) return;
    
    
            tooltip.style.opacity = 1;
            tooltip.innerHTML = `
                ${countryData.country} <br/>
                New cases: ${countryData.new_cases.toLocaleString()} <br/>
                Total cases: ${countryData.cumulative_cases.toLocaleString()}
            `;
            tooltip.style.left = `${event.clientX + 15}px`;
            tooltip.style.top = `${event.clientY + 15}px`;
        } else {
            tooltip.style.opacity = 0; // Hide tooltip
        }
    }
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update controls every frame
        renderer.render(scene, camera);
    }