# ENCOMPASS-OS 树莓派新手开发与落地指南

本文面向第一次接触本项目的新同学，目标是让你快速回答 4 个问题：

1. 这个项目里每个服务是干什么的
2. 这些服务在树莓派上是怎么配合工作的
3. 从研发到现场落地要走哪些步骤
4. 出问题时先看哪里、怎么查

---

## 1. 先用一句话记住 5 个核心子项目

| 子项目 | 一句话作用 | 你什么时候会用到 |
| --- | --- | --- |
| `portal` | 给设备配 Wi-Fi 的引导页 | 设备第一次上电、现场换网络 |
| `kiosk` | 全屏播放页面内容的播放器 | 门店屏、广告屏、展示屏 |
| `nvr` | 摄像头配置和录制上传管理 | NVR 项目部署和运维 |
| `cockpit` | 查看设备状态并远程重启 | 排障、巡检、运维 |
| `image` | 把系统打包成可烧录镜像 | 发版、交付新镜像 |

---

## 2. 项目在树莓派上的整体工作方式

可以把树莓派理解成一台“专用播放器/采集盒子”，开机后按下面顺序工作：

1. `portal` 先处理联网
2. 有网后 `kiosk` 和 `nvr` 才能正常访问云端接口做注册/同步
3. `cockpit` 提供独立的设备运维入口
4. `image` 不在设备上运行，它在开发机上负责“造系统镜像”

简图：

`开机 -> portal配网 -> 有网 -> kiosk/nvr注册同步 -> 正常播放或采集 -> cockpit运维`

---

## 3. 每个服务详细说明（新手版）

### 3.1 `portal`（配网服务）

它是什么：

- 设备的“联网向导”
- 设备没网时，`portal` 会拉起热点和配网页
- 用户在页面里选现场 Wi-Fi、输入密码

在树莓派上怎么启动：

- 包安装后会启用 `portal.service`
- 相关脚本见：`portal/postinst`
- 服务入口见：`portal/portal.service`

常用接口（理解流程用）：

- `GET /api`：看当前网络状态
- `GET /api/networks`：扫描可用 Wi-Fi
- `POST /api/:iface/connect`：连接指定 Wi-Fi

典型现场操作：

1. 手机连接设备热点 `BlockOne`
2. 打开配网页
3. 选择现场 Wi-Fi 并输入密码
4. 连接成功后热点关闭，设备转入现场网络

---

### 3.2 `kiosk`（全屏播放器）

它是什么：

- 在屏幕上全屏播放内容（网页 URL）
- 没配置时显示注册提示和设备信息

在树莓派上怎么启动：

- `blockone` 用户自动登录后启动 X + Openbox
- Openbox 自动执行 kiosk 程序
- 关键文件：
  - `recipes/blockone-cast/.bashrc`
  - `recipes/blockone-cast/autostart`

它什么时候访问云端：

- 周期性调用 Encompass API 获取设备绑定状态
- 未配置时短周期重试，配置后定期同步
- 关键代码：`kiosk/src/encompass.ts`

你会看到的现象：

1. 未注册：屏幕显示提示和注册码
2. 后台绑定后：自动切到目标内容页面

---

### 3.3 `nvr`（摄像头管理服务）

它是什么：

- 设备注册、摄像头信息维护、定时录制与上传

在树莓派上怎么启动：

- 包安装后启用 `nvr.service`
- 端口默认 `5050`
- 关键文件：`nvr/postinst`、`nvr/nvr.service`

核心能力：

1. 读取/注册播放器信息
2. 配置摄像头（名称、MAC、IP、RTSP、状态）
3. 保存后写入定时任务（cron）
4. 调 ffmpeg 录制并打包上传

关键代码：

- `nvr/lib/controllers/encompass.js`
- `nvr/lib/controllers/cron.js`

---

### 3.4 `cockpit`（设备运维服务）

它是什么：

- 设备体检面板：CPU、内存、磁盘、系统信息
- 提供远程重启

在树莓派上怎么启动：

- 包安装后启用 `cockpit.service`
- 默认端口 `8080`
- 关键文件：`cockpit/postinst`、`cockpit/cockpit.service`

你什么时候用它：

1. 设备卡顿，先看资源占用
2. 设备异常，远程重启
3. 交付前做健康检查

---

### 3.5 `image`（镜像构建器）

它是什么：

- 在开发机上把系统 + 服务打包成镜像文件
- 最终写入 SD 卡交付树莓派

它怎么决定装哪些服务：

- 通过 `recipes`（配方）选择
- 例如：
  - `encompass-os`：`portal + cockpit`
  - `encompass-nvr`：`portal + cockpit + nvr`
  - `blockone-cast`：`portal + cockpit + nvr + kiosk`

