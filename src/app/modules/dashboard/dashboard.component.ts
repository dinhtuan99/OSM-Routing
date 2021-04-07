import { Component, OnInit,SimpleChanges, Input, OnChanges, Output, EventEmitter, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, OnDestroy } from '@angular/core';
import { icon, latLng, LeafletMouseEvent, Map, MapOptions, marker, tileLayer, control, Routing, geoJSON, layerGroup } from 'leaflet';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '../../app.constants';
import { MapPoint } from '../../shared/models/map-point.model';
import { NominatimResponse } from '../../shared/models/nominatim-response.model';
import { GeoServerService } from '../../services/geoServer-service'
import 'leaflet-routing-machine';
import { RoutingInfoComponent } from 'src/app/modules/routing-info/routing-info.component'
import { RoutingInfoService } from 'src/app/services/routing-info.service';
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
export class DashboardComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  selected: any;

  @Input()
  fromOrTo: any;

  @Input()
  mode: string = '';
  @Output()
  newPoint = new EventEmitter();

  @Output()
  newRoute = new EventEmitter();

  public map!: Map;
  options!: MapOptions;

  startLayer: any;
  destLayer: any;

  mapPoint: MapPoint = new MapPoint;
  mapPointStart: MapPoint = new MapPoint;
  mapPointDest: MapPoint = new MapPoint;

  markerRoute = layerGroup();
  pointStartFirst = true;

  results!: NominatimResponse[];

  geoserverUrl = "http://127.0.0.1:8080/geoserver/routing";
  selectedPoint = null;

  source = null;
  target = null;
  isSource = true;

  arrRoute: routePoint[] = [];

  childLoaded: boolean = false;
  componentRef!: ComponentRef<RoutingInfoComponent>;
  @ViewChild('template', { read: ViewContainerRef })
  viewTemplate!: ViewContainerRef;
  ViewContainerRef: any;

  constructor(
    private geoServerService: GeoServerService,
    private cfr: ComponentFactoryResolver,
    private routingService: RoutingInfoService,
    private nominatimService: NominatimService
  ) { }

  loadComponent() {
    const componentFactory = this.cfr.resolveComponentFactory(RoutingInfoComponent);
    this.componentRef = this.viewTemplate.createComponent(componentFactory);
    // (this.componentRef.instance as any).loaded.subscribe(() => {
    //   this.childLoaded = true;
    // });
    this.componentRef.instance.name = this.arrRoute;
  }

  ngOnInit() {
    this.initializeMapOptions();

    this.routingService.close$.subscribe(reson => {
      this.viewTemplate.clear();

      if (this.componentRef) {
        this.componentRef.destroy();
      }
    });
  }
  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.instance.name = [];
      this.componentRef.destroy();
    }
  }
  ngOnChanges(changes: SimpleChanges) { //nhận dữ liệu khi selected thay đổi

    if (this.selected) {
      console.log('Nhận dữ liệu sau khi chọn địa điểm từ Sidebar: ', this.selected)
      if (this.fromOrTo === "start") {
        console.log("start");
        this.pointStartFirst = true;
        this.updateMapPoint(this.selected.latitude, this.selected.longitude, this.selected.displayName);
      } else {
        this.updateMapPoint(this.selected.latitude, this.selected.longitude, this.selected.displayName);
      }
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

  private updateMapPoint(latitude: number, longitude: number, name?: string) {  // cập nhật điểm trên bản đồ

    if (this.pointStartFirst) {
      this.mapPointStart = {
        latitude: latitude,
        longitude: longitude,
        name: name ? name : this.mapPointStart.name
      }
      this.isSource = true;
      this.getVertex(this.mapPointStart);
      this.createMarkerStart();
      this.pointStartFirst = false;
    } else {
      this.mapPointDest = {
        latitude: latitude,
        longitude: longitude,
        name: name ? name : this.mapPointDest.name
      }
      //this.isSource = false;
      this.getVertex(this.mapPointDest);
      this.createMarkerDest();
    }
    this.pointStartFirst = false;
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

    //this.routing(this.mapPointStart, this.mapPointDest);

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

    // if (this.mapPointStart != null) {
    //   this.getVertex(this.mapPointStart);
    //   this.getVertex(this.mapPointDest);
    // }
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
  private routing(a: any, b: any) {
    if (a != null && b != null) {
      Routing.control({
        waypoints: [
          latLng(a.latitude, a.longitude), latLng(b.latitude, b.longitude)
        ],
        routeWhileDragging: true
      }).addTo(this.map);
    }
  }

  pathLayer = geoJSON();
  // function to get nearest vertex to the passed point
  public getVertex(selectedPoint: any) {
    switch (this.mode){
      case '':
        this.geoServerService.getVertexMotorcycle(selectedPoint).subscribe(results => {
          this.loadVertex(results)
          console.log(results);
        });
        break;
      case 'car':
        this.geoServerService.getVertexCar(selectedPoint).subscribe(results => {
          this.loadVertex(results)
          console.log(results);
        });
        break;
      case 'motorcycle':
        this.geoServerService.getVertexMotorcycle(selectedPoint).subscribe(results => {
          this.loadVertex(results)
          console.log(results);
        });
        break;
      case 'foot':
        this.geoServerService.getVertexFoot(selectedPoint).subscribe(results => {
          this.loadVertex(results)
          console.log(results);
        });
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
    console.log(this.source + " " + this.target);
    if (this.source != null && this.target != null) {
      this.getRoute(this.source, this.target);
    }
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

      console.log(arrName.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i));

      this.updateLength(this.arrRoute, arrName);

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

      console.log(arrName.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i));

      this.updateLength(this.arrRoute, arrName);

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

      console.log(arrName.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i));

      this.updateLength(this.arrRoute, arrName);

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
  private updateLength(arrRoute: routePoint[], arrName: routePoint[]) {
    //cộng lại độ dài sau khi gộp
    for (let j = 0; j < this.arrRoute.length; j++) {
      this.arrRoute[j].meter = 0;
      for (let i = 0; i < arrName.length; i++) {
        if (this.arrRoute[j].name === arrName[i].name) {
          this.arrRoute[j].meter += arrName[i].meter;
        }
      }
    }
  }
}


// thêm debugger để xem hàm có được nhảy vào hay ko

// dragg vi tri start thi chua thay doi thanh start

// đưa marker mới sau khi nhận sự kiện draggend thay thế vào marker start
