import { Component, OnDestroy, input, signal } from '@angular/core';
import { PaletteColor } from '../../interfaces/util.interface';
import { ButtonComponent } from '../button/button.component';

type ViewName = 'chart' | 'detail';

@Component({
  selector: 'app-view-switcher',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './view-switcher.component.html',
  styleUrl: './view-switcher.component.scss',
})
export class ViewSwitcherComponent implements OnDestroy {
  readonly heading = input('');
  readonly eyebrow = input('');
  readonly chartLabel = input('Gr\u00e1fico');
  readonly detailLabel = input('Detalle');
  readonly chartIcon = input('fa-solid fa-chart-column');
  readonly detailIcon = input('fa-solid fa-table-list');
  readonly buttonColor = input<PaletteColor>('primary');
  readonly accentColor = input('var(--palette-primary-fap)');
  readonly accentSoftColor = input('var(--palette-primary-fap-100)');
  /** Alto compartido por cada vista de contenido. */
  readonly contentHeight = input('24rem');
  /** Duracion CSS de la persiana, por ejemplo: '700ms' o '1.5s'. */
  readonly transitionDuration = input('1.1s');
  readonly displayedView = signal<ViewName>('chart');
  readonly transitionPhase = signal<'entering' | 'leaving' | 'idle'>('idle');
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  show(view: ViewName): void {
    if (view === this.displayedView() || this.transitionPhase() === 'leaving') return;

    const duration = this.transitionDurationInMs();
    this.transitionPhase.set('leaving');
    this.schedule(() => {
      this.displayedView.set(view);
      this.transitionPhase.set('entering');
      this.schedule(() => this.transitionPhase.set('idle'), duration);
    }, duration);
  }

  ngOnDestroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
  }

  private schedule(callback: () => void, delay: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
  }

  private transitionDurationInMs(): number {
    const value = this.transitionDuration().trim();
    if (value.endsWith('ms')) return Number.parseFloat(value) || 1100;
    if (value.endsWith('s')) return (Number.parseFloat(value) || 1.1) * 1000;
    return 1100;
  }
}
