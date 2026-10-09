import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingApiComponent } from './components/loading-api/loading-api.component';
import { AuthStatus } from './enums/auth-status.enum';
import { AuthService } from './services/auth/auth.service';

@Component({
  imports: [RouterOutlet, LoadingApiComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly finishedAuthCheck = computed(() => this.authService.authStatus() !== AuthStatus.checking);

  readonly authStatusChangedEffect = effect(() => {
    if (this.authService.authStatus() !== AuthStatus.notAuthenticated) return;

    const reason = sessionStorage.getItem('login_reason');
    void this.router.navigate(['/auth/login'], {
      queryParams: reason ? { reason } : {},
    });
  });
}
