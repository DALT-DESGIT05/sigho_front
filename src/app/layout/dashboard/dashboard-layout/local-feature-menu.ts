import { MenuItem } from '../../../interfaces/menu.interface';

const LOCAL_FEATURE_MENU: MenuItem[] = [
  {
    id_modulo: 'local-admision',
    label: 'Admisión',
    icon: 'fa fa-clipboard-list',
    children: [
      {
        id_formulario: 'local-admision-nueva',
        label: 'Nueva admisión',
        link: '/emergencia/admision',
        icon: 'fa fa-file-circle-plus',
      },
      {
        id_formulario: 'local-admision-listado',
        label: 'Listado de admisiones',
        icon: 'fa fa-list',
      },
    ],
  },
  {
    id_modulo: 'local-triaje',
    label: 'Triaje',
    icon: 'fa fa-users',
    children: [
      {
        id_formulario: 'local-pacientes-triaje',
        label: 'Listado de triaje',
        link: '/emergencia/pacientes-triaje',
        icon: 'fa fa-list-check',
      },
    ],
  },
  {
    id_modulo: 'local-atencion-medica',
    label: 'Atención médica',
    icon: 'fa fa-user-doctor',
    children: [
      {
        id_formulario: 'local-atencion-medica-listado',
        label: 'Listado de atención médica',
        link: '/emergencia/atencion-medica',
        icon: 'fa fa-list',
      },
    ],
  },
  {
    id_modulo: 'local-personal',
    label: 'Personal',
    icon: 'fa fa-calendar-days',
    children: [
      {
        id_formulario: 'local-programacion-personal',
        label: 'Programación',
        link: '/personal/horarios',
        icon: 'fa fa-calendar-check',
      },
      {
        id_formulario: 'local-catalogo-turnos',
        label: 'Turnos',
        link: '/personal/turnos',
        icon: 'fa fa-clock',
      },
      {
        id_formulario: 'local-mi-horario',
        label: 'Mi horario',
        link: '/personal/mi-horario',
        icon: 'fa fa-calendar-day',
      },
    ],
  },
];

export function mergeLocalFeatureMenu(remoteMenu: MenuItem[]): MenuItem[] {
  const menu = remoteMenu.map(cloneMenuItem);
  const registeredLinks = new Set(menu.flatMap(collectLinks));

  for (const localModule of LOCAL_FEATURE_MENU) {
    const missingChildren = (localModule.children ?? []).filter((item) => {
      if (item.children?.length) {
        return !collectLinks(item).some((link) => registeredLinks.has(link));
      }

      const link = normalizeLink(item.link);
      return !link || !registeredLinks.has(link);
    });

    if (!missingChildren.length) continue;

    const existingModule = menu.find(
      (item) => normalizeLabel(item.label) === normalizeLabel(localModule.label),
    );

    if (existingModule) {
      existingModule.children = [...(existingModule.children ?? []), ...missingChildren.map(cloneMenuItem)];
    } else {
      menu.push({ ...cloneMenuItem(localModule), children: missingChildren.map(cloneMenuItem) });
    }

    missingChildren.forEach((item) => {
      const link = normalizeLink(item.link);
      if (link) registeredLinks.add(link);
    });
  }

  return menu;
}

function cloneMenuItem(item: MenuItem): MenuItem {
  return {
    ...item,
    children: item.children?.map(cloneMenuItem),
  };
}

function collectLinks(item: MenuItem): string[] {
  const links = item.children?.flatMap(collectLinks) ?? [];
  const link = normalizeLink(item.link);

  return link ? [link, ...links] : links;
}

function normalizeLabel(label: string): string {
  return label.trim().toLocaleLowerCase();
}

function normalizeLink(link: string | undefined): string {
  return link?.trim().replace(/\/+$/, '') ?? '';
}
