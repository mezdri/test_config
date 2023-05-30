export default class apiGoogleMapsConfig {
  keyMap: string = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;
  apiSnapRoads: string = `https://roads.googleapis.com/v1/snapToRoads`;
  apiNearestRoads: string = `https://roads.googleapis.com/v1/nearestRoads`;

  getKeyMap() {
    return this.keyMap;
  }
  getUrlPointSnapRoads() {
    return this.apiSnapRoads;
  }
  getUrlPointNearestRoads() {
    return this.apiNearestRoads;
  }
}
