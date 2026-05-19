# Encompass OS 服务功能总览（中文）

## 1. 文档目的
本文档用于系统化说明 `encompass-os` 仓库中的各个服务与模块，帮助研发、运维、实施同事快速理解：

1. 有哪些服务在运行  
2. 每个服务负责什么  
3. 服务之间如何协作  
4. 各产品形态（recipe）差异  
5. 常见落地场景与运维关注点

---

## 2. 项目分层总览
`encompass-os` 不是单体应用，而是一套“设备系统 + 构建系统”的组合，核心分为三层：

1. 设备运行时服务层  
`portal`、`cockpit`、`nvr`、`kiosk`

2. 平台管理端插件层  
`dashboards/encompass-cast`

3. 镜像构建与安装层  
根 `project` + `image` + `recipes/*`

可理解为：

1. `image + recipes` 负责“做系统镜像”   
2. `portal/cockpit/nvr/kiosk` 负责“设备开机后实际提供能力”   
3. `dashboards/encompass-cast` 负责“平台侧对设备进行管理配置”   

---

## 3. 运行时核心服务详解

## 3.1 Portal（配网门户服务）
目录：`portal/`  
systemd：`portal/portal.service`  
默认端口：`80`

### 3.1.1 作用
`portal` 的核心职责是“设备配网”：

1. 设备未联网时提供本地门户页面（Captive Portal）  
2. 扫描可用 Wi-Fi 并接收用户输入密码  
3. 控制网卡与热点启停，完成设备入网

### 3.1.2 关键行为
1. 启动后先检测网络状态  
如果已经联网，直接退出，不持续占用门户流程。

2. 若未联网，启动 HTTP 服务并拉起热点  
默认会操作 `wlan0`，启动 SSID 为 `BlockOne` 的热点。

3. 连接成功后自动退出  
连接目标 Wi-Fi 成功后，Portal 返回成功并结束进程，交还系统到“已联网运行态”。

1. `GET /api`  
返回连接状态、当前连接、网卡设备、热点状态等。

2. `GET /api/networks`  
扫描并返回 Wi-Fi 列表。

3. `POST /api/wireless/enable` / `POST /api/wireless/disable`  
控制无线能力开关。

4. `POST /api/:iface/connect` / `POST /api/:iface/disconnect`  
连接或断开指定网卡（如 `wlan0`）。

5. `POST /api/:iface/up` / `POST /api/:iface/down`  
控制以太网接口上下线。

6. `POST /api/hotspot/start` / `POST /api/hotspot/stop`  
控制热点启停。

### 3.1.4 典型场景
1. 新设备首次安装时现场配网  
2. 设备换路由后重新配网  
3. 设备搬迁网络环境后的恢复接入

---

## 3.2 Cockpit（设备控制台服务）
目录：`cockpit/`   
systemd：`cockpit/cockpit.service`  
默认端口：`8080`   

### 3.2.1 作用
`cockpit` 是设备本地运维控制台，面向“设备健康检查与远程运维”：

1. fsmpeg 录像 
2. 展示 CPU、内存、文件系统等运行状态  
3. 提供远程重启能力


### 3.2.2 主要 API
1. `GET /api/system`  
返回系统与 OS 基础信息。

2. `GET /api/system/cpu`  
返回 CPU 信息、频率、负载、缓存。

3. `GET /api/system/temperature`  
返回温度信息。

4. `GET /api/system/memory`  
返回内存布局与内存占用。

5. `GET /api/system/filesystem`  
返回文件系统容量与使用率。

6. `GET /api/system/activity`  
返回系统负载活动数据。

7. `PUT /api/system/reboot`  
触发系统重启（执行 `shutdown -r now`）。

### 3.2.3 前端页面能力
`cockpit/src/views/console.vue` 对应三大展示区：

1. System  
2. Memory  
3. File System  

并可在页面执行重启倒计时后调用重启 API。

### 3.2.4 典型场景
1. 远程排障时查看设备资源状态  
2. 运维巡检设备健康度  
3. 现场或远程重启恢复服务

---

## 3.3 NVR（录像与摄像头管理服务）
目录：`nvr/`  
systemd：`nvr/nvr.service`  
默认端口：`5050`

### 3.3.1 作用
`nvr` 是“摄像头配置 + 录像调度 + 文件上传”的核心服务：

1. 管理播放器注册信息  
2. 管理摄像头清单（增删改查）  
3. 生成录像脚本与 crontab 调度  
4. 打包录像并上传至 Encompass 平台

### 3.3.2 主要 API（业务面）
1. `GET /api/player`  
获取或自动注册当前设备播放器信息。

2. `GET /api/unregistered`  
校验未注册设备信息（注册码流程）。

