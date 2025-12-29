<script setup lang="ts">
import { ref, onMounted, shallowRef, watch, computed, onUnmounted } from 'vue';
import client from '../Scrcpy/adb-client';
import { AdbDaemonWebUsbDeviceWatcher, AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb';
import DeviceGuide from './DeviceGuide.vue';

// 使用 Vue 3 的新语法定义 emit
const emit = defineEmits(['pair-device', 'remove-device', 'update-connection-status', 'update:modelValue']);

const props = defineProps<{
  modelValue?: boolean;
}>();

const showDevices = ref(props.modelValue || false);

// 监听外部modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    showDevices.value = newValue;
  }
});

// 监听内部showDevices变化，通知外部
watch(showDevices, (newValue) => {
  emit('update:modelValue', newValue);
});
const selected = shallowRef<AdbDaemonWebUsbDevice | undefined>(undefined);
const usbDeviceList = shallowRef<AdbDaemonWebUsbDevice[]>([]);
const watcher = shallowRef<AdbDaemonWebUsbDeviceWatcher | null>(null);
const errorMessage = ref('');
const errorDetails = ref('');
const isLoading = ref(false);
const deviceInfo = ref<{ model: string; androidVersion: string } | null>(null);
const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('disconnected');
const autoReconnectAttempts = ref(0);
const maxAutoReconnectAttempts = 3;
const disconnectionMessage = ref('');

// 本地存储键名
const LAST_CONNECTED_DEVICE_KEY = 'lastConnectedScrcpyDevice';

// 检测是否在浏览器插件环境中
const isBrowserExtension = () => {
    try {
        return !!(window as any).chrome?.storage;
    } catch (error) {
        return false;
    }
};

// 保存上次连接的设备信息到本地存储
const saveLastConnectedDevice = (device: AdbDaemonWebUsbDevice) => {
    const deviceInfo = {
        serial: device.serial,
        name: device.name
    };
    
    try {
        if (isBrowserExtension()) {
            // 在浏览器插件环境中使用chrome.storage
            (window as any).chrome.storage.local.set({
                [LAST_CONNECTED_DEVICE_KEY]: deviceInfo
            }, () => {
                if ((window as any).chrome.runtime.lastError) {
                    console.error('Failed to save last connected device to chrome.storage:', (window as any).chrome.runtime.lastError);
                } else {
                    console.log('Saved last connected device to chrome.storage:', device.serial);
                }
            });
        } else {
            // 在普通Web环境中使用localStorage
            localStorage.setItem(LAST_CONNECTED_DEVICE_KEY, JSON.stringify(deviceInfo));
            console.log('Saved last connected device to localStorage:', device.serial);
        }
    } catch (error) {
        console.error('Failed to save last connected device to storage:', error);
    }
};

// 从本地存储获取上次连接的设备信息
const getLastConnectedDevice = () => {
    try {
        if (isBrowserExtension()) {
            // 在浏览器插件环境中使用chrome.storage
            return new Promise((resolve) => {
                (window as any).chrome.storage.local.get(LAST_CONNECTED_DEVICE_KEY, (result: any) => {
                    if ((window as any).chrome.runtime.lastError) {
                        console.error('Failed to get last connected device from chrome.storage:', (window as any).chrome.runtime.lastError);
                        resolve(null);
                    } else {
                        const saved = result[LAST_CONNECTED_DEVICE_KEY];
                        if (saved) {
                            console.log('Got last connected device from chrome.storage:', saved);
                            resolve(saved);
                        } else {
                            resolve(null);
                        }
                    }
                });
            });
        } else {
            // 在普通Web环境中使用localStorage
            const saved = localStorage.getItem(LAST_CONNECTED_DEVICE_KEY);
            if (saved) {
                const deviceInfo = JSON.parse(saved);
                console.log('Got last connected device from localStorage:', deviceInfo);
                return deviceInfo;
            }
            return null;
        }
    } catch (error) {
        console.error('Failed to get last connected device from storage:', error);
        return null;
    }
};

// 清除本地存储中的上次连接设备信息
const clearLastConnectedDevice = () => {
    try {
        if (isBrowserExtension()) {
            // 在浏览器插件环境中使用chrome.storage
            (window as any).chrome.storage.local.remove(LAST_CONNECTED_DEVICE_KEY, () => {
                if ((window as any).chrome.runtime.lastError) {
                    console.error('Failed to clear last connected device from chrome.storage:', (window as any).chrome.runtime.lastError);
                } else {
                    console.log('Cleared last connected device from chrome.storage');
                }
            });
        } else {
            // 在普通Web环境中使用localStorage
            localStorage.removeItem(LAST_CONNECTED_DEVICE_KEY);
            console.log('Cleared last connected device from localStorage');
        }
    } catch (error) {
        console.error('Failed to clear last connected device from storage:', error);
    }
};

const deviceList = computed(() => {
    return [...usbDeviceList.value];
});

const deviceOptions = computed(() => {
    return deviceList.value;
});

