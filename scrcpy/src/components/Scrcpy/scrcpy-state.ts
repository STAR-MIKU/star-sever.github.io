// 导入外部依赖
import { AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb';
import { AdbScrcpyClient, AdbScrcpyOptionsLatest } from '@yume-chan/adb-scrcpy';
import { VERSION } from '@yume-chan/fetch-scrcpy-server';
import { PcmPlayer } from '@yume-chan/pcm-player';
import {
    clamp,
    CodecOptions,
    h264ParseConfiguration,
    ScrcpyHoverHelper,
    ScrcpyInstanceId,
    ScrcpyLogLevel,
    ScrcpyOptionsLatest,
    ScrcpyVideoCodecId,
    ScrcpyVideoOrientation,
    DEFAULT_SERVER_PATH,
} from '@yume-chan/scrcpy';
import type {
    ScrcpyMediaStreamPacket,
    ScrcpyMediaStreamConfigurationPacket,
    ScrcpyMediaStreamDataPacket,
} from '@yume-chan/scrcpy';
import { Consumable, InspectStream, ReadableStream, WritableStream } from '@yume-chan/stream-extra';
import { WebCodecsVideoDecoder } from '@yume-chan/scrcpy-decoder-webcodecs';

// 导入本地依赖
import { ScrcpyKeyboardInjector } from './input';
import recorder from './recorder';

// @ts-ignore
import SCRCPY_SERVER_BIN from '../../../public/scrcpy-server-v2.6.1?binary';

// 类型定义
type RotationListener = (rotation: number, prevRotation: number) => void;

// 常量定义
const DEFAULT_VIDEO_CODEC = 'h264';
const DEFAULT_MAX_SIZE = 1920;
const DEFAULT_DISPLAY_ID = 0;
const DEFAULT_POWER_ON = true;
const DEFAULT_BORDER_WIDTH = 6;
const DEFAULT_FPS = 30;
const DEFAULT_BITRATE = 8000000;

export class ScrcpyState {
    // 基本状态
    running = false;
    fullScreenContainer: HTMLDivElement | null = null;
    rendererContainer: HTMLDivElement | null = null;
    canvas?: HTMLCanvasElement;
    isFullScreen = false;
    width = 0;
    height = 0;
    private _rotation = 0;
    private rotationListeners: RotationListener[] = [];
    // 解码器和视频相关
    decoder: WebCodecsVideoDecoder | undefined = undefined;
    videoCodec: 'h264' | 'h265' = DEFAULT_VIDEO_CODEC;
    videoBitRate = DEFAULT_BITRATE;
    maxSize = DEFAULT_MAX_SIZE;
    maxFps = DEFAULT_FPS;
    lockVideoOrientation = ScrcpyVideoOrientation.Unlocked;
    displayId = DEFAULT_DISPLAY_ID;
    powerOn = DEFAULT_POWER_ON;

    // 设备和连接相关
    device: AdbDaemonWebUsbDevice | undefined = undefined;
    scrcpy: AdbScrcpyClient | undefined = undefined;
    hoverHelper: ScrcpyHoverHelper | undefined = undefined;
    keyboard: ScrcpyKeyboardInjector | undefined = undefined;
    audioPlayer: PcmPlayer<unknown> | undefined = undefined;

    // 性能指标
    fps = '0';
    bitRatesCount = 0;
    connecting = false;

    constructor() {
        // 添加默认的旋转监听器
        this.addRotationListener((rotation: number, prevRotation: number) => {
            console.log(`屏幕旋转从 ${prevRotation} 变为 ${rotation}`);
        });
    }

    // 旋转相关方法
    get rotation(): number {
        return this._rotation;
    }

    set rotation(value: number) {
        if (this._rotation !== value) {
            const prevRotation = this._rotation;
            this._rotation = value;
            // 通知所有监听器
            this.rotationListeners.forEach((listener) => {
                try {
                    listener(value, prevRotation);
                } catch (error) {
                    console.error('旋转监听器出错:', error);
                }
            });
            // 触发视频容器重新调整大小
            this.updateVideoContainer();
        }
    }

    get rotatedWidth(): number {
        return this.rotation & 1 ? this.height : this.width;
    }

    get rotatedHeight(): number {
        return this.rotation & 1 ? this.width : this.height;
    }

    // 添加旋转监听器
    addRotationListener(listener: RotationListener): void {
        this.rotationListeners.push(listener);
    }

    // 移除旋转监听器
    removeRotationListener(listener: RotationListener): void {
        const index = this.rotationListeners.indexOf(listener);
        if (index !== -1) {
            this.rotationListeners.splice(index, 1);
        }
    }

    // 更新视频容器
    updateVideoContainer(): void {
        if (!this.canvas || !this.rendererContainer) {
            return;
        }

        // 设置视频尺寸为容器的100%
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        // 设置变换原点和位置
        this.canvas.style.transformOrigin = 'center';
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
        this.canvas.style.backgroundColor = 'transparent';

        // 根据旋转角度设置变换
        let transform = '';
        switch (this.rotation) {
            case 1: // 90度
                transform += ' rotate(90deg)';
                break;
            case 2: // 180度
                transform += ' rotate(180deg)';
                break;
            case 3: // 270度
                transform += ' rotate(270deg)';
                break;
        }
        this.canvas.style.transform = transform;

        // 设置其他样式
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.maxHeight = '100%';
        this.canvas.style.objectFit = 'contain';
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.border = 'none';
        this.canvas.style.borderRadius = '0';
    }

    // 服务器相关方法
    async pushServer(): Promise<void> {
        if (!this.device) {
            console.error('设备不可用');
            return;
        }

        try {
            console.log('开始推送服务器...', new Uint8Array(SCRCPY_SERVER_BIN).length);
            const stream = new ReadableStream<Consumable<Uint8Array>>({
                start(controller) {
                    controller.enqueue(new Consumable(new Uint8Array(SCRCPY_SERVER_BIN)));
                    controller.close();
                },
            });

            await AdbScrcpyClient.pushServer(this.device as any, stream);
        } catch (error) {
            console.error('推送服务器失败:', error);
        }
    }

    // 数据包类型检查
    private isConfigurationPacket(
        packet: ScrcpyMediaStreamPacket
    ): packet is ScrcpyMediaStreamConfigurationPacket {
        return packet.type === 'configuration';
    }

    private isDataPacket(packet: ScrcpyMediaStreamPacket): packet is ScrcpyMediaStreamDataPacket {
        return packet.type === 'data';
    }

    // 启动方法
    async start(device: AdbDaemonWebUsbDevice) {
        if (!device || this.rendererContainer === undefined) {
            throw new Error('无效的参数');
        }
        this.device = device;
        try {
            if (!this.decoder) {
                throw new Error('没有可用的解码器');
            }
            this.connecting = true;
            await this.pushServer();
            const videoCodecOptions = new CodecOptions();
            const options = new AdbScrcpyOptionsLatest(
                new ScrcpyOptionsLatest({
                    maxSize: this.maxSize,
                    videoBitRate: this.videoBitRate,
                    videoCodec: this.videoCodec,
                    maxFps: this.maxFps,
                    lockVideoOrientation: this.lockVideoOrientation,
                    displayId: this.displayId,
                    powerOn: this.powerOn,
                    audio: false, // 禁用音频
                    logLevel: ScrcpyLogLevel.Debug,
                    scid: ScrcpyInstanceId.random(),
                    sendDeviceMeta: false,
                    sendDummyByte: false,
                    videoCodecOptions,
                })
            );
            // 确保audioPlayer始终未定义，因为音频已禁用
            this.audioPlayer = undefined;

            this.scrcpy = await AdbScrcpyClient.start(
                this.device as any,
                DEFAULT_SERVER_PATH,
                VERSION,
                options
            );

            if (!this.scrcpy) {
                throw new Error('启动 scrcpy 客户端失败');
            }

            this.scrcpy.stdout.pipeTo(
                new WritableStream<string>({
                    write(chunk) {
                        console.log(`[服务器] ${chunk}`);
                    },
                })
            );

            if (this.scrcpy.videoStream) {
                const videoStream = await this.scrcpy.videoStream;
                if (!videoStream) {
                    throw new Error('获取视频流失败');
                }
                const { metadata: videoMetadata, stream: videoPacketStream } = videoStream;
                // 初始化视频大小
                this.width = videoMetadata.width ?? 0;
                this.height = videoMetadata.height ?? 0;
                this.rotation = 0; // 初始化为0，后续通过元数据更新

                // 设置录制器的视频元数据
                recorder.setVideoMetadata(videoMetadata);

                if (this.decoder && videoPacketStream) {
                    const writable = this.decoder.writable;
                    videoPacketStream
                        .pipeThrough(
                            new InspectStream((packet: ScrcpyMediaStreamPacket) => {
                                // 将数据包传递给录制器
                                recorder.addVideoPacket(packet);
                                try {
                                    if (this.isConfigurationPacket(packet)) {
                                        try {
                                            const { croppedWidth, croppedHeight } = h264ParseConfiguration(packet.data);
                                            if (croppedWidth > 0 && croppedHeight > 0) {
                                                this.width = croppedWidth;
                                                this.height = croppedHeight;
                                                // 更新视频容器大小
                                                this.updateVideoContainer();
                                            }
                                        } catch (error) {
                                            console.error('解析配置出错:', error);
                                        }
                                    } else if (this.isDataPacket(packet)) {
                                        // 更新屏幕旋转状态
                                        const metadata = packet.data;
                                        if (
                                            metadata &&
                                            typeof metadata === 'object' &&
                                            'rotation' in metadata
                                        ) {
                                            const rotation = (metadata as { rotation: number }).rotation;
                                            if (
                                                typeof rotation === 'number' &&
                                                rotation >= 0 &&
                                                rotation <= 3
                                            ) {
                                                this.rotation = rotation;
                                            }
                                        }
                                        if (packet.data instanceof Uint8Array) {
                                            this.bitRatesCount += packet.data.byteLength;
                                        }
                                    }
                                } catch (error) {
                                    console.error('处理数据包出错:', error);
                                }
                            })
                        )
                        .pipeTo(writable)
                        .catch((error) => {
                            // 忽略解码器已关闭的错误
                            if (error.name !== 'InvalidStateError' || !error.message.includes('closed codec')) {
                                console.error('处理数据包出错:', error);
                            }
                        });
                }
            }

            this.keyboard = new ScrcpyKeyboardInjector(this.scrcpy);
            this.hoverHelper = new ScrcpyHoverHelper();
            this.scrcpy.exit.then(() => this.dispose());

            this.running = true;
            return this.scrcpy;
        } catch (e) {
            console.error(e);
            this.connecting = false;
            this.dispose();
            return;
        }
    }

    // 停止方法
    async stop() {
        // 首先请求关闭客户端
        await this.scrcpy?.close();
        this.dispose();
    }

    // 清理方法
    dispose(): void {
        // 否则一些数据包可能仍会到达解码器
        if (this.decoder) {
            try {
                this.decoder.dispose();
            } catch (error) {
                console.error('解码器清理出错:', error);
            }
            this.decoder = undefined;
        }
        
        if (this.keyboard) {
            try {
                this.keyboard.dispose();
            } catch (error) {
                console.error('键盘注入器清理出错:', error);
            }
            this.keyboard = undefined;
        }

        if (this.audioPlayer) {
            try {
                this.audioPlayer.stop();
            } catch (error) {
                console.error('音频播放器清理出错:', error);
            }
            this.audioPlayer = undefined;
        }

        this.fps = '0';

        if (this.isFullScreen) {
            document.exitFullscreen();
            this.isFullScreen = false;
        }

        this.scrcpy = undefined;
        this.device = undefined;
        this.canvas = undefined;
        this.running = false;
        // 清空旋转监听器
        this.rotationListeners = [];
        // 保留rendererContainer，以便面板重新打开时可以重用
        // this.rendererContainer = undefined;
        // this.fullScreenContainer = undefined;
    }

    setRendererContainer(container: HTMLDivElement): void {
        if (this.decoder?.renderer) {
            console.log('渲染器容器已更改', this.decoder);
            this.rendererContainer = null;
            container.removeChild(this.decoder.renderer);
            // 清理旧的解码器资源
            this.decoder.dispose();
            this.decoder = undefined;
        }

        this.fullScreenContainer = container;
        this.rendererContainer = container;

        // 确保容器可以正确定位子元素
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
        container.style.backgroundColor = 'transparent';

        this.decoder = new WebCodecsVideoDecoder(ScrcpyVideoCodecId.H264, false);
        container.appendChild(this.decoder.renderer);
        this.canvas = this.decoder.renderer;
        // 初始化视频容器
        this.updateVideoContainer();
    }

    getCanvas(): HTMLCanvasElement | undefined {
        if (!this.scrcpy) {
            return;
        }
        return this.canvas;
    }

    clientPositionToDevicePosition(clientX: number, clientY: number): { x: number; y: number } {
        const viewRect = this.canvas!.getBoundingClientRect();
        let pointerViewX = clamp((clientX - viewRect.x) / viewRect.width, 0, 1);
        let pointerViewY = clamp((clientY - viewRect.y) / viewRect.height, 0, 1);

        if (this.rotation & 1) {
            [pointerViewX, pointerViewY] = [pointerViewY, pointerViewX];
        }
        switch (this.rotation) {
            case 1:
                pointerViewY = 1 - pointerViewY;
                break;
            case 2:
                pointerViewX = 1 - pointerViewX;
                pointerViewY = 1 - pointerViewY;
                break;
            case 3:
                pointerViewX = 1 - pointerViewX;
                break;
        }

        return {
            x: pointerViewX * this.width,
            y: pointerViewY * this.height,
        };
    }

    // 安全的setDeviceVolume实现，避免使用不存在的device.shell方法
    setDeviceVolume(volume: number): void {
        try {
            // 音量控制应通过key code injection实现（在NavigationBar.vue中已实现）
            // 这里不使用this.device.shell，因为AdbDaemonWebUsbDevice没有shell属性
            console.log('音量控制通过key code injection实现，忽略setDeviceVolume调用:', volume);
        } catch (error) {
            console.error('设置设备音量时出错:', error);
        }
    }
}

const state = new ScrcpyState();
export default state;
