import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NominatimResponse } from '../shared/models/nominatim-response.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GeoServerService {
  totalAngularPackages: any;
  errorMessage: any;
  constructor(private httpClient: HttpClient) {
  }

  // public getData(url: string) {
  //     return this.httpClient.get(url).toPromise();
  // }

  /** GET heroes from the server */
  // getData(url: string): any {
  //   return this.httpClient.get(url);
  // }

  getData(selectedPoint: any): Observable<any> {
    // let url = `http://127.0.0.1:8080/geoserver/routing/wfs?service=WFS
    // &version=1.0.0
    // &request=GetFeature
    // &typeName=routing:nearest_vertex
    // &outputformat=application/json
    // &viewparams=x:${
    //   selectedPoint.longitude
    // };y:${selectedPoint.latitude};`


    let url = `http://127.0.0.1:8080/geoserver/HaNoiRouting/wfs?service=WFS
    &version=1.0.0
    &request=GetFeature
    &typeName=HaNoiRouting:get_vertex
    &outputformat=application/json
    &viewparams=x:${
      selectedPoint.longitude
    };y:${selectedPoint.latitude};`

    return this.httpClient
    .get(url).pipe(
      map((data: any) => data
      )
    )
  }
  getRoute(source: any, target: any): Observable<any> {
    // let url = `http://127.0.0.1:8080/geoserver/routing/wfs?
    // service=WFS&version=1.0.0
    // &request=GetFeature
    // &typeName=routing:shortest_path
    // &viewparams=source:${source};target:${target};
    // &outputformat=application/json`
    let url = `http://127.0.0.1:8080/geoserver/HaNoiRouting/wfs?
    service=WFS&version=1.0.0
    &request=GetFeature
    &typeName=HaNoiRouting:get_route
    &viewparams=source:${source};target:${target};
    &outputformat=application/json`
    return this.httpClient
    .get(url).pipe(
      map((route: any) => route)
    )
  }
}
