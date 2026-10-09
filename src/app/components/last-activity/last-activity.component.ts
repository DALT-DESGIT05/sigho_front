import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-last-activity',
  standalone: true,
  templateUrl: './last-activity.component.html',
  styleUrl: './last-activity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Last_activity_component implements OnInit, OnDestroy {
  private readonly auth_service = inject(AuthService);
  private readonly ahora = signal(Date.now());
  private intervalo_actualizacion?: ReturnType<typeof setInterval>;

  readonly tiempo_transcurrido = computed(() => {
    const last_activity = this.auth_service.b_last_activity();
    const ahora = this.ahora();

    if (!last_activity) {
      return null;
    }

    const fecha_actividad = new Date(last_activity).getTime();

    if (Number.isNaN(fecha_actividad)) {
      return null;
    }

    const segundos = Math.max(0, Math.floor((ahora - fecha_actividad) / 1000));

    if (segundos < 60) return `hace ${segundos} s`;

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;

    return `hace ${Math.floor(horas / 24)} d`;
  });

  readonly last_activity_title = computed(() => this.auth_service.b_last_activity() ?? '');

  ngOnInit(): void {
    this.intervalo_actualizacion = setInterval(() => this.ahora.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalo_actualizacion) {
      clearInterval(this.intervalo_actualizacion);
    }
  }
}