3. `POST /api/register`  
把“未注册播放器”配对到正式 Encompass ID。

4. `POST /api/update`  
更新播放器资料（名称等）。

5. `GET /api/cameras`  
查询摄像头列表。

6. `PUT /api/cameras`  
新增摄像头。

7. `POST /api/cameras`  
更新摄像头。

8. `DELETE /api/cameras`  
删除摄像头。

9. `POST /api/ip`  
上报设备 IP 与版本信息。

10. `POST /api/board`  
上报设备主板/厂商信息。

### 3.3.3 录像调度 API（系统面）
1. `POST /api/cron`  
根据摄像头配置生成脚本并写入 crontab。

2. `GET /api/send`  
执行采集文件筛选、打包、上传流程。

### 3.3.4 录像流程（关键机制）
默认路径：`/media/camfeeds`

调度逻辑：

1. 每小时 `30` 分执行 `ffmpegscript.sh`  
按每个摄像头 RTSP 地址录制约 59 分钟片段（`-t 3540`）。

2. 每小时 `00` 分执行 `curlscript.sh`  
触发 `GET /api/send` 做上传流程。

上传流程：

1. 取符合命名规则的 `cam*.mp4` 文件  
2. 仅处理“1 小时前的文件”  
3. 累计到最大 2GB（`maxSize = 2 * 1024 * 1024 * 1024`）  
4. 生成 `file.csv` 映射信息  
5. 打包 `cam.zip`  
6. 上传到 Encompass 接口 `Cast_Cameras_Attachments`

### 3.3.5 前端配置页面
`nvr/src/views/config.vue` 实现：

1. 摄像头列表展示  
2. 字段校验（名称、MAC、IP、RTSP、状态）  
3. 新增/修改/删除  
4. 保存后触发 `/api/cron` 重写调度

### 3.3.6 典型场景
1. 多摄像头门店录像回传  
2. 摄像头网络参数调整  
3. 摄像头状态批量维护

---

## 3.4 Kiosk（屏幕播放端应用）
目录：`kiosk/`  
类型：Electron 全屏应用（非独立 systemd 服务）

### 3.4.1 作用
`kiosk` 是设备显示端，负责“最终内容播放”：

1. 未配置 URL 时展示注册/引导界面  
2. 已配置 URL 时全屏 iframe 播放页面内容  
3. 定时向平台同步注册状态、IP、设备信息

### 3.4.2 启动链路
在 `blockone-cast` recipe 中：

1. 自动登录 `blockone` 用户（tty1）  
2. `.bashrc` 中自动 `startx -- -nocursor`  
3. openbox `autostart` 启动 `"/opt/Block One Cast/kiosk" --no-sandbox`

### 3.4.3 运行机制
1. 周期调用 `Encompass.register()` 获取播放器配置  
2. 拿到 `URL_DBValue` 后切换到 iframe 播放模式  
3. 周期上报 IP（`Update_Screen_IP`）与主板信息（`Cast_Update_BoardInfo`）

### 3.4.4 典型场景
1. 数字标牌内容展示  
2. 门店信息屏轮播  
3. 统一远程下发页面内容

---

## 4. 管理端插件：`dashboards/encompass-cast`

### 4.1 角色定位
该模块不是设备端守护服务，而是平台端管理插件，用于在 Encompass 后台管理屏幕设备。

### 4.2 主要功能
1. 获取屏幕列表（`Get_Screen_List`）  
2. 注册新屏（`Pair_Screen`）  
3. 更新屏幕 URL（`Update_Screen`）  
4. 一键打开设备控制台（`http://<device-ip>:8080`）

### 4.3 使用价值
把设备侧能力与平台侧运维动作打通，形成“后台配置 -> 终端生效”的完整闭环。

---

## 5. 构建与发布体系（Image + Recipes）

## 5.1 根项目编排脚本 `project`
根 `project` 负责全局流程：

1. `setup`：安装构建依赖并给各子项目安装 npm 依赖  
2. `build`：触发 `image/project build` 进行整机镜像构建  
3. `boards`：列出可选板卡  
4. `clean`：清理构建产物

Windows 调试初始化使用 `setup-win.ps1`，可在 Windows 下安装各子项目依赖并跑 debug 流程。

## 5.2 `image` 层职责
`image` 负责做系统镜像，`image/lib/main.sh` 会：

1. 选择 recipe（决定产品形态）  
2. 选择板卡（Board）  
3. 选择内核分支（legacy/current/edge）  
4. 选择发行版与 Node 源  
5. 根据 recipe 的 `build` 清单先构建子项目  
6. 最终产出镜像文件（按 recipe + version + board 命名）