关键代码：

- `image/lib/main.sh`
- `recipes/*`

---

## 4. 服务之间如何互相作用（通俗解释）

它们不是强耦合的“相互 RPC 调用”，而是“流程依赖”：

1. `portal` 负责先联网
2. 联网成功后 `kiosk`/`nvr` 才能访问云端注册和同步
3. `cockpit` 独立运维，但重启会影响所有服务
4. `image + recipes` 决定最终设备包含哪些服务

最关键的一条链路：

`portal配网成功 -> 设备有网 -> kiosk/nvr云端注册同步成功`

---

## 5. 从研发到落地的完整步骤（可照做）

### 5.1 第一步：准备开发环境

推荐主环境：Debian 11（完整镜像流程依赖）

在仓库根目录执行：

```bash
bash project setup
```

Windows 可用于应用调试（非完整镜像）：

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-win.ps1
```

---

### 5.2 第二步：本地调试各服务

```bash
cd portal && npm run debug
cd cockpit && npm run debug
cd nvr && npm run debug
cd kiosk && npm run debug
```

常见调试端口：

- `portal`（Windows debug）：`5001`
- `cockpit`（debug）：`5000`
- `nvr`（debug）：`5500`
- `kiosk`：Electron 窗口应用

---

### 5.3 第三步：打每个服务的 deb 包

建议顺序：

```bash
cd portal && ./project build
cd cockpit && ./project build
cd nvr && ./project build
cd kiosk && ./project build
```

产物一般在各项目 `builds/` 目录下，例如：

- `portal/builds/blockone-portal.deb`
- `cockpit/builds/blockone-cockpit.deb`
- `nvr/builds/blockone-nvr.deb`
- `kiosk/builds/blockone-kiosk-armhf.deb` / `arm64.deb`

---

### 5.4 第四步：构建树莓派镜像

在仓库根目录执行：

```bash
bash project build
```

构建时会交互选择：

1. Recipe（产品配方）
2. Board（板卡型号）
3. Release（系统版本）
4. Node 分支

树莓派相关板卡配置见：

- `image/config/boards/rpi.conf`（当前描述为 Raspberry Pi 2/3B/3B+/4B）

镜像输出最终会复制到根目录 `builds/`。

---

### 5.5 第五步：烧录并现场首启

1. 用 Raspberry Pi Imager/balenaEtcher 把镜像写入 SD 卡
2. 树莓派上电
3. 用手机连 `BlockOne` 热点
4. 打开配网页给设备配现场 Wi-Fi
5. 设备联网后：
   - `cockpit`：`http://设备IP:8080`
   - `nvr`：`http://设备IP:5050`（如果该配方包含）
   - `kiosk`：屏幕自动进入注册/播放状态

---

### 5.6 第六步：平台联调与验收

Cast 场景：

1. 设备屏幕出现注册码
2. 在后台绑定屏幕
3. `kiosk` 自动切到配置的播放页面

NVR 场景：

1. 进入 `nvr` 页面完成设备注册
2. 添加摄像头参数（RTSP 等）
3. 保存后检查定时录制和上传是否生效

---

## 6. 新手最常用的排错命令

在树莓派终端执行：

```bash
systemctl status portal
systemctl status cockpit
systemctl status nvr

journalctl -u portal -f
journalctl -u cockpit -f
journalctl -u nvr -f

ip a
nmcli device status
```

快速连通性检查：

```bash
curl -I http://127.0.0.1:8080
curl -I http://127.0.0.1:5050
```

---

## 7. 常见问题对照（现象 -> 优先检查）

现象：看不到 `BlockOne` 热点  
优先检查：`portal` 是否启动、无线网卡是否可用、`journalctl -u portal -f`

现象：配网后还是没网  
优先检查：Wi-Fi 密码、路由 DHCP、`nmcli device status`

现象：`kiosk` 一直停在注册码页  
优先检查：是否已在后台绑定、外网是否可达 Encompass API

现象：`nvr` 摄像头保存后无录制文件  
优先检查：RTSP 地址、磁盘路径权限、`nvr` 日志、cron 是否写入

现象：设备卡顿或假死  
优先检查：`cockpit` 资源占用、磁盘占满、是否需要重启

---

## 8. 给新人的上手建议（最快路径）

1. 先只跑 `portal + cockpit`，把“配网 + 运维”链路跑通
2. 再加 `kiosk`，验证“注册后自动播放”
3. 最后加 `nvr`，再做摄像头录制上传

这样学习曲线最平滑，不容易一上来被复杂链路压住。
