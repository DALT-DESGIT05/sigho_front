import { mergeLocalFeatureMenu } from './local-feature-menu';

describe('mergeLocalFeatureMenu', () => {
  it('adds the temporary Emergency and Personal menus when the remote menu is empty', () => {
    const menu = mergeLocalFeatureMenu([]);

    expect(menu.map((item) => item.label)).toEqual(['Admisión', 'Triaje', 'Atención médica', 'Personal']);
    const admision = menu.find((item) => item.label === 'Admisión');
    expect(admision?.children?.map((child) => child.label)).toEqual([
      'Nueva admisión',
      'Listado de admisiones',
    ]);
    expect(menu.find((item) => item.label === 'Triaje')?.children?.[0].link).toBe('/emergencia/pacientes-triaje');
    expect(menu.find((item) => item.label === 'Atención médica')?.children?.[0].link).toBe('/emergencia/atencion-medica');
    expect(menu.find((item) => item.label === 'Personal')?.children?.map((child) => child.link)).toEqual([
      '/personal/horarios',
      '/personal/turnos',
      '/personal/mi-horario',
    ]);
  });

  it('does not duplicate routes already supplied by the remote menu', () => {
    const menu = mergeLocalFeatureMenu([
      {
        id_modulo: '4',
        label: 'EMERGENCIA',
        icon: 'fa fa-ambulance',
        children: [
          {
            id_formulario: '10',
            label: 'Admisión existente',
            link: '/emergencia/admision',
            icon: 'fa fa-file',
          },
        ],
      },
    ]);

    expect(menu.filter((item) => item.label.toLowerCase() === 'emergencia')).toHaveLength(1);
    expect(menu.find((item) => item.label === 'EMERGENCIA')?.children?.map((item) => item.link)).toEqual([
      '/emergencia/admision',
    ]);
  });
});
