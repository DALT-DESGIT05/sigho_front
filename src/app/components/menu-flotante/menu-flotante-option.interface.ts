export interface MenuFlotanteOption {
  id: string;
  label: string;
  icon: string;
  visible?: boolean;
  disabled?: boolean;
  variant?: 'normal' | 'destacada' | 'advertencia' | 'parpadeo';
  tooltip?: string;
  posicion?: 'normal' | 'inferior';
}
