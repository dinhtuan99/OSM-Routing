import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NominatimService } from '../../../services/nominatim-service';
import { NominatimResponse } from '../../../shared/models/nominatim-response.model';
import { MapPoint } from '../../models/map-point.model';

interface routePoint {
  name: string;
  meter: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnChanges {

  searchResults: NominatimResponse[] = [];

  @Output()
  locationSelected = new EventEmitter();

  @Output()
  searchInput = new EventEmitter();

  @Output()
  modeSelected = new EventEmitter();

  @Input()
  mapPoint: MapPoint = new MapPoint;

  @Input()
  route!: routePoint[];

  routing: routePoint[] = [];
  sumLength: number = 0;

  locationName: string = '';

  displayedColumns: string[] = ['name', 'meter'];

  mapPointStart: MapPoint = new MapPoint;

  mapPointDest: MapPoint = new MapPoint;

  divide = true;

  public name: string = '';

  lookupResults!: NominatimResponse;

  type: string = '';
  constructor(private nominatimService: NominatimService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.mapPoint.latitude && changes.mapPoint) {
      if (changes.mapPoint.currentValue != changes.mapPoint.previousValue) {
        this.latlonLookup(this.mapPoint.latitude, this.mapPoint.longitude);
      }
    }

    if(this.route && changes.route){
      this.sumLength = 0;
      this.route.forEach(element => {
        this.sumLength += element.meter
      });
    }
  }

  addressLookup(address: string, startDest: string) {
    if (address.length > 3) {
      this.nominatimService.addressLookup(address).subscribe(results => {
        this.searchResults = results;
        this.locationName = startDest;
        console.log("Side bar: ", results, " ", startDest);
      });
    } else {
      this.searchResults = [];
    }
  }

  latlonLookup(lat: number, lon: number) {
    this.nominatimService.latlonLookup(lat, lon).subscribe(results => {
      this.lookupResults = results;
      console.log("LatLon Look up (Sidebar):", results)
      this.mapPoint.latitude = results.latitude;
      this.mapPoint.longitude = results.longitude;
      this.mapPoint.name = results.displayName;
      this.modeSelected.emit(this.type);

      if (this.divide) {
        this.mapPointStart = this.mapPoint;
        this.locationSelected.emit(results);
        this.searchInput.emit("start");
      } else {
        this.mapPointDest = this.mapPoint;
        this.locationSelected.emit(results);
        this.searchInput.emit("dest");
      }
      this.divide = false;
    });
  };
  selectResult(result: NominatimResponse) {
    this.modeSelected.emit(this.type);
    this.locationSelected.emit(result);
    if (this.locationName === "start") {
      this.searchInput.emit(this.locationName);
      this.mapPointStart.latitude = result.latitude;
      this.mapPointStart.longitude = result.longitude;
      this.mapPointStart.name = result.displayName;

    } else if (this.locationName === "dest") {
      this.searchInput.emit(this.locationName);
      this.mapPointDest.latitude = result.latitude;
      this.mapPointDest.longitude = result.longitude;
      this.mapPointDest.name = result.displayName;
    }
    this.searchResults = [];
  }

  reverseLocation(e?: MouseEvent) {
    let temp = this.mapPointDest;
    this.mapPointDest = this.mapPointStart;
    this.mapPointStart = temp;

    let result!: NominatimResponse;

    result.latitude = this.mapPointStart.latitude;
    result.longitude = this.mapPointStart.longitude;
    result.displayName = this.mapPointStart.name;

    this.locationSelected.emit(result);
    this.searchInput.emit("start");

    result.latitude = this.mapPointDest.latitude;
    result.longitude = this.mapPointDest.longitude;
    result.displayName = this.mapPointDest.name;

    this.locationSelected.emit(result);
    this.searchInput.emit("dest");
  }

  mode (type : string){
    this.type = type;
  }
}

//cách dùng property: HTML: [value] = "tên biến", TS: tên biến=" ", gán giá trị vào event selectResult
//Chọn địa điểm theo từng thanh FORM, TO
