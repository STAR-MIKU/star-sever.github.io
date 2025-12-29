<script setup lang="ts">
import { ref, onMounted, onUnmounted, provide, computed } from 'vue';
import {
    AndroidMotionEventAction,
    AndroidMotionEventButton,
    ScrcpyPointerId,
    type ScrcpySetClipboardControlMessage,
} from '@yume-chan/scrcpy';
import client from '../Scrcpy/adb-client';
import state from '../Scrcpy/scrcpy-state';
import { createFileStream } from '../Scrcpy/file';
import { Consumable, MaybeConsumable } from '@yume-chan/stream-extra';

const videoContainer = ref<HTMLDivElement | null>(null);
const isVideoContainerFocused = ref(false);
const isCanvasReady = ref(false);
const isFullyRendered = ref(false);

// 文件拖放相关状态
const isDragging = ref(false);
const dragOverCount = ref(0);
const transferProgress = ref<{ [key: string]: number }>({});
const transferStatus = ref<{ [key: string]: string }>({});
const currentTransferId = ref<string | null>(null);
const showProgress = ref(false);

const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
    AndroidMotionEventButton.Primary,
    AndroidMotionEventButton.Tertiary,
    AndroidMotionEventButton.Secondary,
    AndroidMotionEventButton.Back,
    AndroidMotionEventButton.Forward,
];

const isReady = computed(
    () =>
        state.scrcpy &&
        state.canvas &&
        isVideoContainerFocused.value &&
        isCanvasReady.value &&
        isFullyRendered.value
);

const isPointInCanvas = (clientX: number, clientY: number): boolean => {
    if (!state.canvas) return false;
    const rect = state.canvas.getBoundingClientRect();
    return (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
    );
};

const handleWheel = (e: WheelEvent) => {
    if (!isReady.value || !isPointInCanvas(e.clientX, e.clientY)) {
        return;
    }
    videoContainer.value?.focus();
    e.preventDefault();
    e.stopPropagation();

    const { x, y } = state.clientPositionToDevicePosition(e.clientX, e.clientY);
    state.scrcpy?.controller!.injectScroll({
        screenWidth: state.width!,
        screenHeight: state.height!,
        pointerX: x,
        pointerY: y,
        scrollX: -e.deltaX / 100,
        scrollY: -e.deltaY / 100,
        buttons: 0,
    });
};

const injectTouch = (action: AndroidMotionEventAction, e: PointerEvent) => {
    if (!isReady.value || !state.hoverHelper || !isPointInCanvas(e.clientX, e.clientY)) {
        return;
    }

    const { pointerType } = e;
    const pointerId: bigint =
        pointerType === 'mouse' ? ScrcpyPointerId.Finger : BigInt(e.pointerId);

    const { x, y } = state.clientPositionToDevicePosition(e.clientX, e.clientY);

    const messages = state.hoverHelper.process({
        action,
        pointerId,
        screenWidth: state.width!,
        screenHeight: state.height!,
        pointerX: x,
        pointerY: y,
        pressure: e.pressure,
        actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],
        buttons: e.buttons,
    });
    messages.forEach((message) => state.scrcpy?.controller?.injectTouch(message));
};

const handlePointerDown = (e: PointerEvent) => {
    if (!isReady.value || !isPointInCanvas(e.clientX, e.clientY)) return;

    state.fullScreenContainer?.focus();
    e.preventDefault();
    e.stopPropagation();

    (e.currentTarget as HTMLDivElement)?.setPointerCapture(e.pointerId);
    injectTouch(AndroidMotionEventAction.Down, e);
};

const handlePointerMove = (e: PointerEvent) => {
    if (!isReady.value || !isPointInCanvas(e.clientX, e.clientY)) return;

    e.preventDefault();
    e.stopPropagation();
    injectTouch(
        e.buttons === 0 ? AndroidMotionEventAction.HoverMove : AndroidMotionEventAction.Move,
        e
    );
};

const handlePointerUp = (e: PointerEvent) => {
    if (!isReady.value || !isPointInCanvas(e.clientX, e.clientY)) return;

    e.preventDefault();
    e.stopPropagation();
    injectTouch(AndroidMotionEventAction.Up, e);
};

const handlePointerLeave = (e: PointerEvent) => {
    if (!isReady.value || !isPointInCanvas(e.clientX, e.clientY)) return;

    e.preventDefault();
    e.stopPropagation();
    injectTouch(AndroidMotionEventAction.HoverExit, e);
    injectTouch(AndroidMotionEventAction.Up, e);
};

