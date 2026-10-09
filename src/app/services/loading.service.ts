import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private static readonly MINIMUM_VISIBLE_MS = 350;
  private readonly peticionesPendientes = signal(0);
  private readonly visible = signal(false);
  private inicioCarga = 0;
  private duracion_minima_carga = LoadingService.MINIMUM_VISIBLE_MS;
  private hideTimer?: ReturnType<typeof setTimeout>;

  readonly activo = computed(() => this.visible());

  iniciar(duracion_minima_ms = LoadingService.MINIMUM_VISIBLE_MS): void {
    if (this.peticionesPendientes() === 0) {
      this.cancelarOcultamiento();
      this.inicioCarga = Date.now();
      this.duracion_minima_carga = Math.max(LoadingService.MINIMUM_VISIBLE_MS, duracion_minima_ms);
      this.visible.set(true);
    } else {
      this.duracion_minima_carga = Math.max(this.duracion_minima_carga, duracion_minima_ms);
    }

    this.peticionesPendientes.update((cantidad) => cantidad + 1);
  }

  finalizar(): void {
    this.peticionesPendientes.update((cantidad) => Math.max(0, cantidad - 1));

    if (this.peticionesPendientes() > 0) {
      return;
    }

    const restante = Math.max(0, this.duracion_minima_carga - (Date.now() - this.inicioCarga));
    if (restante === 0) {
      this.visible.set(false);
      return;
    }

    this.hideTimer = setTimeout(() => {
      if (this.peticionesPendientes() === 0) {
        this.visible.set(false);
      }
      this.hideTimer = undefined;
    }, restante);
  }

  private cancelarOcultamiento(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }
}
