import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, loadingInterceptor])),
    provideEchartsCore({ echarts }),
  ]
};
