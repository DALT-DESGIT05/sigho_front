import { Component, computed, inject, OnInit, viewChild } from '@angular/core';
import {
  RouterModule,
  RouterOutlet,
  ActivatedRoute,
  Router,
  NavigationEnd,
  NavigationStart,
  IsActiveMatchOptions,
} from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { filter, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ImageLazyComponent } from '../../../components/image-lazy/image-lazy.component';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../interfaces/menu.interface';
import { Last_activity_component } from '../../../components/last-activity/last-activity.component';
import { ButtonComponent } from '../../../components/button/button.component';
import { ModalComponent } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ImageLazyComponent, Last_activity_component, ButtonComponent, ModalComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
  host: { '(window:resize)': 'onWindowResize()', '(document:click)': 'onDocumentClick($event)' },
})
export class DashboardLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private menuService = inject(MenuService);

  isSidebarOpen = false;
  isSidebarCollapsed = false;
  isHeaderScrolled = false;
  isProfileMenuOpen = false;
  openMenuGroups: Record<string, boolean> = {};

  pageTitle: string = '';
  breadcrumbs: any[] = [];

  public usuario = computed(() => this.authService.currentUser());
  public roles_usuario = computed(() => this.authService.get_roles());
  readonly profileModal = viewChild<ModalComponent>('profileModal');

  nombre_unidad = sessionStorage.getItem('nombre_unidad');
  contrasena_cambiada = sessionStorage.getItem('contrasena_cambiada');
  es_ipress = sessionStorage.getItem('es_ipress') === 'true';

  ipress: boolean = this.es_ipress;

  menuItems: MenuItem[] = [];
  isMenuLoading = true;
  activeMenuPath: MenuItem[] = [];

  ngOnInit() {
    this.updateHeaderScrollState();
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe(event => {
        const llamadoPaciente = sessionStorage.getItem('llamado-paciente');

        if (llamadoPaciente === 'true') {
          Swal.fire({
            title: 'Acción no permitida',
            text: 'No puede navegar mientras un paciente está siendo atendido.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
          });
          this.router.navigateByUrl(this.router.url);
        }
      });

    // 🔹 Manejo de breadcrumbs y título dinámico
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.buildNavigationState())
      )
      .subscribe(({ title, breadcrumbs }) => {
        this.pageTitle = title;
        this.breadcrumbs = breadcrumbs;
        this.syncActiveMenuGroup();
      });

    const initialNavigation = this.buildNavigationState();
    this.pageTitle = initialNavigation.title;
    this.breadcrumbs = initialNavigation.breadcrumbs;

    this.cargarMenu();

    // 🔹 Redirigir a perfil si debe cambiar contraseña
    if (this.contrasena_cambiada === '1') {
      this.router.navigateByUrl('perfil/perfil-usuario');
    }

    this.syncActiveMenuGroup();
  }

  onPageScroll(event: Event): void {
    this.isHeaderScrolled = (event.target as HTMLElement).scrollTop > 8;
  }

  private updateHeaderScrollState(): void {
    this.isHeaderScrolled = false;
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout().subscribe({
      next: () => {
        Swal.fire({
          title: "Logout",
          text: "Se cerró la sesión correctamente",
          icon: "success",
          timer: 1500
        });
      },
      error: (error) => {
        Swal.fire('Logout', error.data.message, 'error');
      }
    });
  }

  salir(): void {
    this.closeProfileModal();
    this.logout();
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  onDocumentClick(event: Event): void {
    const target = event.target;
    if (target instanceof Element && !target.closest('.u-pro')) {
      this.closeProfileMenu();
    }
  }

  openProfileModal(): void {
    this.closeProfileMenu();
    this.profileModal()?.open();
  }

  closeProfileModal(): void {
    this.profileModal()?.close();
  }

  get isSidebarVisible(): boolean {
    return window.matchMedia('(max-width: 991px)').matches
      ? this.isSidebarOpen
      : !this.isSidebarCollapsed;
  }

  toggleSidebar(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = !this.isSidebarOpen;
      return;
    }

    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile(): void {
    if (this.isMobileViewport()) {
      this.isSidebarOpen = false;
    }
  }

  onWindowResize(): void {
    if (!this.isMobileViewport()) {
      this.isSidebarOpen = false;
    }
  }

  toggleMenuGroup(option: MenuItem, parent?: MenuItem): void {
    const groupKey = this.getMenuGroupKey(option);
    const isOpen = this.openMenuGroups[groupKey];

    if (!parent) {
      this.openMenuGroups = isOpen ? {} : { [groupKey]: true };
      return;
    }

    const parentKey = this.getMenuGroupKey(parent);
    this.openMenuGroups = isOpen
      ? { [parentKey]: true }
      : { [parentKey]: true, [groupKey]: true };
  }

  getMenuGroupKey(option: MenuItem): string {
    if (option.id_modulo) return `mod-${option.id_modulo}`;
    if (option.id_formulario) return `form-${option.id_formulario}`;
    return option.label;
  }

  trackMenuOption(index: number, option: MenuItem): string {
    return option.id_modulo || option.label || String(index);
  }

  trackMenuChild(index: number, child: MenuItem): string {
    return child.id_formulario || child.label || String(index);
  }

  isMenuGroupOpen(option: MenuItem): boolean {
    return !!this.openMenuGroups[this.getMenuGroupKey(option)];
  }

  isActiveMenuGroup(option: MenuItem): boolean {
    return option.children?.some((child) => this.isActiveMenuItem(child)) || false;
  }

  isActiveMenuOption(option: MenuItem): boolean {
    return this.isActiveMenuItem(option);
  }

  getMenuLink(option: MenuItem): string {
    return option.link || '/';
  }

  get pageMenuTitle(): string {
    return this.activeMenuPath.length ? this.activeMenuPath
      .map((item) => item.label)
      .filter(Boolean)
      .join(' / ') : this.pageTitle;
  }

  get pageMenuIcon(): string {
    return this.activeMenuPath[0]?.icon || 'fa fa-circle-info';
  }

  private syncActiveMenuGroup(): void {
    const activePath = this.findActiveMenuPath(this.menuItems);
    this.activeMenuPath = activePath;
    if (activePath.length) {
      this.pageTitle = activePath[activePath.length - 1].label;
      this.breadcrumbs = activePath.map((item) => ({
        label: item.label,
        url: item.link?.trim() || undefined
      }));
    }
    this.openMenuGroups = activePath
      .filter((item) => item.children?.length)
      .reduce<Record<string, boolean>>((groups, item) => ({ ...groups, [this.getMenuGroupKey(item)]: true }), {});
  }

  private buildNavigationState(): { title: string; breadcrumbs: Array<{ label: string; url?: string }> } {
    let current: ActivatedRoute | null = this.route;
    let title = '';
    let breadcrumbs: Array<{ label: string; url?: string }> = [];

    while (current) {
      const data = current.snapshot.data;
      if (data['title']) title = data['title'];
      if (Array.isArray(data['breadcrumbs']) && data['breadcrumbs'].length) {
        breadcrumbs = data['breadcrumbs'];
      }
      current = current.firstChild;
    }

    return { title, breadcrumbs };
  }


  cargarMenu(): void {
    this.isMenuLoading = true;

    this.menuService.loadMenu().subscribe({
      next: (menu) => {
        // 🔹 Sanitizamos recursivamente los enlaces antes de asignarlos al estado
        this.menuItems = this.sanitizarEnlacesMenu(menu);
        this.isMenuLoading = false;
        this.syncActiveMenuGroup();
      },
      error: (error) => {
        this.menuItems = [];
        this.isMenuLoading = false;
      }
    });
  }

  /**
   * Recorre de forma recursiva los ítems del menú y remueve espacios en blanco
   * innecesarios en la propiedad 'link' usando .trim().
   */
  private sanitizarEnlacesMenu(items: MenuItem[]): MenuItem[] {
    if (!items) return [];

    return items.map(item => ({
      ...item,
      label: item.label?.replace(/telemedicina/gi, 'Teleconsulta') || item.label,
      link: item.link ? item.link.trim() : item.link,
      children: item.children ? this.sanitizarEnlacesMenu(item.children) : item.children
    }));
  }

  isActiveLink(link: string): boolean {
    const matchOptions: IsActiveMatchOptions = {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored'
    };
    return this.router.isActive(link === '' ? '/' : link, matchOptions);
  }

  private isActiveMenuItem(item: MenuItem): boolean {
    if (item.link && this.isActiveLink(item.link)) {
      return true;
    }

    return item.children?.some((child) => this.isActiveMenuItem(child)) || false;
  }

  private isMobileViewport(): boolean {
    return window.matchMedia('(max-width: 991px)').matches;
  }

  private findActiveMenuPath(items: MenuItem[], parents: MenuItem[] = []): MenuItem[] {
    for (const item of items) {
      const currentPath = [...parents, item];

      if (item.link && this.isActiveLink(item.link)) {
        return currentPath;
      }

      if (item.children?.length) {
        const childPath = this.findActiveMenuPath(item.children, currentPath);
        if (childPath.length) {
          return childPath;
        }
      }
    }

    return [];
  }
}
