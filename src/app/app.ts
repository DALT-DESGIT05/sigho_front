import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoadingApiComponent } from './components/loading-api/loading-api.component';
import { AuthStatus } from './enums/auth-status.enum';
import { AuthService } from './services/auth/auth.service';
import { LoginService } from './services/auth/login.service';

@Component({
  imports: [RouterOutlet, LoadingApiComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly login_service = inject(LoginService);
  private readonly router = inject(Router);

  readonly finishedAuthCheck = computed(() => this.authService.authStatus() !== AuthStatus.checking);

  readonly authStatusChangedEffect = effect(() => {
    if (this.authService.authStatus() !== AuthStatus.notAuthenticated) return;

    void this.router.navigate(['/auth/login']);
  });
}
