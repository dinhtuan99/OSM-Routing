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

  getVertexCar(selectedPoint: any): Observable<any> {

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

  getVertexMotorcycle(selectedPoint: any): Observable<any> {

    let url = `http://127.0.0.1:8080/geoserver/HaNoiRouting/wfs?service=WFS
    &version=1.0.0
    &request=GetFeature
    &typeName=HaNoiRouting:get_vertexMotocycle
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

  getVertexFoot(selectedPoint: any): Observable<any> {

    let url = `http://127.0.0.1:8080/geoserver/HaNoiRouting/wfs?service=WFS
    &version=1.0.0
    &request=GetFeature
    &typeName=HaNoiRouting:get_vertexFoot
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

  getRouteCar(source: any, target: any): Observable<any> {

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

  getRouteMotorcycle(source: any, target: any): Observable<any> {

    let url = `http://127.0.0.1:8080/geoserver/HaNoiRouting/wfs?
    service=WFS&version=1.0.0
    &request=GetFeature
    &typeName=HaNoiRouting:get_routeMotocycle
    &viewparams=source:${source};target:${target};
    &outputformat=application/json`
    return this.httpClient
    .get(url).pipe(
      map((route: any) => route)
    )
  }

  getRouteFoot(source: any, target: any): Observable<any> {

    let url = `http://127.0.0.1:8080/geoserver/HaNoiRouting/wfs?
    service=WFS&version=1.0.0
    &request=GetFeature
    &typeName=HaNoiRouting:get_routeFoot
    &viewparams=source:${source};target:${target};
    &outputformat=application/json`
    return this.httpClient
    .get(url).pipe(
      map((route: any) => route)
    )
  }
}
