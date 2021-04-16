import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NominatimResponse } from '../shared/models/nominatim-response.model';
import { map } from 'rxjs/operators';
import { BASE_NOMINATIM_URL, DEFAULT_VIEW_BOX } from '../app.constants';

@Injectable()
export class NominatimService {

  constructor(private http: HttpClient) {
  }

  addressLookup(req?: any): Observable<NominatimResponse[]> {
    //let url = `http://10.159.21.212:5307/search?format=json&q=${req}&${DEFAULT_VIEW_BOX}&bounded=1`;
    let url = `http://${BASE_NOMINATIM_URL}/search?format=json&q=${req}&${DEFAULT_VIEW_BOX}&bounded=1`;
    return this.http
      .get(url).pipe(
        map((data: any) => data.map((item: any) => new NominatimResponse(
          item.lat,
          item.lon,
          item.display_name
        ))
        )
      )
  }
  latlonLookup(lat?: any, lon?: any): Observable<NominatimResponse> {
    //let url = `http://10.159.21.212:5307/reverse?format=json&lat=${lat}&lon=${lon}`;
    let url = `http://${BASE_NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`;
    return this.http
      .get(url).pipe(
        map((data: any) => new NominatimResponse(
          data.lat,
          data.lon,
          data.display_name
        ))
      )
  }
}
