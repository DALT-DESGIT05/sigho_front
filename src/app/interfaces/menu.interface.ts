export interface MenuFormularioApi {
  id_formulario: string;
  nombre_formulario: string;
  privilegio: string | null;
  url?: string | null;  // <-- Permitimos null o string desde la API
  link?: string;
  ruta?: string;
  icon?: string | null;
  icono?: string | null;
  children?: MenuFormularioApi[];
  submenus?: MenuFormularioApi[];
  hijos?: MenuFormularioApi[];
  formularios?: MenuFormularioApi[];
  sub_formularios?: MenuFormularioApi[];
}

export interface MenuModuloApi {
  id_modulo: string;
  nombre_modulo: string;
  icon?: string | null;
  icono?: string | null;
  formularios: MenuFormularioApi[];
}

export interface MenuItem {
  label: string;
  link?: string;        // <-- Aquí se guardará la URL mapeada
  icon: string;         // Requerido por tu diseño
  id_modulo?: string;   // Para los trackBy y toggles
  id_formulario?: string;
  children?: MenuItem[];
}
