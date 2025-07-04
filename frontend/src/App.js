import React, { useState, useEffect } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NYC

  // Fetch satellites on component mount
  useEffect(() => {
    fetchSatellites();
    fetchDashboardData();
    fetchAlerts();
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
          location: "Test Location",
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
                <p className="text-gray-400 text-sm">Satellite Intelligence Platform</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="bg-green-500 px-3 py-1 rounded-full text-sm">
                ● Live
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
              label="🛰️ Satellite Tracking"
              active={activeTab === 'tracking'}
              onClick={() => setActiveTab('tracking')}
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
            <TabButton
              id="monitoring"
              label="📊 Monitoring"
              active={activeTab === 'monitoring'}
              onClick={() => setActiveTab('monitoring')}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Satellites Tracked"
              value={dashboardData.total_satellites_tracked}
              icon="🛰️"
              color="blue"
            />
            <StatCard
              title="Active Zones"
              value={dashboardData.active_monitoring_zones}
              icon="🌍"
              color="green"
            />
            <StatCard
              title="Recent Alerts"
              value={dashboardData.recent_alerts}
              icon="⚠️"
              color="red"
            />
            <StatCard
              title="AI Analyses"
              value={dashboardData.ai_analyses_completed}
              icon="🤖"
              color="purple"
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'tracking' && (
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
                        ID: {satellite.catalog_number}
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

            {/* 3D Visualization Placeholder */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">3D Orbital View</h2>
              <div className="bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🌍</div>
                  <p className="text-gray-400">3D visualization coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Will show real-time orbital paths
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'observation' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Earth Observation Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Earth Observation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location or coordinates"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Analysis Type
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Agriculture (NDVI)</option>
                    <option>Deforestation Detection</option>
                    <option>Water Resources</option>
                    <option>Urban Development</option>
                  </select>
                </div>
                <button
                  onClick={fetchNDVI}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Analyze Area
                </button>
              </div>
            </div>

            {/* NDVI Results */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
              {ndviData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-green-400 mb-2">NDVI Analysis</h3>
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
                  Select an area to analyze
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Analysis Controls */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">AI-Powered Analysis</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Analysis Type
                  </label>
                  <select className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Deforestation Detection</option>
                    <option>Agricultural Monitoring</option>
                    <option>Security Surveillance</option>
                    <option>Change Detection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <div className="text-gray-400">
                      <div className="text-2xl mb-2">📁</div>
                      <p>Drop satellite imagery here or click to upload</p>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Analyze with AI
                </button>
              </div>
            </div>

            {/* AI Results */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">AI Insights</h2>
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">🤖</div>
                <p>Upload an image to get AI analysis</p>
                <p className="text-sm text-gray-500 mt-2">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Alerts */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No active alerts
                  </div>
                )}
              </div>
            </div>

            {/* Monitoring Zones */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Monitoring Zones</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-400">Amazon Basin</h4>
                  <p className="text-sm text-gray-400">Deforestation monitoring</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: Active • Last scan: 2 hours ago
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-400">Central Valley</h4>
                  <p className="text-sm text-gray-400">Agricultural monitoring</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: Active • Last scan: 1 hour ago
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-400">Security Zone Alpha</h4>
                  <p className="text-sm text-gray-400">Infrastructure monitoring</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: Active • Last scan: 30 minutes ago
                  </div>
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