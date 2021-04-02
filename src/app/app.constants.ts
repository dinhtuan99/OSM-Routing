// These constants are injected via webpack environment variables.
// You can add more variables in webpack.common.js or in profile specific webpack.<dev|prod>.js files.
// If you change the values in the webpack config files, you need to re run webpack to update the application

export const DEFAULT_LATITUDE = 21.019035950000003;
export const DEFAULT_LONGITUDE = 105.80904099522746;

export const GEOSERVER_URL: string = "http://127.0.0.1:8080/geoserver";
export const BASE_NOMINATIM_URL: string = 'nominatim.openstreetmap.org';
export const DEFAULT_VIEW_BOX: string = 'viewbox=102.501040,8.469711,109.059680,23.203613';