const selectDevice = async (device: any) => {
    if (selected.value?.serial === device?.serial && connectionStatus.value === 'connected') {
        console.log('Device already connected:', device?.serial);
        return;
    }

    connectionStatus.value = 'connecting';
    isLoading.value = true;
    errorMessage.value = '';
    errorDetails.value = '';
    deviceInfo.value = null;
    emit('update-connection-status', false);
    try {
        await client.connect(device);
        selected.value = device;
        connectionStatus.value = 'connected';
        showDevices.value = false;
        emit('pair-device', device);
        emit('update-connection-status', true);
        deviceInfo.value = {
            model: device.name || 'Unknown',
            androidVersion: 'Unknown',
        };
        // 输出完整的设备信息到控制台
        console.log('Device connected successfully:');
        console.log('Device name:', device.name);
        console.log('Device serial:', device.serial);
        console.log('Full device object:', device);
        autoReconnectAttempts.value = 0;
        
        // 保存上次连接的设备信息到本地存储
        saveLastConnectedDevice(device);
    } catch (error: any) {
        handleConnectionError(error);
    } finally {
        isLoading.value = false;
    }
};

const handleConnectionError = (error: any) => {
    if (error.message.includes('Unknown command: 48545541')) {
        errorMessage.value = '设备连接失败：未知命令';
        errorDetails.value = '请确保设备支持 ADB 调试，并且已在开发者选项中启用 USB 调试。';
    } else if (
        error.name === 'DOMException' &&
        error.message.includes('The transfer was cancelled')
    ) {
        errorMessage.value = '设备连接失败：USB 传输被取消';
        errorDetails.value = '请重新插拔设备并重试。如果问题持续，请尝试重启设备。';
    } else if (error.message.includes('No authenticator can handle the request')) {
        errorMessage.value = '设备认证失败：无法处理认证请求';
        errorDetails.value =
            '请检查设备上的 ADB 授权设置。在设备上点击"允许 USB 调试"对话框，然后重试连接。';
    } else {
        errorMessage.value = `设备连接失败`;
        errorDetails.value +=
            '这通常是已经运行了其他 ADB 客户端导致的。通过运行 `adb kill-server` 命令来终止其他 ADB 进程，然后再重新连接当前设备。';
    }
    emit('update-connection-status', false);
    connectionStatus.value = 'disconnected';
};

const retryConnection = async () => {
    if (selected.value) {
        await selectDevice(selected.value);
    }
};

const autoReconnect = async () => {
    if (autoReconnectAttempts.value < maxAutoReconnectAttempts) {
        console.log(
            `Attempting auto-reconnect (${
                autoReconnectAttempts.value + 1
            }/${maxAutoReconnectAttempts})`
        );
        await retryConnection();
        autoReconnectAttempts.value++;
    } else {
        console.log('Max auto-reconnect attempts reached');
        errorMessage.value = '自动重连失败';
        errorDetails.value = '请手动重试连接或检查设备状态。';
    }
};



const removeDevice = async (serial: string) => {
    isLoading.value = true;
    console.log('Attempting to remove device:', serial);
    
    // 获取当前设备信息
    const deviceToRemove = usbDeviceList.value.find(device => device.serial === serial);
    
    if (selected.value?.serial === serial) {
        selected.value = undefined;
        await client.disconnect();
        deviceInfo.value = null;
        emit('update-connection-status', false);
        connectionStatus.value = 'disconnected';
        console.log('Disconnected from device:', serial);
    }
    
    // 如果移除的是上次连接的设备，清除本地存储
    try {
        const lastConnected = await getLastConnectedDevice();
        if (lastConnected && lastConnected.serial === serial) {
            clearLastConnectedDevice();
        }
    } catch (error) {
        console.error('Error checking last connected device during removal:', error);
    }
    
    usbDeviceList.value = usbDeviceList.value.filter((device) => device.serial !== serial);
    emit('remove-device', serial);
    console.log('Device removed from list:', serial);
    isLoading.value = false;
};

const updateUsbDeviceList = async () => {
    isLoading.value = true;
    try {
        usbDeviceList.value = await client.getUsbDeviceList();
        console.log('Updated USB device list:', usbDeviceList.value);
    } catch (error: any) {
        console.error('Failed to update USB device list:', error);
        errorMessage.value = '获取设备列表失败';
        errorDetails.value = `${error.message}。请检查设备连接并重试。`;
    } finally {
        isLoading.value = false;
    }
    return usbDeviceList.value;
};

onMounted(async () => {
    const supported = client.isSupportedWebUsb;
    console.log('WebUSB support:', supported);
    if (!supported) {
        console.log('WebUSB is not supported');
        errorMessage.value = '浏览器不支持 WebUSB';
        errorDetails.value = '请使用支持 WebUSB 的现代浏览器，如 Chrome 或 Edge 的最新版本。';
        return;
    }

    await updateUsbDeviceList();
    watcher.value = new AdbDaemonWebUsbDeviceWatcher(async () => {
        console.log('Device list change detected');
        await updateUsbDeviceList();
    }, navigator.usb);
});

