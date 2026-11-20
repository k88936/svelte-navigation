<script lang="ts">
    import {createNativeStackNavigator} from '@k88936/svelte-navigation';
    import type {SettingsStackParamList} from '../params';
    import {settingsScreens} from './screens';

    const Stack = createNativeStackNavigator<SettingsStackParamList>();
</script>

<Stack.Navigator
    screens={settingsScreens}
    initialRouteName="Settings"
    screenOptions={{headerBackLabel: 'Back'}}
    layerClass="bg-light text-dark"
/>
