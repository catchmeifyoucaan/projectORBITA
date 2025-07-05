import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Enhanced 3D Cesium Globe Component with Industrial Monitoring
const CesiumGlobe = ({ satellites, selectedSatellite, onSatelliteSelect, monitoringZones }) => {
  const cesiumContainerRef = useRef(null);
  const viewerRef = useRef(null);
  const satelliteEntitiesRef = useRef(new Map());
  const [cesiumLoaded, setCesiumLoaded] = useState(false);

  useEffect(() => {
    // Initialize Cesium viewer
    if (cesiumContainerRef.current && !viewerRef.current) {
      // Load Cesium dynamically
      const script = document.createElement('script');
      script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Cesium.js';
      script.onload = () => {
        const link = document.createElement('link');
        link.href = 'https://cesium.com/downloads/cesiumjs/releases/1.111/Build/Cesium/Widgets/widgets.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Initialize Cesium with error handling
        try {
          window.Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyNzg0NTE4Mn0.XcKpgANiY19MC4bdFUPigVBQgs8heI55hO9XhUNjmAA';
          
          viewerRef.current = new window.Cesium.Viewer(cesiumContainerRef.current, {
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false,
            geocoder: false,
            infoBox: false,
            selectionIndicator: false
          });

          // Set initial camera position over Africa
          viewerRef.current.camera.setView({
            destination: window.Cesium.Cartesian3.fromDegrees(20.0, 0.0, 15000000.0)
          });

          // Enable lighting for realistic Earth
          viewerRef.current.scene.globe.enableLighting = true;
          
          setCesiumLoaded(true);
          console.log('✅ Cesium Globe initialized successfully');
          
          // Add industrial monitoring zones
          addIndustrialMonitoringZones();
          
        } catch (error) {
          console.error('❌ Error initializing Cesium:', error);
        }
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Cesium script');
      };
      
      document.head.appendChild(script);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        try {
          viewerRef.current.destroy();
          viewerRef.current = null;
          setCesiumLoaded(false);
        } catch (error) {
          console.error('Error destroying Cesium viewer:', error);
        }
      }
    };
  }, []);

  const addIndustrialMonitoringZones = () => {
    if (!viewerRef.current || !window.Cesium) return;

    try {
      // Dangote Refinery, Nigeria
      viewerRef.current.entities.add({
        name: 'Dangote Refinery',
        position: window.Cesium.Cartesian3.fromDegrees(3.2158, 6.4281, 0),
        billboard: {
          image: '🏭',
          scale: 2.0,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM
        },
        label: {
          text: 'Dangote Refinery\n650,000 bpd capacity',
          font: '12pt sans-serif',
          fillColor: window.Cesium.Color.YELLOW,
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 2,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new window.Cesium.Cartesian2(0, -50)
        }
      });

      // Major African Gold Mines
      const goldMines = [
        { name: 'Kibali Gold Mine', lat: 3.63, lng: 28.97, country: 'DRC' },
        { name: 'Loulo-Gounkoto', lat: 13.8, lng: -11.7, country: 'Mali' },
        { name: 'Geita Gold Mine', lat: -2.87, lng: 32.23, country: 'Tanzania' },
        { name: 'Tarkwa Mine', lat: 5.3, lng: -2.0, country: 'Ghana' }
      ];

      goldMines.forEach(mine => {
        viewerRef.current.entities.add({
          name: mine.name,
          position: window.Cesium.Cartesian3.fromDegrees(mine.lng, mine.lat, 0),
          billboard: {
            image: '⛏️',
            scale: 1.5,
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM
          },
          label: {
            text: `${mine.name}\n${mine.country}`,
            font: '10pt sans-serif',
            fillColor: window.Cesium.Color.GOLD,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 1,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new window.Cesium.Cartesian2(0, -40)
          }
        });
      });

      // Major African Oil Pipelines
      const pipelines = [
        // Chad-Cameroon Pipeline
        [
          { lat: 7.0, lng: 19.0 }, // Chad
          { lat: 4.0, lng: 12.0 }  // Cameroon coast
        ],
        // West African Gas Pipeline
        [
          { lat: 5.6, lng: -0.2 }, // Ghana
          { lat: 6.5, lng: 3.4 }   // Nigeria
        ]
      ];

      pipelines.forEach((pipeline, index) => {
        const positions = pipeline.map(point => 
          window.Cesium.Cartesian3.fromDegrees(point.lng, point.lat, 0)
        );
        
        viewerRef.current.entities.add({
          name: `Oil Pipeline ${index + 1}`,
          polyline: {
            positions: positions,
            width: 4,
            material: window.Cesium.Color.ORANGE,
            outline: true,
            outlineColor: window.Cesium.Color.BLACK
          }
        });
      });

      // Major African Ports for Shipping Monitoring
      const ports = [
        { name: 'Lagos Port', lat: 6.4281, lng: 3.4106, country: 'Nigeria' },
        { name: 'Durban Port', lat: -29.8587, lng: 31.0218, country: 'South Africa' },
        { name: 'Alexandria Port', lat: 31.2001, lng: 29.9187, country: 'Egypt' },
        { name: 'Tema Port', lat: 5.6667, lng: -0.0167, country: 'Ghana' }
      ];

      ports.forEach(port => {
        viewerRef.current.entities.add({
          name: port.name,
          position: window.Cesium.Cartesian3.fromDegrees(port.lng, port.lat, 0),
          billboard: {
            image: '⚓',
            scale: 1.5,
            verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM
          },
          label: {
            text: `${port.name}\n${port.country}`,
            font: '10pt sans-serif',
            fillColor: window.Cesium.Color.CYAN,
            outlineColor: window.Cesium.Color.BLACK,
            outlineWidth: 1,
            style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new window.Cesium.Cartesian2(0, -40)
          }
        });
      });

    } catch (error) {
      console.error('Error adding industrial monitoring zones:', error);
    }
  };

  useEffect(() => {
    if (cesiumLoaded && viewerRef.current && satellites.length > 0) {
      updateSatellites();
    }
  }, [satellites, cesiumLoaded]);

  const updateSatellites = async () => {
    if (!viewerRef.current || !window.Cesium || !cesiumLoaded) return;

    try {
      // Clear existing satellite entities
      satelliteEntitiesRef.current.forEach((entity) => {
        if (!entity.isDestroyed) {
          viewerRef.current.entities.remove(entity);
        }
      });
      satelliteEntitiesRef.current.clear();

      // Add satellites to the globe
      for (const satellite of satellites.slice(0, 10)) { // Limit for performance
        try {
          const response = await fetch(`${BACKEND_URL}/api/satellites/${satellite.id}/position`);
          const positionData = await response.json();

          if (positionData.latitude && positionData.longitude) {
            const entity = viewerRef.current.entities.add({
              name: satellite.name,
              position: window.Cesium.Cartesian3.fromDegrees(
                positionData.longitude,
                positionData.latitude,
                positionData.altitude * 1000 // Convert km to meters
              ),
              point: {
                pixelSize: 12,
                color: selectedSatellite?.id === satellite.id 
                  ? window.Cesium.Color.YELLOW 
                  : window.Cesium.Color.CYAN,
                outlineColor: window.Cesium.Color.WHITE,
                outlineWidth: 2,
                heightReference: window.Cesium.HeightReference.NONE
              },
              label: {
                text: satellite.name,
                font: '12pt sans-serif',
                fillColor: window.Cesium.Color.WHITE,
                outlineColor: window.Cesium.Color.BLACK,
                outlineWidth: 2,
                style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new window.Cesium.Cartesian2(0, -40),
                show: selectedSatellite?.id === satellite.id
              }
            });

            // Store satellite data for clicking
            entity.satelliteData = satellite;
            satelliteEntitiesRef.current.set(satellite.id, entity);
          }
        } catch (error) {
          console.error(`Error loading position for ${satellite.name}:`, error);
        }
      }

      // Add click handler safely
      if (viewerRef.current.selectedEntityChanged && !viewerRef.current._orbitaClickHandlerAdded) {
        viewerRef.current.selectedEntityChanged.addEventListener((selectedEntity) => {
          if (selectedEntity && selectedEntity.satelliteData) {
            onSatelliteSelect(selectedEntity.satelliteData);
          }
        });
        viewerRef.current._orbitaClickHandlerAdded = true;
      }

    } catch (error) {
      console.error('Error updating satellites:', error);
    }
  };

  return (
    <div className="cesium-container-wrapper">
      <div 
        ref={cesiumContainerRef} 
        className="cesium-container"
        style={{ 
          width: '100%', 
          height: '500px', 
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#000'
        }}
      />
      {!cesiumLoaded && (
        <div className="cesium-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading 3D Earth visualization...</p>
        </div>
      )}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('tracking');
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [satellitePosition, setSatellitePosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [ndviData, setNdviData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [satellitePasses, setSatellitePasses] = useState([]);
  const [industrialAlerts, setIndustrialAlerts] = useState([]);
  const [location, setLocation] = useState({ lat: 6.4281, lng: 3.4106 }); // Default to Lagos, Nigeria

  // Fetch satellites on component mount
  useEffect(() => {
    fetchSatellites();
    fetchDashboardData();
    fetchAlerts();
    fetchIndustrialAlerts();
  }, []);

  // Auto-refresh satellite position
  useEffect(() => {
    if (selectedSatellite) {
      const interval = setInterval(() => {
        fetchSatellitePosition(selectedSatellite.id);
      }, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedSatellite]);

  // Auto-refresh satellites for 3D view
  useEffect(() => {
    const interval = setInterval(() => {
      if (satellites.length > 0) {
        // This will trigger the 3D view to update
        setSatellites([...satellites]);
      }
    }, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [satellites]);

  const fetchSatellites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/satellites/list`);
      const data = await response.json();
      setSatellites(data.satellites || []);
    } catch (error) {
      console.error('Error fetching satellites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSatellitePosition = async (satelliteId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/satellites/${satelliteId}/position`);
      const data = await response.json();
      setSatellitePosition(data);
    } catch (error) {
      console.error('Error fetching satellite position:', error);
    }
  };

  const fetchIndustrialAlerts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/industrial/alerts`);
      const data = await response.json();
      setIndustrialAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching industrial alerts:', error);
      // Mock data for industrial alerts
      setIndustrialAlerts([
        {
          id: '1',
          type: 'oil_refinery',
          location: 'Dangote Refinery, Nigeria',
          message: 'Increased activity detected - 15 tanker trucks observed',
          severity: 'medium',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'gold_mine',
          location: 'Kibali Gold Mine, DRC',
          message: 'New excavation area detected via satellite imagery',
          severity: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'pipeline',
          location: 'Chad-Cameroon Pipeline',
          message: 'Normal flow detected, no anomalies',
          severity: 'low',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchSatellitePasses = async () => {
    if (!selectedSatellite) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/satellites/passes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          satellite_name: selectedSatellite.name,
          latitude: location.lat,
          longitude: location.lng,
          days: 3
        })
      });
      const data = await response.json();
      setSatellitePasses(data.passes || []);
    } catch (error) {
      console.error('Error fetching satellite passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/analytics/dashboard`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/monitoring/alerts`);
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchNDVI = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/earth-observation/ndvi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: "African Agricultural Zone",
          analysis_type: "agriculture",
          date_range: ["2024-01-01", "2024-01-30"]
        })
      });
      const data = await response.json();
      setNdviData(data);
    } catch (error) {
      console.error('Error fetching NDVI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSatelliteSelect = (satellite) => {
    setSelectedSatellite(satellite);
    fetchSatellitePosition(satellite.id);
    if (activeTab === 'tracking') {
      fetchSatellitePasses();
    }
  };

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className={`bg-gray-800 p-6 rounded-lg border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`text-3xl text-${color}-500`}>{icon}</div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => (
    <div className={`bg-gray-800 p-4 rounded-lg border-l-4 ${
      alert.severity === 'high' ? 'border-red-500' : 
      alert.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-white">{alert.type.toUpperCase()}</h4>
          <p className="text-gray-400 text-sm">{alert.location}</p>
          <p className="text-gray-300 mt-1">{alert.message}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${
          alert.severity === 'high' ? 'bg-red-500 text-white' :
          alert.severity === 'medium' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
        }`}>
          {alert.severity}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🛰️</div>
              <div>
                <h1 className="text-2xl font-bold">Project ORBITA</h1>
                <p className="text-gray-400 text-sm">Industrial Intelligence Platform</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="bg-green-500 px-3 py-1 rounded-full text-sm">
                ● Live
              </div>
              <div className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                🏭 Industrial
              </div>
              <div className="bg-orange-500 px-3 py-1 rounded-full text-sm">
                🌍 Africa Focus
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            <TabButton
              id="tracking"
              label="🛰️ 3D Satellite Tracking"
              active={activeTab === 'tracking'}
              onClick={() => setActiveTab('tracking')}
            />
            <TabButton
              id="industrial"
              label="🏭 Industrial Monitoring"
              active={activeTab === 'industrial'}
              onClick={() => setActiveTab('industrial')}
            />
            <TabButton
              id="observation"
              label="🌍 Earth Observation"
              active={activeTab === 'observation'}
              onClick={() => setActiveTab('observation')}
            />
            <TabButton
              id="ai"
              label="🤖 AI Analysis"
              active={activeTab === 'ai'}
              onClick={() => setActiveTab('ai')}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Dashboard Overview */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Satellites Tracked"
              value={dashboardData.total_satellites_tracked}
              icon="🛰️"
              color="blue"
            />
            <StatCard
              title="Industrial Zones"
              value="25"
              icon="🏭"
              color="orange"
            />
            <StatCard
              title="Gold Mines"
              value="12"
              icon="⛏️"
              color="yellow"
            />
            <StatCard
              title="Oil Facilities"
              value="8"
              icon="🛢️"
              color="red"
            />
            <StatCard
              title="Active Alerts"
              value={industrialAlerts.length}
              icon="⚠️"
              color="red"
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'tracking' && (
          <div className="space-y-8">
            {/* 3D Globe Visualization with Industrial Monitoring */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🌍 3D Industrial Satellite Monitoring</h2>
                <div className="text-sm text-gray-400">
                  Focus: Africa - Oil, Gold, Shipping | {selectedSatellite ? `Tracking: ${selectedSatellite.name}` : 'Click a satellite to track'}
                </div>
              </div>
              <CesiumGlobe 
                satellites={satellites}
                selectedSatellite={selectedSatellite}
                onSatelliteSelect={handleSatelliteSelect}
              />
              <div className="mt-4 text-xs text-gray-500">
                🎮 Interactive controls: Mouse to rotate, scroll to zoom, click satellites/facilities to track
                <br />
                🏭 Monitoring: Dangote Refinery, African Gold Mines, Oil Pipelines, Major Ports
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Satellite List */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Available Satellites</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-400 mt-2">Loading satellites...</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {satellites.map((satellite) => (
                      <div
                        key={satellite.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedSatellite?.id === satellite.id
                            ? 'bg-blue-600'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        onClick={() => handleSatelliteSelect(satellite)}
                      >
                        <div className="font-medium">{satellite.name}</div>
                        <div className="text-sm text-gray-400">
                          {satellite.type} | Alt: {satellite.current_altitude}km
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Satellite Position */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Real-time Position</h2>
                {selectedSatellite ? (
                  <div>
                    <h3 className="font-semibold text-blue-400 mb-4">
                      {selectedSatellite.name}
                    </h3>
                    {satellitePosition ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Latitude:</span>
                          <span className="font-mono">{satellitePosition.latitude?.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Longitude:</span>
                          <span className="font-mono">{satellitePosition.longitude?.toFixed(4)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Altitude:</span>
                          <span className="font-mono">{satellitePosition.altitude?.toFixed(2)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Velocity:</span>
                          <span className="font-mono">{satellitePosition.velocity?.toFixed(2)} km/s</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-4">
                          Last updated: {new Date(satellitePosition.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-400 mt-2">Calculating position...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Select a satellite to view its position
                  </div>
                )}
              </div>

              {/* Coverage Analysis */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Coverage Analysis</h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-green-400">Dangote Refinery</h4>
                    <p className="text-sm text-gray-400">Next overpass: 14:32 UTC</p>
                    <p className="text-xs text-gray-500">Sentinel-2 coverage available</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-yellow-400">Kibali Gold Mine</h4>
                    <p className="text-sm text-gray-400">Next overpass: 16:45 UTC</p>
                    <p className="text-xs text-gray-500">High-res imagery scheduled</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded">
                    <h4 className="font-semibold text-blue-400">Lagos Port</h4>
                    <p className="text-sm text-gray-400">Ship tracking active</p>
                    <p className="text-xs text-gray-500">23 vessels detected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'industrial' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Industrial Alerts */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">🏭 Industrial Activity Alerts</h2>
                <div className="space-y-4">
                  {industrialAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>

              {/* Facility Monitoring */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">📊 Facility Status</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-900 to-orange-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-200">🏭 Dangote Refinery</h4>
                    <p className="text-sm text-orange-300">Capacity: 650,000 bpd</p>
                    <p className="text-sm text-orange-300">Status: ● Operational</p>
                    <p className="text-xs text-orange-400 mt-2">Last satellite scan: 2 hours ago</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-200">⛏️ African Gold Mines</h4>
                    <p className="text-sm text-yellow-300">Monitoring: 12 major mines</p>
                    <p className="text-sm text-yellow-300">Status: ● 11 Active, 1 Expanding</p>
                    <p className="text-xs text-yellow-400 mt-2">New excavation detected: Kibali Mine</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-200">⚓ Port Activity</h4>
                    <p className="text-sm text-blue-300">Tracking: 4 major ports</p>
                    <p className="text-sm text-blue-300">Ships detected: 67 vessels</p>
                    <p className="text-xs text-blue-400 mt-2">High activity: Lagos Port (23 ships)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline Monitoring */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🛢️ Oil Pipeline Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-400">Chad-Cameroon Pipeline</h4>
                  <p className="text-sm text-gray-300">Length: 1,070 km</p>
                  <p className="text-sm text-green-400">Status: ● Normal Flow</p>
                  <p className="text-xs text-gray-500 mt-2">Last inspection: Satellite overpass 6 hours ago</p>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-400">West African Gas Pipeline</h4>
                  <p className="text-sm text-gray-300">Length: 678 km</p>
                  <p className="text-sm text-green-400">Status: ● Normal Flow</p>
                  <p className="text-xs text-gray-500 mt-2">Monitoring: Nigeria to Ghana segment</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'observation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Earth Observation Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🌍 Earth Observation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Location (Focus: African Industrial Zones)
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Dangote Refinery, Nigeria</option>
                    <option>Kibali Gold Mine, DRC</option>
                    <option>Lagos Port, Nigeria</option>
                    <option>Durban Port, South Africa</option>
                    <option>Chad-Cameroon Pipeline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Analysis Type
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Industrial Activity Analysis</option>
                    <option>Oil Spill Detection</option>
                    <option>Mining Expansion Monitoring</option>
                    <option>Ship Traffic Analysis</option>
                    <option>Infrastructure Change Detection</option>
                  </select>
                </div>
                <button
                  onClick={fetchNDVI}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Analyze Industrial Zone
                </button>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📊 Analysis Results</h2>
              {ndviData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-green-400 mb-2">Industrial Zone Analysis</h3>
                    <div className="bg-gray-700 p-3 rounded">
                      <p className="text-sm text-gray-300">{ndviData.analysis}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-400 mb-2">Recommendations:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {ndviData.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Select an industrial zone to analyze
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Analysis Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🤖 AI-Powered Industrial Analysis</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Analysis Type
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Oil Refinery Activity Detection</option>
                    <option>Gold Mining Operations Analysis</option>
                    <option>Pipeline Leak Detection</option>
                    <option>Ship Movement Tracking</option>
                    <option>Industrial Infrastructure Changes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Upload Satellite Image
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="text-gray-400">
                      <div className="text-2xl mb-2">🛰️</div>
                      <p>Drop industrial satellite imagery here</p>
                      <p className="text-xs mt-1">Supports: Sentinel-2, Landsat, MODIS</p>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Analyze with Industrial AI
                </button>
              </div>
            </div>

            {/* AI Results */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🧠 AI Industrial Insights</h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-200">Latest AI Analysis</h4>
                  <p className="text-sm text-purple-300 mt-2">Dangote Refinery: Increased truck activity detected (confidence: 92%)</p>
                  <p className="text-xs text-purple-400 mt-2">Model: Industrial Activity Detector v2.1</p>
                </div>
                
                <div className="text-center py-4 text-gray-400">
                  <div className="text-4xl mb-2">🤖</div>
                  <p>Upload industrial imagery for AI analysis</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Powered by Gemini AI + Industrial Training Data
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;