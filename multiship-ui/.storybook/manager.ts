import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Multiship Retro UI',
    brandTarget: '_self',
    colorPrimary: '#39FF14',
    colorSecondary: '#00FFFF',
    appBg: '#0b0b0b',
    appContentBg: '#111111',
    appBorderColor: '#39FF14',
    appBorderRadius: 4,
    barBg: '#0f0f0f',
    barTextColor: '#39FF14',
    barSelectedColor: '#00FFFF',
    barHoverColor: '#39FF14',
    textColor: '#ffffff',
    textInverseColor: '#0b0b0b',
    fontBase: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontCode: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  }),
});