const handleContextMenu = (e: MouseEvent) => {
    if (!isReady.value || !isPointInCanvas(e.clientX, e.clientY)) return;
    e.preventDefault();
};

// 辅助函数：处理可能的 BigInt 转换问题
const sanitizeText = (text: string): string => {
    // 移除可能导致 BigInt 转换问题的内容
    return text.replace(/[nN]$/g, '');
};

const handlePaste = async () => {
    if (!isReady.value || !state.scrcpy || !state.scrcpy.controller) return;
    try {
        const clipboardText = await navigator.clipboard.readText();
        const sanitizedText = sanitizeText(clipboardText);

        const clipboardMessage: Omit<ScrcpySetClipboardControlMessage, 'type'> = {
            sequence: BigInt(0), // 使用 BigInt(0) 作为序列号
            paste: true, // 设置为 true，因为这是粘贴操作
            content: sanitizedText, // 使用 content 替代 text
        };

        await state.scrcpy.controller.setClipboard(clipboardMessage);
        console.log('已粘贴到设备:', sanitizedText);
    } catch (error) {
        console.error('粘贴到设备失败:', error);
    }
};

const handleKeyEvent = (e: KeyboardEvent) => {
    if (!isReady.value || !state.keyboard) return;
    e.preventDefault();
    e.stopPropagation();

    const { type, code, ctrlKey, metaKey } = e;

    if (type === 'keydown' && (ctrlKey || metaKey)) {
        if (code === 'KeyV') {
            handlePaste();
            return;
        }
    }

    state.keyboard[type === 'keydown' ? 'down' : 'up'](code);
};

const handleFocus = () => {
    isVideoContainerFocused.value = true;
};

const handleBlur = () => {
    isVideoContainerFocused.value = false;
};

const checkRendering = () => {
    if (state.running) {
        isFullyRendered.value = true;
        clearInterval(renderingCheckInterval);
    }
};

let renderingCheckInterval: number;

// 添加鼠标进入事件处理
const handleMouseEnter = () => {
    if (videoContainer.value) {
        videoContainer.value.focus();
        isVideoContainerFocused.value = true;
    }
};

// 添加鼠标离开事件处理
const handleMouseLeave = () => {
    isVideoContainerFocused.value = false;
};

// 处理来自父窗口的消息
const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.action === 'stop-scrcpy') {
        // 停止scrcpy连接并清理资源
        state.stop().then(() => {
            // 重置状态
            isCanvasReady.value = false;
            isFullyRendered.value = false;
            isVideoContainerFocused.value = false;
        });
    }
};

onMounted(() => {
    if (videoContainer.value) {
        videoContainer.value.addEventListener('wheel', handleWheel, { passive: false });
        videoContainer.value.addEventListener('focus', handleFocus);
        videoContainer.value.addEventListener('blur', handleBlur);
        // 添加鼠标进入离开事件监听
        videoContainer.value.addEventListener('mouseenter', handleMouseEnter);
        videoContainer.value.addEventListener('mouseleave', handleMouseLeave);
    }
    if (client.device && videoContainer.value) {
        // 确保rendererContainer已设置，无论state.running状态如何
        if (!state.rendererContainer) {
            state.setRendererContainer(videoContainer.value);
        }
        // 只有在state.running为false时才启动连接
        if (!state.running) {
            state.start(client.device as any).then(() => {
                isCanvasReady.value = true;
                // 开始检查渲染状态
                renderingCheckInterval = setInterval(checkRendering, 100);
            });
        } else {
            // 如果已经在运行，确保canvas准备就绪
            isCanvasReady.value = true;
            // 开始检查渲染状态
            renderingCheckInterval = setInterval(checkRendering, 100);
        }
    }
    if ('keyboard' in navigator) {
        // navigator.keyboard.lock();
    }

    // 添加消息监听器，处理来自父窗口的命令
    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);
});

onUnmounted(() => {
    if (videoContainer.value) {
        videoContainer.value.removeEventListener('wheel', handleWheel);
        videoContainer.value.removeEventListener('focus', handleFocus);
        videoContainer.value.removeEventListener('blur', handleBlur);
        // 移除鼠标进入离开事件监听
        videoContainer.value.removeEventListener('mouseenter', handleMouseEnter);
        videoContainer.value.removeEventListener('mouseleave', handleMouseLeave);
    }
    if ('keyboard' in navigator) {
        // navigator.keyboard.unlock();
    }
    // 移除消息监听器
    window.removeEventListener('message', handleMessage);
    window.removeEventListener('keydown', handleKeyEvent);
    window.removeEventListener('keyup', handleKeyEvent);
    clearInterval(renderingCheckInterval);
    
    // 确保在组件卸载时完全停止scrcpy连接
    if (state.running || state.scrcpy) {
        state.stop();
    }
});

