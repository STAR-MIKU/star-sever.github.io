<script setup>
import { ref, computed, onMounted, onUnmounted, shallowRef, watch } from "vue";
import { useDisplay } from "vuetify";
import PairedDevices from "../components/Device/PairedDevices.vue";
import VideoContainer from "../components/Device/VideoContainer.vue";
import state from "../components/Scrcpy/scrcpy-state";

const { width } = useDisplay();

const containerSize = ref({ width: 0, height: 0 });
const leftPanelWidth = computed(() => width.value);

const deviceMeta = shallowRef(undefined);
const connected = ref(false);
const showHeaderDialog = ref(true);

const handleDisconnected = () => {
  connected.value = false;
  deviceMeta.value = undefined;
};

const onPairDevice = (device) => {
  deviceMeta.value = device;
};

const handleConnectionStatus = async (status) => {
  if (status) {
    await ensureContainerSize();
  }
  connected.value = status;
  if (!status) {
    handleDisconnected();
  }
};

const containerRef = ref(null);
const DeviceContainerRef = ref(null);

// 计算容器的实际可用空间
const containerDimensions = computed(() => {
  const horizontalPadding = 20;
  const verticalPadding = 30;
  const borderWidth = 6; // 考虑边框宽度

  return {
    width:
      leftPanelWidth.value - (horizontalPadding + borderWidth),
    height: containerSize.value.height - (verticalPadding * 2 + borderWidth),
  };
});

// 监听容器尺寸变化
watch(
  () => containerDimensions.value,
  (newDimensions) => {
    // 通知 state 更新视频容器
    state.updateVideoContainer();
  },
  { immediate: true }
);

// 修改 updateContainerSize 方法
const updateContainerSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    containerSize.value = {
      width: rect.width,
      height: rect.height,
    };
    // 通知 state 更新视频容器
    if (state.running) {
      state.updateVideoContainer();
    }
  }
};

// 添加一个方法来确保容器尺寸已准备好
const ensureContainerSize = () => {
  return new Promise(resolve => {
    const checkSize = () => {
      updateContainerSize();
      if (containerSize.value.width > 0 && containerSize.value.height > 0) {
        resolve();
      } else {
        requestAnimationFrame(checkSize);
      }
    };
    checkSize();
  });
};

onMounted(async () => {
  // 确保容器尺寸已准备好
  await ensureContainerSize();
  window.addEventListener('resize', updateContainerSize);
  
  // 添加消息监听器，接收来自父窗口的stop-scrcpy命令
  const messageHandler = (event) => {
    if (event.data && event.data.action === 'stop-scrcpy') {
      console.log('收到stop-scrcpy消息，正在关闭连接...');
      state.stop();
    }
  };
  window.addEventListener('message', messageHandler);
  
  // 在组件卸载时移除事件监听器
  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerSize);
    window.removeEventListener('message', messageHandler);
  });
});



watch(
  () => document.fullscreenElement,
  (newValue) => {
    if (!newValue) {
      setTimeout(updateContainerSize, 100);
    }
  }
);
</script>

<template>
  <v-app>


    <!-- 将原来的header内容转换为弹窗 -->
    <v-dialog
      v-model="showHeaderDialog"
      max-width="500"
    >
      <v-card>
        <v-container class="d-flex align-center justify-center pa-0" fluid>
          <PairedDevices
            v-model="showHeaderDialog"
            @pair-device="onPairDevice"
            @update-connection-status="handleConnectionStatus"
          />
        </v-container>
      </v-card>
    </v-dialog>

    <v-main>
      <div
        ref="containerRef"
        class="resizable-container"
      >
        <div class="left-panel" :style="{ width: leftPanelWidth + 'px' }">
          <div
            v-if="connected"
            ref="DeviceContainerRef"
            class="device-container flex-column relative"
          >
            <VideoContainer />

          </div>
              <div v-else class="d-flex align-center justify-center">
                <div
                  class="loading-indicator"
                  :style="{
                    width: leftPanelWidth / 1.2 + 'px',
                    height: containerSize.height / 1.2 + 'px',
                  }"
                >
                  <div class="connection-status">
                    <img src="../assets/loading.png" class="rotating-image" alt="加载中">
                  </div>
                  <div class="text-h6">
                    由web-usb驱动
                  </div>
                </div>
              </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 16px;
  /* border: 3px solid black; */
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;

  .connection-status {
    margin-bottom: 16px;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rotating-image {
    width: 60px;
    height: 60px;
    animation: rotate 2s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .text-h6 {
    margin-bottom: 8px;
    transition: all 0.3s ease;
  }

  .text-body-2 {
    color: rgba(0, 0, 0, 0.6);
    transition: all 0.3s ease;
  }
}

.resizable-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  padding: 0;
  margin: 0;
  box-sizing: border-box;

  .left-panel {
    width: 100%;
    overflow: hidden;
    padding: 0;
    margin: 0;
    background: transparent;
  }
}

.device-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0;
  gap: 0;
  box-sizing: border-box;
  background: transparent;
  position: relative;
}

.navigation-wrapper {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%);
  width: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px;
  /* background: #ffffffe6; */
  border-radius: 8px;
  /* box-shadow: 0 2px 10px #0000001a; */
  margin-top: 0;
}

/* 添加相对和绝对定位类 */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

/* 确保根元素透明 */
v-app,
v-main {
  background: transparent;
}


</style>
