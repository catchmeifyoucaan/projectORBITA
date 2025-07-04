import requests
import json
import base64
import sys
from datetime import datetime

class ORBITATester:
    def __init__(self, base_url="https://f766ccd2-6162-4598-a072-6b3b58404d3d.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.selected_satellite_id = None

    def run_test(self, name, method, endpoint, expected_status=200, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            print(f"URL: {url}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == expected_status:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, None
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass
                return False, None

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_health(self):
        """Test health check endpoint"""
        print("\n===== Testing Health Check =====")
        success, response = self.run_test(
            "Health Check",
            "GET",
            "/api/health",
            200
        )
        if success:
            print(f"APIs Configured: {response['apis_configured']}")
            print(f"Satellites Loaded: {response['satellites_loaded']}")
        return success

    def test_list_satellites(self):
        """Test satellite list endpoint"""
        print("\n===== Testing Satellite List =====")
        success, response = self.run_test(
            "List Satellites",
            "GET",
            "/api/satellites/list",
            200
        )
        if success and response and 'satellites' in response:
            satellites = response['satellites']
            print(f"Found {len(satellites)} satellites")
            if satellites:
                # Store first satellite ID for position test
                self.selected_satellite_id = satellites[0]['id']
                print(f"Selected satellite: {satellites[0]['name']} (ID: {self.selected_satellite_id})")
        return success

    def test_satellite_position(self):
        """Test satellite position endpoint"""
        print("\n===== Testing Satellite Position =====")
        if not self.selected_satellite_id:
            print("❌ No satellite ID available for position test")
            return False
            
        success, response = self.run_test(
            "Satellite Position",
            "GET",
            f"/api/satellites/{self.selected_satellite_id}/position",
            200
        )
        if success:
            print(f"Satellite: {response['name']}")
            print(f"Position: {response['latitude']}, {response['longitude']}")
            print(f"Altitude: {response['altitude']} km")
            print(f"Velocity: {response['velocity']} km/s")
        return success

    def test_satellite_passes(self):
        """Test satellite passes endpoint"""
        print("\n===== Testing Satellite Passes =====")
        data = {
            "satellite_name": "ISS (ZARYA)",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "days": 3
        }
        
        success, response = self.run_test(
            "Satellite Passes",
            "POST",
            "/api/satellites/passes",
            200,
            data=data
        )
        if success and 'passes' in response:
            print(f"Found {len(response['passes'])} passes")
        return success

    def test_earth_observation_imagery(self):
        """Test satellite imagery endpoint"""
        print("\n===== Testing Earth Observation Imagery =====")
        params = {
            "location": "New York",
            "date": "2024-02-01",
            "image_type": "natural"
        }
        
        success, response = self.run_test(
            "Earth Observation Imagery",
            "GET",
            "/api/earth-observation/imagery",
            200,
            params=params
        )
        if success:
            print(f"Image URL: {response.get('image_url', 'N/A')}")
            print(f"Metadata: {response.get('metadata', {})}")
        return success

    def test_ndvi_calculation(self):
        """Test NDVI calculation endpoint"""
        print("\n===== Testing NDVI Calculation =====")
        data = {
            "location": "California Central Valley",
            "analysis_type": "agriculture",
            "date_range": ["2024-01-01", "2024-02-01"]
        }
        
        success, response = self.run_test(
            "NDVI Calculation",
            "POST",
            "/api/earth-observation/ndvi",
            200,
            data=data
        )
        if success:
            print(f"NDVI Analysis: {response.get('analysis', 'N/A')}")
            print(f"Recommendations: {response.get('recommendations', [])}")
        return success

    def test_ai_analyze_image(self):
        """Test AI image analysis endpoint"""
        print("\n===== Testing AI Image Analysis =====")
        # Using a mock base64 image for testing
        mock_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        
        data = {
            "image_data": mock_image,
            "analysis_type": "agriculture",
            "prompt": "Analyze this agricultural field for crop health"
        }
        
        success, response = self.run_test(
            "AI Image Analysis",
            "POST",
            "/api/ai/analyze-image",
            200,
            data=data
        )
        if success:
            print(f"AI Analysis: {response.get('ai_analysis', 'N/A')[:100]}...")
        return success

    def test_monitoring_alerts(self):
        """Test monitoring alerts endpoint"""
        print("\n===== Testing Monitoring Alerts =====")
        success, response = self.run_test(
            "Monitoring Alerts",
            "GET",
            "/api/monitoring/alerts",
            200
        )
        if success and 'alerts' in response:
            print(f"Found {len(response['alerts'])} alerts")
            for alert in response['alerts']:
                print(f"- {alert['type']} ({alert['severity']}): {alert['message']}")
        return success

    def test_analytics_dashboard(self):
        """Test dashboard analytics endpoint"""
        print("\n===== Testing Analytics Dashboard =====")
        success, response = self.run_test(
            "Analytics Dashboard",
            "GET",
            "/api/analytics/dashboard",
            200
        )
        if success:
            print(f"Satellites Tracked: {response.get('total_satellites_tracked', 'N/A')}")
            print(f"Active Monitoring Zones: {response.get('active_monitoring_zones', 'N/A')}")
            print(f"Recent Alerts: {response.get('recent_alerts', 'N/A')}")
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("\n🚀 Starting ORBITA API Tests")
        print("=" * 50)
        
        # Core functionality tests
        health_ok = self.test_health()
        satellites_ok = self.test_list_satellites()
        position_ok = False
        
        if satellites_ok:
            position_ok = self.test_satellite_position()
        
        # Additional functionality tests
        passes_ok = self.test_satellite_passes()
        imagery_ok = self.test_earth_observation_imagery()
        ndvi_ok = self.test_ndvi_calculation()
        ai_ok = self.test_ai_analyze_image()
        alerts_ok = self.test_monitoring_alerts()
        dashboard_ok = self.test_analytics_dashboard()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        
        # Core functionality status
        print("\n🔍 Core Functionality Status:")
        print(f"Health Check: {'✅' if health_ok else '❌'}")
        print(f"Satellite List: {'✅' if satellites_ok else '❌'}")
        print(f"Satellite Position: {'✅' if position_ok else '❌'}")
        
        # Additional functionality status
        print("\n🔍 Additional Functionality Status:")
        print(f"Satellite Passes: {'✅' if passes_ok else '❌'}")
        print(f"Earth Observation: {'✅' if imagery_ok else '❌'}")
        print(f"NDVI Analysis: {'✅' if ndvi_ok else '❌'}")
        print(f"AI Analysis: {'✅' if ai_ok else '❌'}")
        print(f"Monitoring Alerts: {'✅' if alerts_ok else '❌'}")
        print(f"Dashboard Analytics: {'✅' if dashboard_ok else '❌'}")
        
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    tester = ORBITATester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)