// 文件拖放事件处理
const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragOverCount.value++;
    if (!isDragging.value) {
        isDragging.value = true;
    }
};

const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer!.dropEffect = 'copy';
};

const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragOverCount.value--;
    if (dragOverCount.value === 0 && isDragging.value) {
        isDragging.value = false;
    }
};

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragOverCount.value = 0;
    isDragging.value = false;
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => {
            uploadFileToDevice(file);
        });
    }
};

// 上传文件到设备
const uploadFileToDevice = async (file: File) => {
    if (!client.device) {
        console.error('设备未连接');
        return;
    }
    
    const transferId = Date.now().toString();
    currentTransferId.value = transferId;
    transferProgress.value[transferId] = 0;
    transferStatus.value[transferId] = '上传中';
    showProgress.value = true;
    
    try {
        let uploaded = 0;
        
        // 创建文件流，适配 ADB 客户端的要求，并添加进度跟踪
        const fileStream = createFileStream(file, (progress) => {
            transferProgress.value[transferId] = progress;
        });
        
        // 使用 ADB sync 进行文件传输
        const sync = await client.device.sync();
        
        // 创建目标目录（如果不存在）
        try {
            await sync.stat('/sdcard');
        } catch {
            // 目录不存在，创建目录
            const result = await client.device.subprocess.spawnAndWait(['mkdir', '-p', '/sdcard']);
            if (result.exitCode !== 0) {
                console.error('创建目录失败:', result.stderr);
                throw new Error('创建目录失败');
            }
        }
        
        // 推送文件到设备根目录
        await sync.write({
            filename: `/sdcard/${file.name}`,
            file: fileStream,
            permission: 0o644
        });
        
        transferStatus.value[transferId] = '上传完成';
        transferProgress.value[transferId] = 100;
        
        // 3秒后隐藏已完成的进度
        setTimeout(() => {
            if (currentTransferId.value === transferId) {
                showProgress.value = false;
                currentTransferId.value = null;
            }
        }, 3000);
        
    } catch (error) {
        console.error('上传文件失败:', error);
        transferStatus.value[transferId] = '上传失败';
    }
};

// 提供一个方法来设置焦点状态，供父组件使用
provide('setVideoContainerFocus', (focused: boolean) => {
    isVideoContainerFocused.value = focused;
});
</script>

<template>
    <div
        ref="videoContainer"
        class="video-container"
        tabindex="0"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
        @pointerleave="handlePointerLeave"
        @contextmenu="handleContextMenu"
        @wheel="handleWheel"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
    >
        <!-- 拖放提示 -->
        <div
            v-if="isDragging"
            class="drag-overlay"
        >
            <div class="drag-overlay-content">
                <v-icon size="48">mdi-file-upload</v-icon>
                <div class="drag-overlay-text">将文件拖放到此处上传到设备</div>
            </div>
        </div>
        
        <!-- 传输进度 -->
        <div
            v-if="showProgress && currentTransferId"
            class="progress-overlay"
        >
            <div class="progress-content">
                <div class="progress-header">文件上传</div>
                <div class="progress-text">{{ transferStatus[currentTransferId] }}</div>
                <v-progress-linear
                    v-model="transferProgress[currentTransferId]"
                    height="6"
                    color="primary"
                    background-color="rgba(255, 255, 255, 0.3)"
                    rounded
                ></v-progress-linear>
                <div class="progress-percentage">{{ transferProgress[currentTransferId] }}%</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.video-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: transparent;
    cursor: crosshair;
    overflow: hidden;
    outline: none;
}

/* 确保 canvas 元素正确显示 */
.video-container :deep(canvas) {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    background-color: transparent;
    border: none;
    border-radius: 0;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

/* 拖放覆盖层样式 */
.drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 137, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 8px;
    pointer-events: none;
}

.drag-overlay-content {
    text-align: center;
    color: white;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.drag-overlay-text {
    margin-top: 16px;
    font-size: 18px;
    font-weight: 500;
}

/* 进度显示样式 */
.progress-overlay {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 16px;
    border-radius: 12px;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.progress-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.progress-header {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
}

.progress-text {
    font-size: 14px;
    text-align: center;
    opacity: 0.9;
}

.progress-percentage {
    font-size: 14px;
    text-align: center;
    font-weight: 500;
    margin-top: 4px;
}
</style>
