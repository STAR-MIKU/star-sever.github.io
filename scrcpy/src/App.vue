<template>
  <v-app>
    <!-- <v-icon icon="mdi-cellphone-android" color="primary" size="large"></v-icon> -->
    <DeviceView :room-name="roomName" :current-user="currentUser" />
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { VApp, VIcon } from 'vuetify/components';
import DeviceView from './views/DeviceView.vue';

const roomName = ref('default-room');
const currentUser = ref({
  id: 'default-user',
  name: 'Default User',
});
</script>

<style>
:root {
  overflow: hidden !important;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background: transparent;
  overflow: hidden !important;
}

v-app {
  background: transparent;
}

/* 设置特定Vuetify类的背景为完全透明 */
.v-application.v-theme--light.v-layout.v-layout--full-height.v-locale--is-ltr {
  background: #ffffff00 !important;
}

/* 添加滚动锁定样式 - 使用!important确保覆盖Vuetify默认样式 */
html.v-overlay-scroll-blocked {
  overflow: hidden !important;
}

/* 覆盖Vuetify对话框默认宽度 */
.v-dialog > .v-overlay__content {
  width: auto !important;
}
</style>
