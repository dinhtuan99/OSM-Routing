import { OnInit } from '@angular/core';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RoutingInfoService } from 'src/app/services/routing-info.service';


interface routePoint {
  name: string;
  meter: number;
}

@Component({
  selector: 'app-routing-info',
  templateUrl: './routing-info.component.html',
  styleUrls: ['./routing-info.component.scss']
})

export class RoutingInfoComponent implements OnInit {
  displayedColumns: string[] = ['name', 'meter'];

  @Input()
  name!: routePoint[];
  @Output() loaded: EventEmitter<null> = new EventEmitter<null>();
  @Output() destroyed: EventEmitter<null> = new EventEmitter<null>();

  ngOnInit() {
    this.loaded.emit();
  }

  ngOnDestroy() {
    this.destroyed.emit();
  }
  constructor(private routingService: RoutingInfoService) { }

  close() {
    //this.name =[];
    this.routingService.close();
  }
  // getTotalCost() {
  //   return this.name.map(t => Number(t.meter.toFixed(2))).reduce((acc, value) => acc + value, 0);
  // }
}
