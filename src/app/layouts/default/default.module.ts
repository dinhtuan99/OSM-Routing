import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default.component';
import { DashboardComponent } from 'src/app/modules/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LeafletModule } from 'node_modules/@asymmetrik/ngx-leaflet';
import { NominatimService } from 'src/app/services/nominatim-service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GeoServerService } from 'src/app/services/geoServer-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { RoutingInfoComponent } from 'src/app/modules/routing-info/routing-info.component';
import { RoutingInfoService } from 'src/app/services/routing-info.service';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [
    DefaultComponent,
    DashboardComponent,
    RoutingInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    MatSidenavModule,
    LeafletModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatTableModule,
    MatButtonModule
  ],
  providers:[
    NominatimService,
    GeoServerService,
    RoutingInfoService
  ],
  entryComponents:[
    RoutingInfoComponent
  ]
})
export class DefaultModule { }
