import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AlertComponent } from '../../../../components/alert/alert.component';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';

@Component({
  selector: 'app-menu-reservas',
  imports: [ RouterLink,AlertComponent,CardGeneralComponent],
  templateUrl: './menu-reservas-page.component.html',
  styleUrl: './menu-reservas-page.component.scss',
})
export class MenuReservas {

}
