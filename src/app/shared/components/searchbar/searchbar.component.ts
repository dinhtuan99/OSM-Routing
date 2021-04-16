import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NominatimService } from '../../../services/nominatim-service';
import { NominatimResponse } from '../../../shared/models/nominatim-response.model';
import { MapPoint } from '../../models/map-point.model';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  @Output()
  locationSearch = new EventEmitter();

  searchResults: NominatimResponse[] = [];
  mapPoint: MapPoint = new MapPoint;
  lookupResults!: NominatimResponse;

  constructor(private nominatimService: NominatimService) { }

  ngOnInit(): void {
  }
  addressLookup(address: string) {
    if (address.length > 3) {
      this.nominatimService.addressLookup(address).subscribe(results => {
        this.searchResults = results;

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
      //this.locationSearch.emit(results);
    });
  };
  selectResult(result: NominatimResponse) {
      this.mapPoint.latitude = result.latitude;
      this.mapPoint.longitude = result.longitude;
      this.mapPoint.name = result.displayName;
      this.locationSearch.emit(result);
    this.searchResults = [];
  }
  toggleSideBar() {
    this.toggleSideBarForMe.emit();
  }

}