当前板卡配置文件数量较大（`image/config/boards` 约百余个），可适配多种 ARM SBC 设备。

## 5.3 Recipe 机制
每个 recipe 目录包含：

1. `build`：定义需打包的子项目  
2. `preinst.sh`：把各 `.deb` 复制进镜像临时目录  
3. `install.sh`：在 chroot 内安装依赖与应用  
4. `postinst.sh`：安装启动配置并清理临时文件  
5. `name`：构建菜单显示名称

### 5.3.1 三种产品形态
1. `recipes/encompass-os`  
`portal + cockpit`

2. `recipes/encompass-nvr`  
`portal + cockpit + nvr`

3. `recipes/blockone-cast`  
`portal + cockpit + kiosk + nvr`

---

## 6. 子项目打包与开机自启方式

## 6.1 `portal` / `cockpit` / `nvr`
每个项目都有：

1. `makefile`：把入口脚本、lib、前端构建产物、service 文件打成 `.deb`  
2. `postinst`：安装后执行 systemd enable/start（或禁用冲突服务）  
3. 二进制入口放在 `/usr/bin/*`

示例：

1. `cockpit` -> `/usr/bin/cockpit`，开机启用 `cockpit.service`  
2. `portal` -> `/usr/bin/portal`，启用 `portal.service`，并禁用 `hostapd/dnsmasq` 默认服务  
3. `nvr` -> `/usr/bin/nvr`，开机启用 `nvr.service`

## 6.2 `kiosk`
`kiosk` 打包为架构相关 deb：

1. `blockone-kiosk-armhf.deb`  
2. `blockone-kiosk-arm64.deb`

在 `blockone-cast/install.sh` 按 CPU 架构安装对应包。

---

## 7. 端到端协同流程（推荐理解）
一个典型设备生命周期可分为 6 步：

1. 镜像烧录并开机  
2. `portal` 提供配网入口（若未联网）  
3. 设备联网后，`kiosk`/`nvr` 向 Encompass 注册并拉取配置  
4. 管理端插件维护屏幕 URL 与设备信息  
5. `kiosk` 全屏播放内容  
6. `nvr` 定时录制、打包并上传摄像头视频

同时，`cockpit` 提供贯穿全程的运维可视化与重启能力。

---

## 8. 典型落地场景映射

1. 纯数字标牌场景  
可选 `encompass-os`（配网 + 运维）或 `blockone-cast`（含播放端）。

2. 门店安防回传场景  
建议 `encompass-nvr` 或 `blockone-cast`，使用 `nvr` 管理摄像头和上传。

3. 一体化商显 + 录像场景  
使用 `blockone-cast`，同时具备配网、运维、全屏展示、录像回传能力。

---

## 9. 运维与安全注意事项

1. API Token 管理  
当前代码中存在明文 token（`nvr`、`kiosk`、`dashboards`），生产环境建议改为环境变量或安全注入。

2. root 登录策略  
recipe 中会锁定 root，并创建 `blockone` 用户自动登录，需结合现场安全策略评估。

3. 网络依赖  
`portal`、`nvr`、`kiosk` 与云端 API 强依赖网络可达性，离线容错策略需额外设计。

4. 录像存储管理  
`nvr` 上传流程有 2GB 限制与时间窗口筛选，现场仍需关注磁盘容量与清理策略。

---

## 10. 快速排障建议

1. 配网失败  
优先看 `portal` 是否已启动、`wlan0` 是否可用、热点是否存在。

2. 设备已联网但后台看不到  
检查 `kiosk`/`nvr` 的注册调用、IP 上报接口是否成功。

3. 视频未上传  
检查 `nvr` 的 crontab 是否写入、`ffmpegscript.sh` 是否生成、`/media/camfeeds` 权限是否正常。

4. 远程运维不可用  
检查 `cockpit` 服务与 8080 端口联通性。

---

## 11. 相关目录速查

1. 设备服务代码  
`portal/`, `cockpit/`, `nvr/`, `kiosk/`

2. 平台插件  
`dashboards/encompass-cast/`

3. 镜像构建  
`image/`, 根 `project`

4. 产品配方  
`recipes/encompass-os/`, `recipes/encompass-nvr/`, `recipes/blockone-cast/`

---

## 12. 总结
`encompass-os` 的本质是一套围绕 ARM 设备的“可部署操作系统方案”：

1. `portal` 解决入网  
2. `cockpit` 解决运维可视化  
3. `nvr` 解决摄像头采集与回传  
4. `kiosk` 解决屏幕展示  
5. `image + recipes` 解决多形态镜像交付

这使项目既可做轻量屏显终端，也可扩展到带录像能力的完整现场设备。