// 监听设备列表变化，尝试自动连接上次设备
watch(deviceList, async (newList) => {
    console.log('Device list updated, checking for last connected device:', newList);
    if (newList.length > 0 && !selected.value && connectionStatus.value !== 'connecting') {
        // 检查本地存储中是否有上次连接的设备信息
        try {
            const lastConnectedDevice = await getLastConnectedDevice();
            if (lastConnectedDevice) {
                console.log('Found last connected device in storage:', lastConnectedDevice);
                // 查找当前设备列表中是否有上次连接的设备
                const deviceToConnect = newList.find(device => device.serial === lastConnectedDevice.serial);
                if (deviceToConnect) {
                    console.log('Attempting to auto-connect to last device:', deviceToConnect.serial);
                    await selectDevice(deviceToConnect);
                } else {
                    console.log('Last connected device not found in current list:', lastConnectedDevice.serial);
                }
            }
        } catch (error) {
            console.error('Error checking last connected device:', error);
        }
    }
}, { immediate: true });

onUnmounted(() => {
    if (watcher.value) {
        watcher.value.dispose();
        console.log('Device watcher disposed');
    }
});

watch(deviceList, async (newList) => {
    console.log('Device list changed:', newList);
    if (selected.value) {
        const current = newList.find((device) => device.serial === selected.value?.serial);
        if (!current) {
            console.log('Selected device not found in new list, disconnecting');
            await client.disconnect();
            const disconnectedDeviceName = selected.value.name || selected.value.serial;
            selected.value = undefined;
            deviceInfo.value = null;
            errorMessage.value = '设备已断开连接';
            errorDetails.value = '选中的设备已从列表中移除。请检查设备连接状态。';
            disconnectionMessage.value = `设备 ${disconnectedDeviceName} 已断开连接。请检查设备连接状态。`;
            emit('update-connection-status', false);
            connectionStatus.value = 'disconnected';
            await autoReconnect();
        } else {
            disconnectionMessage.value = '';
        }
    }
});

const handleAddDevice = async () => {
    errorMessage.value = '';
    errorDetails.value = '';
    try {
        console.log('Attempting to add new USB device');
        const newDevice = await client.addUsbDevice();
        if (newDevice) {
            console.log('New device added:', newDevice);
            await updateUsbDeviceList();
        }
    } catch (error: any) {
        console.error('Failed to add USB device:', error);
        errorMessage.value = '添加设备失败';
        errorDetails.value = `${error.message}。请确保设备已正确连接并启用了 USB 调试。`;
    }
};
</script>

<template>
    <div class="paired-devices-component">
        <v-card class="paired-devices-card" elevation="2">
                <v-card-title class="d-flex align-center text-h6 pa-4 font-weight-bold">
                    <span>配对的设备</span>
                    <v-spacer />
                </v-card-title>
                <v-card-text v-if="errorMessage" class="error-container">
                    <v-alert type="error" prominent>
                        <h3>{{ errorMessage }}</h3>
                        <p>{{ errorDetails }}</p>
                        <v-btn v-if="selected" variant="text" @click="retryConnection" class="mt-2"
                            >重试连接
                        </v-btn>
                        <v-btn variant="text" @click="handleAddDevice" class="mt-2 ml-2"
                            >添加设备
                        </v-btn>
                    </v-alert>
                </v-card-text>
                <v-card-text v-if="disconnectionMessage" class="disconnection-message">
                    <v-alert type="warning" prominent>
                        {{ disconnectionMessage }}
                    </v-alert>
                </v-card-text>
                <v-card-text v-if="!deviceList.length">
                    <v-btn variant="outlined" block @click="handleAddDevice">
                        <v-icon left class="mr-2">mdi-cellphone-link</v-icon>
                        添加 USB 设备
                    </v-btn>
                </v-card-text>
                <v-card-text v-else>
                    <v-list dense>
                        <v-list-item
                            v-for="device in deviceOptions"
                            :key="device.serial"
                            class="py-2"
                            @click="selectDevice(device)"
                        >
                            <template #prepend>
                                <v-avatar color="black" size="40">
                                    <v-icon color="white" size="24">mdi-cellphone</v-icon>
                                </v-avatar>
                            </template>
                            <v-list-item-title>
                                <span>{{ device.name || device.serial }}</span>
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                <span>{{ device.serial }}</span>
                            </v-list-item-subtitle>
                            <template #append>
                                <v-icon
                                    v-if="selected?.serial === device.serial"
                                    class="mr-2"
                                    color="green"
                                >
                                    mdi-check-circle
                                </v-icon>
                                <v-btn
                                    icon
                                    color="primary"
                                    variant="text"
                                    size="small"
                                    style="width: 35px; height: 35px"
                                    @click.stop="removeDevice(device.serial)"
                                >
                                    <v-icon>mdi-delete</v-icon>
                                    <v-tooltip activator="parent" location="end"
                                        >移除设备
                                    </v-tooltip>
                                </v-btn>
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card-text>

            </v-card>
    </div>
</template>

<style scoped>
.paired-devices-component {
    display: inline-block;
}

.paired-devices-card {
    border-radius: 8px;
}

.error-container,
.disconnection-message {
    margin-bottom: 16px;
}
</style>
