import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <section class="welcome-page">
      <h1>Bienvenido a SIGHO WEB FAP</h1>
    </section>
  `,
  styles: `
    .welcome-page { padding: 2rem; }
    h1 { color: #315b7d; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
