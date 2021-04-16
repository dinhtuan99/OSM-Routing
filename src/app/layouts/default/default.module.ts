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
import { MatButtonModule } from '@angular/material/button';
import { AboutComponent } from 'src/app/modules/about/about.component';
@NgModule({
  declarations: [
    DefaultComponent,
    DashboardComponent,
    AboutComponent
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
    GeoServerService
  ]
})
export class DefaultModule { }
