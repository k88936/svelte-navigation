import type {StackScreens} from '@k88936/svelte-navigation';
import type {HomeStackParamList, SettingsStackParamList} from './params';
import Home from '../screens/Home.svelte';
import Detail from '../screens/Detail.svelte';
import Sheet from '../screens/Sheet.svelte';
import Settings from '../screens/Settings.svelte';

export const homeScreens = {
    Home: {component: Home, path: '/', options: {title: 'Home'}},
    Detail: {
        component: Detail,
        path: 'Detail/:id',
        options: ({params}) => ({title: `Item ${params.id}`}),
    },
    Sheet: {
        component: Sheet,
        path: 'Sheet',
        options: {presentation: 'modal', animation: 'slide_from_bottom', title: 'Sheet'},
    },
} satisfies StackScreens<HomeStackParamList>;

export const settingsScreens = {
    Settings: {component: Settings, path: 'Settings', options: {title: 'Settings'}},
} satisfies StackScreens<SettingsStackParamList>;
