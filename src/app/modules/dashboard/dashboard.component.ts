import { Component, OnInit,SimpleChanges, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { icon, latLng, LeafletMouseEvent, Map, MapOptions, marker, tileLayer, control, geoJSON, layerGroup } from 'leaflet';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '../../app.constants';
import { MapPoint } from '../../shared/models/map-point.model';
import { NominatimResponse } from '../../shared/models/nominatim-response.model';
import { GeoServerService } from '../../services/geoServer-service'
import { NominatimService } from '../../../app/services/nominatim-service';

interface routePoint {
  name: string;
  meter: number;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input()
  search: any;
  @Input()
  selected: any;

  @Input()
  fromOrTo: any;

  @Input()
  mode!: string;
  @Output()
  newPoint = new EventEmitter();

  @Output()
  newRoute = new EventEmitter();

  public map!: Map;
  options!: MapOptions;

  startLayer: any;
  destLayer: any;
  searchLayer: any;
  mapPointSearch: MapPoint = new MapPoint;
  mapPoint: MapPoint = new MapPoint;
  mapPointStart: MapPoint = new MapPoint;
  mapPointDest: MapPoint = new MapPoint;

  markerRoute = layerGroup();
  pointStartFirst = true;

  results!: NominatimResponse[];

  geoserverUrl = "http://127.0.0.1:8080/geoserver/routing";
  selectedPoint = null;

  private source: any;
  private target: any;
  isSource = true;

  arrRoute: routePoint[] = [];

  constructor(
    private geoServerService: GeoServerService,
    private nominatimService: NominatimService
  ) { }

  ngOnInit() {
    this.initializeMapOptions();
  }
  async ngOnChanges(changes: SimpleChanges) { //nhận dữ liệu khi selected thay đổi

    if (this.selected) {
      if(changes.selected){
        if (this.fromOrTo === "start") {
          console.log('Nhận dữ liệu START sau khi chọn địa điểm từ Sidebar: ', this.selected)
          this.pointStartFirst = true;
          this.updateMapPoint(this.selected.latitude, this.selected.longitude, this.selected.displayName);

        } else {
          console.log('Nhận dữ liệu DEST sau khi chọn địa điểm từ Sidebar: ', this.selected)
          this.updateMapPoint(this.selected.latitude, this.selected.longitude, this.selected.displayName);
        }
      }
    }
    if(this.search){
      if(changes.search){
        this.updateMapPointSearch(this.search.latitude, this.search.longitude, this.search.displayName);
      }
    }
    if(this.mode){

        console.log("dash",this.mode);
        this.isSource = true;
        await this.getVertex(this.mapPointStart);
        await this.getVertex(this.mapPointDest);
        await this.getRoute(this.source, this.target);

    //     setTimeout(()=>{
    //       this.getRoute(this.source, this.target);
    //  }, 5000);
    }
  }

  initializeMap(map: Map) { // khởi tạo map
    this.map = map;
    control.scale().setPosition('topright').addTo(this.map);
    this.map.zoomControl.setPosition('bottomright')
  }

  onMapClick(e: LeafletMouseEvent) { // sự kiện click trên bản đồ
    this.updateMapPointClick(e.latlng.lat, e.latlng.lng);
    this.newPoint.emit(this.mapPoint);
  }

  private initializeMapOptions() { //khởi lại option bản đồ
    let esriMap = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    let baseMap = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        attribution: 'OSM'
      })

    this.options = {
      center: latLng(DEFAULT_LATITUDE, DEFAULT_LONGITUDE),
      zoom: 12,
      layers: [
        baseMap
      ]
    }
  }

  private updateMapPointClick(latitude: number, longitude: number, name?: string) {  // cập nhật điểm trên bản đồ
    this.mapPoint = {
      latitude: latitude,
      longitude: longitude,
      name: name ? name : this.mapPoint.name
    };
  }
  private updateMapPointSearch(latitude: number, longitude: number, name?: string){
    this.mapPointSearch = {
      latitude: latitude,
      longitude: longitude,
      name: name ? name : this.mapPointSearch.name
    };
    this.createMarkerSearch();
  }
  private updateMapPoint(latitude: number, longitude: number, name?: string) {  // cập nhật điểm trên bản đồ
    if (this.pointStartFirst) {
      this.mapPointStart = {
        latitude: latitude,
        longitude: longitude,
        name: name ? name : this.mapPointStart.name
      }
      this.createMarkerStart();
      this.pointStartFirst = false;
    } else {
      this.mapPointDest = {
        latitude: latitude,
        longitude: longitude,
        name: name ? name : this.mapPointDest.name
      }
      this.createMarkerDest();
    }
    this.pointStartFirst = false;
  }
  private createMarkerSearch(){
    if (this.searchLayer) {
      this.map.removeLayer(this.searchLayer);
    }
    const mapIcon = this.getDefaultIcon();
    const coordinates = latLng([this.mapPointSearch.latitude, this.mapPointSearch.longitude]);
    this.searchLayer = marker(coordinates).setIcon(mapIcon).addTo(this.map);
    this.searchLayer.bindPopup(this.mapPointSearch.name + " (" + this.mapPointSearch.latitude.toString() + ", " + this.mapPointSearch.longitude.toString() + ")").openPopup();
    this.map.setView(coordinates, this.map.getZoom());
  }
  private createMarkerDest() { //tạo marker điểm đến mới
    if (this.destLayer) {
      this.map.removeLayer(this.destLayer);
    }
    const mapIcon = this.getDestIcon();
    const coordinates = latLng([this.mapPointDest.latitude, this.mapPointDest.longitude]);
    this.destLayer = marker(coordinates).setIcon(mapIcon).addTo(this.map);
    this.destLayer.bindPopup(this.mapPointDest.name + " (" + this.mapPointDest.latitude.toString() + ", " + this.mapPointDest.longitude.toString() + ")");
    this.map.setView(coordinates, this.map.getZoom());
  }

  private createMarkerStart() { //tạo marker điểm đi mới
    if (this.startLayer) {
      this.map.removeLayer(this.startLayer);
    }
    const mapIcon = this.getDefaultIcon();
    const coordinates = latLng([this.mapPointStart.latitude, this.mapPointStart.longitude]);
    this.startLayer = marker(coordinates).setIcon(mapIcon).addTo(this.map);

    this.startLayer.bindPopup(this.mapPointStart.name + " (" + this.mapPointStart.latitude.toString() + ", " + this.mapPointStart.longitude.toString() + ")");
    this.map.setView(coordinates, this.map.getZoom());

  }

  private getDefaultIcon() { // setting marker
    return icon({
      iconSize: [30, 30],
      iconAnchor: [13, 41],
      iconUrl: 'assets/marker-icon.png'
    });
  }

  private getDotIcon() { // setting marker
    return icon({
      iconSize: [60, 60],
      iconAnchor: [13, 41],
      iconUrl: 'assets/dot.png'
    });
  }
  private getDestIcon() { // setting marker
    return icon({
      iconSize: [30, 30],
      iconAnchor: [13, 41],
      iconUrl: 'assets/dest-icon.png'
    });
  }

  pathLayer = geoJSON();
  // function to get nearest vertex to the passed point
  async getVertex(selectedPoint: any) {
    switch (this.mode){
      case '':
        this.geoServerService.getVertexMotorcycle(selectedPoint).toPromise().then(
          results => {
              this.loadVertex(results)
              console.log(results);
            }
        )
        break;
      case 'car':
        await this.geoServerService.getVertexCar(selectedPoint).toPromise().then(
          results => {
              this.loadVertex(results)
              console.log(results);
            }
        )
        break;
      case 'motorcycle':
        await this.geoServerService.getVertexMotorcycle(selectedPoint).toPromise().then(
          results => {
              this.loadVertex(results)
              console.log(results);
            }
        )
        break;
      case 'foot':
        await this.geoServerService.getVertexFoot(selectedPoint).toPromise().then(
          results => {
              this.loadVertex(results)
              console.log(results);
            }
        )
        break;
      default:
        console.log("Chưa chọn phương tiện để đi!");
        break;
    }
  }

  public loadVertex(response: any) {
    var features = response.features;
    //this.map.removeLayer(this.pathLayer);
    if (this.isSource) {
      this.source = features[0].properties.id;
    } else {
      this.target = features[0].properties.id;
    }
    this.isSource = false;
    // if (this.source != null && this.target != null) {
    //   this.getRoute(this.source, this.target);
    // }
  }
  public getRoute(source: any, target: any) {
    switch (this.mode){
      case '':
        this.getRouteMotorcycle(source, target);
        break;
      case 'car':
        this.getRouteCar(source, target);
        break;
      case 'motorcycle':
        this.getRouteMotorcycle(source, target);
        break;
      case 'foot':
        this.getRouteFoot(source, target);
        break;
      default:
        console.log("Chưa chọn phương tiện để đi!");
        break;
    }
  }

  private getRouteCar(source: any, target: any) {
    this.geoServerService.getRouteCar(source, target).subscribe(results => {
      console.log("Path từ Serve: ", results);
      this.map.removeLayer(this.pathLayer);

      this.markerRoute.clearLayers();
      this.map.removeLayer(this.markerRoute);

      this.pathLayer = geoJSON(results);
      this.map.addLayer(this.pathLayer);

      const mapIcon = this.getDotIcon();

      let coordinates: any;

      let arrName: routePoint[] = []

      let sumLength: number = 0;

      let length: number = 0;
      let time: number = 0.0;

      this.arrRoute = [];

      for (let i = 0; i < results.totalFeatures; i++) {
        // đưa đường thu được vào arrName
        sumLength += results.features[i].properties.length;
      }

      arrName = this.getResults(results, arrName);
      this.addName(results, arrName);
      //xử lí điểm có tên đường trùng nhau

      //this.updateLength(arrName);

      console.log("Tổng quãng đường:", sumLength, " ", length);
      this.map.addLayer(this.markerRoute);
      this.newRoute.emit(arrName);
    })
  }

  private getRouteMotorcycle(source: any, target: any) {
    this.geoServerService.getRouteMotorcycle(source, target).subscribe(results => {
      console.log("Path từ Serve: ", results);
      this.map.removeLayer(this.pathLayer);

      this.markerRoute.clearLayers();
      this.map.removeLayer(this.markerRoute);

      this.pathLayer = geoJSON(results);
      this.map.addLayer(this.pathLayer);

      const mapIcon = this.getDotIcon();

      let coordinates: any;

      let arrName: routePoint[] = []

      let sumLength: number = 0;

      let length: number = 0;
      let time: number = 0.0;

      this.arrRoute = [];

      for (let i = 0; i < results.totalFeatures; i++) {
        // đưa đường thu được vào arrName
        sumLength += results.features[i].properties.length;
      }

      arrName = this.getResults(results, arrName);
      this.addName(results, arrName);
      //xử lí điểm có tên đường trùng nhau


      //this.updateLength(arrName);

      console.log("Tổng quãng đường:", sumLength, " ", length);
      this.map.addLayer(this.markerRoute);
      this.newRoute.emit(arrName);
    })
  }

  private getRouteFoot(source: any, target: any) {
    this.geoServerService.getRouteFoot(source, target).subscribe(results => {
      console.log("Path từ Serve: ", results);
      this.map.removeLayer(this.pathLayer);

      this.markerRoute.clearLayers();
      this.map.removeLayer(this.markerRoute);

      this.pathLayer = geoJSON(results);
      this.map.addLayer(this.pathLayer);

      const mapIcon = this.getDotIcon();

      let coordinates: any;

      let arrName: routePoint[] = []

      let sumLength: number = 0;

      let length: number = 0;
      let time: number = 0.0;

      this.arrRoute = [];

      for (let i = 0; i < results.totalFeatures; i++) {
        // đưa đường thu được vào arrName
        sumLength += results.features[i].properties.length;
      }

      arrName = this.getResults(results, arrName);
      this.addName(results, arrName);
      //xử lí điểm có tên đường trùng nhau

      // this.arrRoute = this.updateLength(arrName);
      // console.log(this.arrRoute);

      console.log("Tổng quãng đường:", sumLength, " ", length);
      this.map.addLayer(this.markerRoute);
      this.newRoute.emit(arrName);
    })
  }
  private addName(results: any, arrName: routePoint[]) {
    for (let i = 0; i < results.totalFeatures; i++) {
      //thêm tên cho các phần tử chưa có tên
      if (arrName[i].name == null) {
        this.nominatimService.latlonLookup(results.features[i].geometry.coordinates[0][0][1],
          results.features[i].geometry.coordinates[0][0][0]).subscribe(results => {
            let name = results.displayName.split(", ")
            if (arrName[i].meter == 0) {
              arrName[i].name = "Đi qua ".concat(name[0] + ", " + name[1]);
            } else {
              arrName[i].name = name[0].concat(", " + name[1]);
            }
          });
      }
    }
  }
  private getResults(results: any, arrName: routePoint[]) {
    for (let i = 0; i < results.totalFeatures; i++) {
      // đưa đường thu được vào arrName
      arrName.push(
        {
          name: results.features[i].properties.name,
          meter: results.features[i].properties.length
        }
      );
    }
    return arrName;
  }
  private updateLength(arrName: routePoint[]) {
    //cộng lại độ dài sau khi gộp
      for (let i = 0; i < arrName.length-1; i++) {
        if (arrName[i].name === arrName[i+1].name) {
          arrName[i].meter = arrName[i].meter + arrName[i+1].meter;
          arrName.splice(arrName.indexOf(arrName[i+1]), 1);
        }
      }
      return arrName;
  }
}


// thêm debugger để xem hàm có được nhảy vào hay ko

// dragg vi tri start thi chua thay doi thanh start

// đưa marker mới sau khi nhận sự kiện draggend thay thế vào marker start
