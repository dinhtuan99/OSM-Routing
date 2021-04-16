import { OnInit } from '@angular/core';
import { Component} from '@angular/core';
import { MapPoint } from 'src/app/shared/models/map-point.model';
import { NominatimResponse } from 'src/app/shared/models/nominatim-response.model';

interface routePoint {
  name: string;
  meter: number;
}

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
})
export class DefaultComponent implements OnInit {
  items: MapPoint = new MapPoint;
  sideBarOpen = false;
  sideBarClose = true;
  results!: NominatimResponse[];
  selectResult: any;
  search: any;
  fromTo: any;
  route: routePoint[] = [];
  constructor() { }
  type: string = '';
  ngOnInit() { }
  addItem(newItem: NominatimResponse) {
    this.selectResult = newItem;
    console.log("Default: " + this.selectResult.latitude);
  }
  searchResult(result: NominatimResponse){
    this.search = result;
    console.log("Default: " + this.search.latitude);
  }
  mode(type: string){
    this.type = type;
  }
  fromOrTo(location: any) {
    this.fromTo = location;
  }
  sideBarToggler() {
    this.sideBarOpen = true;
  }
  closeSideBarDf(){
    this.sideBarOpen  = false;
  }
  refreshSearchList(results: NominatimResponse[]) {
    this.results = results;
  }
  addPoint(newItem: MapPoint) {
    this.items = newItem;
    console.log("Add point (Default) ", newItem);
  }
  newRoute( newRoute:routePoint[]){
    this.route = newRoute;
  }
}
