/* UI copy only. Original articles, user input, URLs and API payloads are never
   translated. Rows are Simplified Chinese | Traditional Chinese | English | Japanese.
   {n} placeholders retain measured values, hostnames and proper names. */
const interfaceCopyRows = `
请输入域名或 IP | 請輸入網域或 IP | Enter a hostname or IP | ホスト名または IP を入力してください
地址不能包含空格或控制字符 | 位址不能包含空格或控制字元 | Address cannot contain spaces or control characters | アドレスに空白や制御文字は使えません
只支持 HTTP/HTTPS 网站地址、域名或 IP | 只支援 HTTP/HTTPS 網址、網域或 IP | Use an HTTP/HTTPS URL, hostname or IP | HTTP/HTTPS URL、ホスト名、IP を指定してください
域名格式不正确 | 網域格式不正確 | Invalid hostname format | ホスト名の形式が無効です
本地助手需要 Windows 的 tracert.exe | 本機助手需要 Windows 的 tracert.exe | Local helper requires Windows tracert.exe | ローカルヘルパーには Windows の tracert.exe が必要です
已到达目标 | 已到達目標 | Destination reached | 宛先に到達
探测超时，保留已收到的跳点 | 探測逾時，保留已收到的跳點 | Trace timed out; received hops retained | 追跡がタイムアウト。応答したホップを保持
目标未响应或达到跳数上限，保留已收到的跳点 | 目標未回應或達到跳數上限，保留已收到的跳點 | No destination response or hop limit reached; received hops retained | 宛先の応答なし、またはホップ数上限。取得済みの結果を保持
仅允许本地面板访问 | 僅允許本機面板存取 | Access is limited to the local panel | ローカルパネルのみアクセスできます
仅允许本地面板会话访问 | 僅允許本機面板工作階段存取 | Only local panel sessions may access this service | ローカルパネルのセッションのみ利用できます
会话无效 | 工作階段無效 | Invalid session | セッションが無効です
任务不存在 | 工作不存在 | Task not found | タスクが見つかりません
接口不存在 | 介面不存在 | Endpoint not found | エンドポイントが見つかりません
禁止访问 | 禁止存取 | Access denied | アクセス拒否
请求格式不正确 | 請求格式不正確 | Invalid request format | リクエスト形式が無効です
协议或跳数不正确 | 協定或跳數不正確 | Invalid protocol or hop count | プロトコルまたはホップ数が無効です
已有追踪任务运行中 | 已有追蹤工作執行中 | A trace is already running | 経路追跡を実行中です
助手响应 {0} | 助手回應 {0} | Helper response {0} | ヘルパーの応答 {0}
不是路由助手 | 不是路由助手 | This service is not the route helper | このサービスは経路ヘルパーではありません
从 ESP32 硬件与固件，到手机、桌面和浏览器里的小实验。这里挑出有代表性的项目，说明它们能做什么，以及目前公开了哪些内容。 | 從 ESP32 硬體與韌體，到手機、桌面和瀏覽器裡的小實驗。這裡挑出有代表性的專案，說明它們能做什麼，以及目前公開了哪些內容。 | From ESP32 hardware and firmware to experiments on phones, desktops and browsers. Explore selected projects, what they do, and what is publicly available. | ESP32 のハードウェアとファームウェアから、スマホ、デスクトップ、ブラウザーの実験まで。代表的な作品の機能と公開内容を紹介します。
面向车辆使用的仪表固件，通过总线读取行驶与电池数据，在彩色屏幕显示速度、挡位、电量、功率和故障状态。它支持按键操作、无线连接与固件升级，仓库还提供接线资料、使用说明和实物照片。 | 車用儀表韌體透過匯流排讀取行駛與電池資料，在彩色螢幕顯示速度、檔位、電量、功率和故障狀態。支援按鍵操作、無線連線與韌體升級，倉庫提供接線資料、使用說明和實物照片。 | Vehicle dashboard firmware reads driving and battery data over a bus, displaying speed, gear, charge, power and faults. It supports buttons, wireless connections and firmware updates; the repository includes wiring guides, instructions and device photos. | バス経由で走行・バッテリー情報を読み取り、速度、ギア、残量、電力、異常をカラー画面に表示する車載ファームウェア。ボタン、無線接続、更新に対応し、配線資料、利用手順、実機写真も公開しています。
这套掌机固件驱动高分辨率彩屏、触摸面板、游戏手柄和音频功放，可在菜单中选择并运行红白机游戏。游戏中能调节背光与音量，也能通过组合键或触摸返回菜单；仓库提供源码和构建说明。 | 這套掌機韌體驅動高解析度彩色螢幕、觸控面板、遊戲手把和音訊擴大器，可從選單執行紅白機遊戲。能調整背光與音量，透過組合鍵或觸控返回選單；倉庫提供原始碼和建置說明。 | Handheld firmware drives a high-resolution color display, touch panel, controller and audio amplifier to run NES games. Adjust brightness and volume, or return to the menu with touch or button combinations. Source and build guides are public. | 高解像度カラー画面、タッチパネル、コントローラー、アンプを動かして NES ゲームを実行するファームウェア。明るさと音量の調整、タッチやキー操作でのメニュー復帰に対応。ソースとビルド手順を公開しています。
连接兼容仪表的无线网络后，这款手机应用可将相册媒体、摄像头画面和手机屏幕投到仪表。仪表固件达到要求时，还能从手机选择图片设置壁纸；仓库提供安装包、版本说明和基本操作步骤。 | 連接相容儀表的無線網路後，手機應用程式可將相簿媒體、相機畫面和手機螢幕投影到儀表。符合韌體要求時可從手機設定桌布；倉庫提供安裝包、版本說明和操作步驟。 | Connect to a compatible dashboard's Wi-Fi to mirror gallery media, camera video and the phone screen. Supported firmware also allows setting a wallpaper from the phone. The repository includes APKs, release notes and instructions. | 対応メーターの Wi-Fi に接続し、写真・動画、カメラ映像、スマホ画面を転送するアプリ。対応ファームウェアでは壁紙も設定できます。APK、リリース情報、操作手順を公開しています。
这是一项面向英特尔一体机的桌面视觉实验：接收姿态追踪器的数据，将屏幕转动映射为实时透视折叠、模糊与淡出效果。用户可以校准展开角度、切换旋转轴和随时暂停，仓库公开了源码与构建说明。 | 面向 Intel 一體機的桌面視覺實驗，接收姿態追蹤器資料，將螢幕轉動映射成即時透視摺疊、模糊與淡出效果。可校準展開角度、切換旋轉軸及暫停；原始碼與建置說明已公開。 | A desktop visual experiment for Intel all-in-one computers: tracker orientation drives real-time perspective folding, blur and fading. Calibrate the unfolded angle, switch axes or pause anytime. Source and build guides are public. | Intel 一体型 PC 向けのデスクトップ映像実験。姿勢トラッカーから画面の回転を取得し、折りたたみ、ぼかし、フェードを表現。角度の校正、軸の切替、一時停止に対応。ソースとビルド手順を公開しています。
这款桌面程序实时合成并混合多层发动机音色，让声音随转速、负载和挡位变化。你可以用手柄或界面控制油门、刹车与变速箱，也能加入循环音频素材；项目提供多种车辆风格预设和运行说明。 | 桌面程式即時合成及混合多層引擎音色，隨轉速、負載與檔位變化。可用手把或介面控制油門、煞車與變速箱，也可加入循環音訊；提供多種車輛風格預設及執行說明。 | This desktop app synthesizes layered engine sounds based on RPM, load and gear. Control throttle, brakes and transmission with a controller or the interface, and add looped audio. Vehicle presets and usage instructions are included. | 回転数、負荷、ギアに応じて複数のエンジン音を合成するデスクトップアプリ。コントローラーや画面でアクセル、ブレーキ、変速を操作し、ループ音源も追加できます。車種プリセットと利用手順を公開しています。
这项浏览器实验通过摄像头识别手势，再切换粒子造型和动画，让双手直接参与画面的变化。项目采用纯前端实现，允许摄像头访问后即可体验；如果本地浏览器限制调用，也可以启动本地服务运行。 | 瀏覽器實驗透過攝影機辨識手勢，切換粒子造型和動畫。採純前端實作，允許攝影機存取即可體驗；若瀏覽器限制本機呼叫，可啟動本機服務執行。 | A browser experiment that recognizes camera gestures to change particle shapes and animation. It runs entirely in the frontend with camera permission; use a local server if your browser restricts local file access. | カメラの手の動きを認識して粒子の形やアニメーションを変えるブラウザー実験。カメラを許可すると体験できます。ローカルファイルのアクセスが制限される場合は、ローカルサーバーを利用できます。
这个网站本身也是一个作品，使用原生网页技术构建，汇集个人介绍、博客、小游戏、网站导航与状态面板。页面为桌面和手机屏幕调整布局，还加入明暗主题、多语言切换与交互；源码公开在仓库中。 | 這個網站使用原生網頁技術建構，整合個人介紹、部落格、小遊戲、網站導航與狀態面板。版面適用桌面及手機，支援明暗主題與多語言切換；原始碼公開在倉庫中。 | Built with native web technologies, this site brings together a profile, blog, games, links and a status dashboard. Responsive layouts support desktop and mobile, with light/dark themes and language switching. Source code is public. | このサイトも、標準の Web 技術で作った作品です。プロフィール、ブログ、ゲーム、リンク、ステータスをまとめ、PC とスマホに対応。明暗テーマ、多言語、操作機能を備え、ソースを公開しています。
VPN 分流可能使各服务看到不同出口。IP 归属地来自数据库，可能与节点位置不同，也不是你本人的实际位置。打开页面会自动请求这 4 家服务。 | VPN 分流可能使各服務看到不同出口。IP 所在地來自資料庫，可能與節點位置不同，也不是你的實際位置。開啟頁面會自動請求這 4 家服務。 | VPN routing can produce different exits for different services. Database IP locations can differ from server locations and are not your physical location. Opening this page contacts all 4 services automatically. | VPN の経路分岐で、サービスごとに出口が異なる場合があります。IP の推定位置は実際のサーバー位置やあなたの所在地とは限りません。ページを開くと 4 サービスへ自動で照会します。
各站点独立连续检测 12 次，收到响应后立即开始下一次；超时 / 失败也计为一次，完成后停止。圆点对应本次 12 次请求。绿色 ≤150ms，黄色 ≤300ms，红色 >300ms，灰色为超时 / 失败。测量浏览器到目标站点的 HTTP 响应耗时，受 VPN 分流、连接复用和服务端响应影响；不等同于 ICMP Ping 或丢包率。 | 各站點獨立連續檢測 12 次，回應後立即開始下一次；逾時或失敗也計一次，完成後停止。圓點對應 12 次請求：綠色 ≤150ms，黃色 ≤300ms，紅色 >300ms，灰色為逾時或失敗。測量 HTTP 回應時間，受 VPN 分流、連線重用及伺服器影響；不等同 ICMP Ping 或封包遺失率。 | Each site receives 12 consecutive independent requests, including timeouts and failures, then stops. Dots show those requests: green ≤150ms, yellow ≤300ms, red >300ms, gray timeout/failure. This measures HTTP response time affected by VPN routing, connection reuse and servers, not ICMP ping or packet loss. | 各サイトに独立して連続 12 回送信し、タイムアウトと失敗も 1 回に数えて停止します。緑 ≤150ms、黄 ≤300ms、赤 >300ms、灰は失敗。HTTP 応答時間を測定し、VPN 経路、接続再利用、サーバーの影響を受けます。ICMP Ping やパケット損失率とは異なります。
仅手动启动。每阶段最多 8 秒；下载上限 64 MiB，上传上限 16 MiB，最多 3 个并发连接。HTTP 实测结果取决于节点、VPN 分流和当前网络，不代表套餐带宽；短样本会提示。测速时暂停常用网站检测，结束后恢复未完成的检测。 | 僅手動啟動。每階段最多 8 秒，下載上限 64 MiB、上傳上限 16 MiB，最多 3 條並行連線。HTTP 結果受節點、VPN 分流和網路影響，不代表方案頻寬；短樣本會提示。測速期間暫停網站檢測，結束後恢復未完成的檢測。 | Manual start only. Up to 8 seconds per phase, 64 MiB download and 16 MiB upload, with at most 3 concurrent connections. HTTP results depend on server, VPN and network; they do not represent plan bandwidth. Short samples are flagged. Site checks pause during testing and resume afterward. | 手動開始のみ。各段階最大 8 秒、下り 64 MiB、上り 16 MiB、同時接続は最大 3 本。結果はサーバー、VPN、通信環境に依存し、契約帯域を示しません。短い測定は注記します。測定中はサイト検査を止め、終了後に未完了分を再開します。
浏览器不能直接执行本机 traceroute。Windows 10 / 11（64 位）访客下载下方助手，双击运行后会自动打开本地面板；无需安装 Python、输入命令或安装浏览器扩展。选择网站或输入 IP，结果和地图会自动显示。 | 瀏覽器不能直接執行本機 traceroute。Windows 10 / 11（64 位元）使用者可下載助手，按兩下執行後自動開啟本機面板；不需安裝 Python、輸入指令或安裝擴充功能。選擇網站或輸入 IP 即可顯示結果與地圖。 | Browsers cannot run local traceroute directly. Windows 10/11 (64-bit) users can download and double-click the helper to open its local panel, without Python, commands or extensions. Choose a site or enter an IP to see results and the map. | ブラウザーから直接 traceroute は実行できません。Windows 10/11（64 ビット）ではヘルパーをダウンロードして起動するとパネルが開きます。Python、コマンド、拡張機能は不要。サイトか IP を指定すると結果と地図が表示されます。
下载后需要你手动运行一次程序，网页不能自动安装或启动它。目前助手支持 Windows；macOS、Linux 和手机暂不提供本机追踪。测速与网站延迟检测仍可直接使用。 | 下載後需手動執行程式，網頁不能自動安裝或啟動。助手目前支援 Windows；macOS、Linux 和手機暫不提供本機追蹤。測速與網站延遲檢測仍可直接使用。 | Run the app manually after download; this page cannot install or start it. The helper currently supports Windows; local tracing is unavailable on macOS, Linux and phones. Speed and website latency tests still work directly. | ダウンロード後は手動で起動してください。ページからの自動インストールや起動はできません。ヘルパーは Windows 対応で、macOS、Linux、スマホでの経路追跡は未対応です。速度・応答時間の検査は利用できます。
最多 30 跳，约 100 秒。* 表示该次探测未响应，不等同于业务丢包。ICMP 可能不经过仅代理 HTTP 的 VPN；展示的是这台电脑实际收到的跳点。地图仅标记有坐标的公网 IP，虚线连接已知跳点，表示顺序而非实际光缆路线。IP 数据库位置为估算，Anycast IP 可能与实际机房不同；超时和私网地址不会伪造位置。归属地查询会向 IPinfo / ipwho.is 发送跳点 IP；底图来自 OpenStreetMap。 | 最多 30 跳，約 100 秒。* 表示探測未回應，不等同業務封包遺失。ICMP 可能不經僅代理 HTTP 的 VPN。地圖僅標示有座標的公開 IP；虛線表示順序而非實際光纖路線。資料庫位置為估算，Anycast 可能與機房不同；逾時和私有位址不會偽造位置。查詢會向 IPinfo / ipwho.is 傳送跳點 IP，底圖來自 OpenStreetMap。 | Up to 30 hops, about 100 seconds. * means no probe response, not application packet loss. ICMP may bypass HTTP-only VPNs. The map shows public IPs with known coordinates; dashed lines indicate order, not physical cables. Database and Anycast locations are estimates; no locations are invented for timeouts or private IPs. Hop IPs are sent to IPinfo/ipwho.is; tiles come from OpenStreetMap. | 最大 30 ホップ、約 100 秒。* は応答なしで、通信全体のパケット損失とは異なります。ICMP は HTTP 専用 VPN を通らない場合があります。地図は座標のあるグローバル IP のみを表示し、破線は順序を示します。推定位置は実機と異なる場合があり、タイムアウトやプライベート IP の位置は生成しません。照会先は IPinfo / ipwho.is、地図は OpenStreetMap です。
点击画面、起飞或空格开始 | 點擊畫面、起飛或空白鍵開始 | Tap the canvas, Flap or Space to start | 画面タップ、飛ぶ、スペースで開始
点击开始游戏，或按方向键开始 | 點擊開始遊戲，或按方向鍵開始 | Click Start game or press an arrow key | ゲーム開始または矢印キーで開始
已暂停，点击继续游戏恢复 | 已暫停，點擊繼續遊戲恢復 | Paused. Click Resume game | 一時停止中。ゲーム再開を押してください
起飞或重新起飞 | 起飛或重新起飛 | Flap or retry | 飛ぶ、または再挑戦
开始游戏 | 開始遊戲 | Start game | ゲーム開始
暂停游戏 | 暫停遊戲 | Pause game | ゲームを一時停止
继续游戏 | 繼續遊戲 | Resume game | ゲーム再開
你赢了！已填满整个棋盘 | 你贏了！已填滿整個棋盤 | You won! The board is full | 勝ちました！盤面がすべて埋まりました
游戏结束：撞到墙或身体，请重新开始 | 遊戲結束：撞到牆或身體，請重新開始 | Game over: hit a wall or yourself. Restart to retry | ゲームオーバー：壁か体に衝突。最初から再挑戦してください
游戏结束：方块堆满，请重新开始 | 遊戲結束：方塊堆滿，請重新開始 | Game over: the stack is full. Restart to retry | ゲームオーバー：ブロックがいっぱいです。最初から再挑戦してください
游戏结束，得分 {0}。点击起飞或空格重试 | 遊戲結束，得分 {0}。點擊起飛或空白鍵重試 | Game over. Score {0}. Flap or press Space to retry | ゲームオーバー。スコア {0}。飛ぶかスペースで再挑戦
已打开，周围 {0} 个雷 | 已開啟，周圍 {0} 個地雷 | Revealed, {0} adjacent mines | 開封済み、周囲に地雷 {0} 個
未打开 | 未開啟 | Hidden | 未開封
你的回合 | 你的回合 | Your turn | あなたの番
AI 思考中 | AI 思考中 | AI is thinking | AI が思考中
黑棋回合 | 黑棋回合 | Black's turn | 黒の番
白棋回合 | 白棋回合 | White's turn | 白の番
我的主页 | 我的主頁 | My Homepage | ホーム
个人简介 | 個人簡介 | Profile | プロフィール
我的博客 | 我的部落格 | My Blog | 私のブログ
项目与作品 · 小米周 | 專案與作品 · 小米周 | Projects · 小米周 | 作品 · 小米周
网站导航 | 網站導航 | Links | リンク集
状态面板 | 狀態面板 | Status | ステータス
小游戏 | 小遊戲 | Games | ゲーム
终端控制台 | 終端控制台 | Terminal Console | ターミナル
假 SSH / Linux | 模擬 SSH / Linux | SSH / Linux Simulator | SSH / Linux シミュレーター
跳到主内容 | 跳到主內容 | Skip to main content | メインコンテンツへ
主导航 | 主導航 | Main navigation | メインナビゲーション
主要导航 | 主要導航 | Main navigation | メインナビゲーション
返回首页 | 返回首頁 | Back to home | ホームに戻る
首页 | 首頁 | Home | ホーム
个人页 | 個人頁 | Profile | プロフィール
博客 | 部落格 | Blog | ブログ
我的作品 | 我的作品 | My Work | 作品
签证信息 | 簽證資訊 | Visa Info | ビザ情報
语言 | 語言 | Language | 言語
主题 | 主題 | Theme | テーマ
页面状态 | 頁面狀態 | Page status | ページの状態
个人主页入口 | 個人主頁入口 | Homepage destinations | ホームのリンク
在线 | 線上 | Online | オンライン
小米周的头像 | 小米周的頭像 | Profile picture of 小米周 | 小米周のプロフィール画像
小米周的个人头像 | 小米周的個人頭像 | Profile picture of 小米周 | 小米周のプロフィール画像
北京时间 | 北京時間 | Beijing time | 北京時間
加载中... | 載入中... | Loading… | 読み込み中…
终端在线 | 終端上線 | Online | オンライン
用代码记录想法，用镜头记录世界， | 用程式碼記錄想法，用鏡頭記錄世界， | Ideas in code, the world through a lens. | コードでアイデアを、レンズで世界を記録する。
用代码记录想法， | 用程式碼記錄想法， | Ideas in code, | コードでアイデアを、
用镜头记录世界， | 用鏡頭記錄世界， | the world through a lens. | レンズで世界を記録する。
在不断折腾中，让热爱持续发生。 | 在不斷探索中，讓熱愛持續發生。 | Keep experimenting, keep creating. | 試行錯誤を重ね、好きなことを続ける。
中国 · 上海 | 中國 · 上海 | Shanghai, China | 中国・上海
社交与手机访问 | 社群與手機瀏覽 | Social links and mobile access | SNS とスマホでのアクセス
B站 | B站 | Bilibili | Bilibili
哔哩哔哩 | 嗶哩嗶哩 | Bilibili | Bilibili
抖音 | 抖音 | Douyin | Douyin
个人资料 | 個人資料 | Profile information | プロフィール情報
旅行中拍摄的绿色草地与建筑 | 旅行中拍攝的綠色草地與建築 | Green lawn and buildings photographed while traveling | 旅行で撮影した芝生と建物
兴趣与热爱 | 興趣與熱愛 | Interests | 好きなこと
新奇硬件 | 新奇硬體 | New hardware | 新しいハードウェア
与生产力工具 | 與生產力工具 | and productivity tools | と作業を助けるツール
探索未知 | 探索未知 | Explore new places | 未知の場所を探る
收集地图与故事 | 收集地圖與故事 | Collect maps and stories | 地図と思い出を集める
记录光影 | 記錄光影 | Capture light | 光と影を記録する
定格美好瞬间 | 定格美好瞬間 | Preserve good moments | 美しい瞬間を残す
折腾硬件 | 探索硬體 | Experiment with hardware | ハードウェアを試す
创造有趣的东西 | 創造有趣的東西 | Build interesting things | 面白いものを作る
博客稳定运行时间 | 部落格穩定運行時間 | Blog uptime | ブログ稼働時間
计算中... | 計算中... | Calculating… | 計算中…
本次运行时间 | 本次運行時間 | Time since launch | 開設からの時間
当前状态 | 目前狀態 | Current status | 現在の状況
专注模式　·　学习 Rust | 專注模式　·　學習 Rust | Focus mode · Learning Rust | 集中モード・Rust を学習中
优化个人项目　·　准备下一次旅行 | 優化個人專案　·　準備下一次旅行 | Improving projects · Planning the next trip | 個人プロジェクトを改善・次の旅を計画
记录生活与灵感 | 記錄生活與靈感 | Recording life and ideas | 日常とアイデアを記録
项目焦点 | 專案焦點 | Project spotlight | 注目のプロジェクト
NES 掌机与 Xbox 手柄 | NES 掌機與 Xbox 手把 | NES handheld with Xbox controller | NES 携帯機と Xbox コントローラー
ESP32-S3 驱动 800×480 彩屏、触摸与 USB 手柄，运行红白机游戏；源码和构建说明已公开。 | ESP32-S3 驅動 800×480 彩色螢幕、觸控與 USB 手把，執行紅白機遊戲；原始碼和建置說明已公開。 | ESP32-S3 drives an 800×480 color display, touch input and USB controller to run NES games. Source code and build guides are public. | ESP32-S3 で 800×480 のカラー画面、タッチ入力、USB コントローラーを動かし、NES ゲームを実行。ソースとビルド手順を公開しています。
查看全部作品 | 查看全部作品 | View all projects | すべての作品を見る
快速入口 | 快速入口 | Quick links | クイックリンク
项目 · 代码 · 开源 | 專案 · 程式碼 · 開源 | Projects · Code · Open source | プロジェクト・コード・オープンソース
查看公开项目与代码仓库 | 查看公開專案與程式碼倉庫 | Browse public projects and repositories | 公開プロジェクトとリポジトリを見る
B站空间 | B站空間 | Bilibili channel | Bilibili チャンネル
视频 · 教程 · 分享 | 影片 · 教學 · 分享 | Videos · Tutorials · Stories | 動画・チュートリアル・共有
数码体验、教程与分享 | 數位體驗、教學與分享 | Gadget reviews and tutorials | ガジェット体験とチュートリアル
抖音主页 | 抖音主頁 | Douyin profile | Douyin プロフィール
随拍 · 旅行 · 日常 | 隨拍 · 旅行 · 日常 | Snapshots · Travel · Daily life | スナップ・旅行・日常
随拍、旅行与日常片段 | 隨拍、旅行與日常片段 | Snapshots, travel and daily clips | スナップ、旅行、日常の動画
GitHub 介绍 | GitHub 介紹 | About GitHub | GitHub について
B站介绍 | B站介紹 | About Bilibili | Bilibili について
抖音介绍 | 抖音介紹 | About Douyin | Douyin について
关闭 | 關閉 | Close | 閉じる
GitHub 链接二维码 | GitHub 連結 QR 碼 | QR code for GitHub | GitHub の QR コード
B站二维码 | B站 QR 碼 | QR code for Bilibili | Bilibili の QR コード
抖音二维码 | 抖音 QR 碼 | QR code for Douyin | Douyin の QR コード
手机访问个人页 | 手機瀏覽個人頁 | Open profile on phone | スマホでプロフィールを開く
个人页链接二维码 | 個人頁連結 QR 碼 | QR code for the profile | プロフィールの QR コード
博客导航 | 部落格導航 | Blog navigation | ブログのナビゲーション
内容 | 內容 | Posts | 投稿
最新发布 | 最新發布 | Latest post | 最新の投稿
搜索文章 | 搜尋文章 | Search posts | 投稿を検索
内容筛选 | 內容篩選 | Filter posts | 投稿を絞り込む
全部内容 | 全部內容 | All posts | すべての投稿
技术 | 技術 | Tech | 技術
视频 | 影片 | Videos | 動画
生活 | 生活 | Life | 日常
随笔标签 | 隨筆標籤 | Topics | トピック
AI 工具 | AI 工具 | AI tools | AI ツール
旅行 | 旅行 | Travel | 旅行
摄影 | 攝影 | Photography | 写真
数码 | 數位 | Gadgets | ガジェット
手机访问博客页 | 手機瀏覽部落格 | Open blog on phone | スマホでブログを開く
精选文章 | 精選文章 | Featured post | おすすめの投稿
最新内容 | 最新內容 | Latest posts | 最新の投稿
内容排序 | 內容排序 | Sort posts | 投稿の並び順
图文在前、视频在后；组内按时间从新到旧 | 圖文在前、影片在後；組內按時間從新到舊 | Articles first, then videos; newest first in each group | 記事、動画の順。それぞれ新しい順に表示
按发布时间从晚到早 | 按發布時間從晚到早 | Newest first | 新しい順
按发布时间从早到晚 | 按發布時間從早到晚 | Oldest first | 古い順
按浏览量从高到低 | 按瀏覽量從高到低 | Most viewed first | 閲覧数の多い順
内容列表 | 內容列表 | Post list | 投稿一覧
评论区 | 留言區 | Comments | コメント
留言交流 | 留言交流 | Discussion | コメント交流
欢迎留下想法，和大家聊聊技术与生活。 | 歡迎留下想法，和大家聊聊技術與生活。 | Share your thoughts on technology and everyday life. | 技術や日常について、気軽にコメントしてください。
关闭文章详情 | 關閉文章詳情 | Close post details | 投稿の詳細を閉じる
手机阅读二维码 | 手機閱讀 QR 碼 | Mobile reading QR code | スマホ閲覧用 QR コード
博客页链接二维码 | 部落格連結 QR 碼 | QR code for the blog | ブログの QR コード
我的 B 站主页 | 我的 B站主頁 | My Bilibili channel | Bilibili チャンネル
B 站最近 {0} 条视频 · 更新于 {1} | B站最近 {0} 部影片 · 更新於 {1} | Latest {0} Bilibili videos · Updated {1} | Bilibili の最新 {0} 本・更新 {1}
已核实 {0} 条 B 站视频 · 完整投稿请访问 | 已核實 {0} 部 B站影片 · 完整投稿請瀏覽 | {0} verified Bilibili videos · Full collection: | Bilibili 動画 {0} 本を確認・全動画はこちら：
把想法做成 | 把想法做成 | Turning ideas into  | アイデアを
可以体验的作品。 | 可以體驗的作品。 | things you can experience. | 体験できる作品へ。
查看 GitHub 全部仓库 | 查看 GitHub 全部倉庫 | Browse all GitHub repositories | GitHub の全リポジトリを見る
重点项目 | 重點專案 | Featured projects | 注目のプロジェクト
两种不同方向的 ESP32 实践 | 兩種不同方向的 ESP32 實作 | Two directions in ESP32 development | 2 つの方向の ESP32 開発
ESP32 · 车辆电子 | ESP32 · 車輛電子 | ESP32 · Vehicle electronics | ESP32・車載電子機器
ESP32 车辆仪表 | ESP32 車輛儀表 | ESP32 vehicle dashboard | ESP32 車載メーター
项目特点 | 專案特色 | Project features | プロジェクトの特徴
ST7789 屏幕 | ST7789 螢幕 | ST7789 display | ST7789 ディスプレイ
固件与接线文档 | 韌體與接線文件 | Firmware and wiring guides | ファームウェアと配線資料
公开固件、接线资料和用户文档；完整源码未公开。 | 公開韌體、接線資料和使用者文件；完整原始碼未公開。 | Firmware, wiring and user guides are public; full source code is not. | ファームウェア、配線、利用資料を公開。全ソースコードは非公開です。
查看 ESP32 车辆仪表仓库，新标签页打开 | 查看 ESP32 車輛儀表倉庫，在新分頁開啟 | Open ESP32 dashboard repository in a new tab | ESP32 メーターのリポジトリを新しいタブで開く
查看项目 | 查看專案 | View project | プロジェクトを見る
ESP32-S3 · 掌机固件 | ESP32-S3 · 掌機韌體 | ESP32-S3 · Handheld firmware | ESP32-S3・携帯機ファームウェア
GT911 触摸 | GT911 觸控 | GT911 touch input | GT911 タッチ入力
USB 手柄 | USB 手把 | USB controller | USB コントローラー
开源固件 | 開源韌體 | Open-source firmware | オープンソースのファームウェア
源码与构建说明已公开；仓库不包含商业游戏 ROM。 | 原始碼與建置說明已公開；倉庫不包含商業遊戲 ROM。 | Source and build guides are public; commercial game ROMs are not included. | ソースとビルド手順を公開。市販ゲームの ROM は含みません。
查看 NES 掌机仓库，新标签页打开 | 查看 NES 掌機倉庫，在新分頁開啟 | Open NES handheld repository in a new tab | NES 携帯機のリポジトリを新しいタブで開く
更多作品 | 更多作品 | More projects | その他の作品
手机、桌面与浏览器 | 手機、桌面與瀏覽器 | Mobile, desktop and browser | スマホ、デスクトップ、ブラウザー
投屏导航 SE | 投影導航 SE | Mirror Navigation SE | 画面転送ナビ SE
公开 APK 与使用说明 | 公開 APK 與使用說明 | Public APK and user guide | APK と利用手順を公開
公开源码与构建说明 | 公開原始碼與建置說明 | Public source and build guide | ソースとビルド手順を公開
公开源码与运行说明 | 公開原始碼與執行說明 | Public source and usage guide | ソースと実行手順を公開
手势粒子宇宙 | 手勢粒子宇宙 | Gesture Particle Universe | ジェスチャー・パーティクル宇宙
公开源码；运行时需联网加载依赖 | 公開原始碼；執行時需連網載入相依套件 | Public source; dependencies load online at runtime | ソースを公開。実行時に依存ライブラリの読み込みに通信が必要
本站项目 | 本站專案 | This website project | このサイトのプロジェクト
你正在浏览的个人网站 | 你正在瀏覽的個人網站 | The website you are browsing | 今見ている個人サイト
查看 hello-web 源码 | 查看 hello-web 原始碼 | View hello-web source | hello-web のソースを見る
网站导航列表 | 網站導航列表 | Website directory | リンク一覧
开发工具 | 開發工具 | Developer tools | 開発ツール
视频 / 社交 | 影片 / 社群 | Video / Social | 動画 / SNS
硬件性能天梯图 | 硬體效能排行榜 | Hardware rankings | ハードウェア性能ランキング
桌面 CPU 天梯图 | 桌上型 CPU 排行榜 | Desktop CPU rankings | デスクトップ CPU ランキング
桌面显卡天梯图 | 桌上型顯示卡排行榜 | Desktop GPU rankings | デスクトップ GPU ランキング
笔记本 CPU 天梯图 | 筆電 CPU 排行榜 | Laptop CPU rankings | ノート PC CPU ランキング
笔记本显卡天梯图 | 筆電顯示卡排行榜 | Laptop GPU rankings | ノート PC GPU ランキング
手机 / 平板 CPU 排行 | 手機 / 平板 CPU 排行 | Mobile / Tablet CPU rankings | スマホ / タブレット CPU ランキング
手机 / 平板 GPU 排行 | 手機 / 平板 GPU 排行 | Mobile / Tablet GPU rankings | スマホ / タブレット GPU ランキング
游戏 / 娱乐 | 遊戲 / 娛樂 | Games / Entertainment | ゲーム / エンタメ
下载 / 系统工具 | 下載 / 系統工具 | Downloads / System tools | ダウンロード / システムツール
图吧工具箱 | 圖吧工具箱 | Tuba Toolbox | Tuba Toolbox
Microsoft 官方镜像下载 | Microsoft 官方映像下載 | Microsoft official images | Microsoft 公式イメージ
NVIDIA 驱动下载 | NVIDIA 驅動程式下載 | NVIDIA drivers | NVIDIA ドライバー
Intel 驱动下载 | Intel 驅動程式下載 | Intel drivers | Intel ドライバー
AMD 驱动下载 | AMD 驅動程式下載 | AMD drivers | AMD ドライバー
公网 IP 检查 · 多来源 | 公開 IP 檢查 · 多來源 | Public IP · Multiple sources | グローバル IP・複数の情報源
查看各服务看到的出口 | 查看各服務看到的出口 | Compare the exits seen by each service | 各サービスが観測する出口を比較
检查公网 IP | 檢查公開 IP | Check public IP | グローバル IP を確認
正在分别查询国内来源和国际来源。 | 正在分別查詢國內來源和國際來源。 | Querying domestic and international sources. | 中国国内と海外の情報源を照会中。
各来源出口 IP 与归属地 | 各來源出口 IP 與所在地 | Exit IP and location by source | 情報源別の出口 IP と推定位置
CleanIP 纯净度详情 ↗ | CleanIP 純淨度詳情 ↗ | CleanIP reputation details ↗ | CleanIP 評価の詳細 ↗
FlowLoss 多地 IP / 网络检测 ↗ | FlowLoss 多地 IP / 網路檢測 ↗ | FlowLoss multi-region IP / Network tests ↗ | FlowLoss 各地の IP / ネットワーク検査 ↗
网络连接 · HTTP Ping | 網路連線 · HTTP Ping | Network · HTTP Ping | ネットワーク・HTTP Ping
常用网站延迟 | 常用網站延遲 | Website latency | サイトの応答時間
开始检测 | 開始檢測 | Start checks | 検査を開始
准备检测 8 个站点 | 準備檢測 8 個站點 | Ready to check 8 sites | 8 サイトの検査準備完了
各站点请求延迟 | 各站點請求延遲 | Request latency by site | サイト別の応答時間
IPv4 检测 | IPv4 檢測 | IPv4 check | IPv4 検査
IPv6 检测 | IPv6 檢測 | IPv6 check | IPv6 検査
检测中... | 檢測中... | Checking… | 検査中…
正在查询 IPv4 出口 | 正在查詢 IPv4 出口 | Looking up IPv4 exit | IPv4 出口を照会中
正在尝试 IPv6 连接 | 正在嘗試 IPv6 連線 | Trying IPv6 connectivity | IPv6 接続を確認中
重新检测 | 重新檢測 | Check again | 再検査
IPIP 城市天气 | IPIP 城市天氣 | City weather via IPIP | IPIP の都市情報による天気
等待 IPIP 城市检测 | 等待 IPIP 城市檢測 | Waiting for IPIP city lookup | IPIP の都市照会を待機中
浏览器直连 · 国际节点 | 瀏覽器直連 · 國際節點 | Browser connection · International servers | ブラウザー直接接続・海外サーバー
网络测速 | 網路測速 | Speed test | 通信速度テスト
开始测速 | 開始測速 | Start speed test | 速度テストを開始
测速节点 | 測速節點 | Test server | テストサーバー
日本东京 · A573 / LibreSpeed | 日本東京 · A573 / LibreSpeed | Tokyo, Japan · A573 / LibreSpeed | 日本・東京 · A573 / LibreSpeed
美国洛杉矶 · Clouvider / LibreSpeed | 美國洛杉磯 · Clouvider / LibreSpeed | Los Angeles, USA · Clouvider / LibreSpeed | 米国・ロサンゼルス · Clouvider / LibreSpeed
点击开始后测量延迟、下载与上传速度。 | 點擊開始後測量延遲、下載與上傳速度。 | Start to measure latency, download and upload speeds. | 開始すると応答時間、ダウンロード、アップロード速度を測定します。
下载 | 下載 | Download | ダウンロード
上传 | 上傳 | Upload | アップロード
延迟 / 抖动 | 延遲 / 抖動 | Latency / Jitter | 応答時間 / ジッター
测试流量 | 測試流量 | Test traffic | テスト通信量
MiB · 有效载荷 | MiB · 有效負載 | MiB · Payload | MiB・ペイロード
当前阶段速度曲线 | 目前階段速度曲線 | Current phase speed chart | 現在の段階の速度グラフ
本机 ICMP · Windows tracert | 本機 ICMP · Windows tracert | Local ICMP · Windows tracert | ローカル ICMP・Windows tracert
路由追踪与地图 | 路由追蹤與地圖 | Traceroute and map | 経路追跡と地図
开始追踪 | 開始追蹤 | Start trace | 経路追跡を開始
8 个预设网站 | 8 個預設網站 | 8 preset websites | 8 つのプリセットサイト
网站或 IP | 網站或 IP | Hostname or IP | ホスト名または IP
协议 | 協定 | Protocol | プロトコル
自动 | 自動 | Auto | 自動
正在检查本地助手… | 正在檢查本機助手… | Checking local helper… | ローカルヘルパーを確認中…
首次使用：下载免安装路由助手 | 首次使用：下載免安裝路由助手 | First use: download the portable route helper | 初回：ポータブル経路ヘルパーをダウンロード
下载路由助手 · Windows 免安装 | 下載路由助手 · Windows 免安裝 | Download route helper · Portable Windows app | 経路ヘルパーをダウンロード・Windows 用
你正在使用免安装路由助手 | 你正在使用免安裝路由助手 | You are using the portable route helper | ポータブル経路ヘルパーを使用中
助手已启动？打开追踪面板 ↗ | 助手已啟動？開啟追蹤面板 ↗ | Helper running? Open trace panel ↗ | 起動済み？経路パネルを開く ↗
检查本地连接 | 檢查本機連線 | Check local connection | ローカル接続を確認
退出本地助手 | 結束本機助手 | Exit local helper | ローカルヘルパーを終了
跳点 IP 估算位置地图 | 跳點 IP 估算位置地圖 | Estimated hop IP locations | 中継 IP の推定位置地図
跳数 | 跳數 | Hop | ホップ
三次响应时间 | 三次回應時間 | Three response times | 3 回の応答時間
归属地 / 网络 | 所在地 / 網路 | Location / Network | 推定位置 / ネットワーク
等待开始追踪 | 等待開始追蹤 | Waiting to start trace | 経路追跡の開始を待機中
开始追踪后显示跳点地图 | 開始追蹤後顯示跳點地圖 | Hop map appears after starting a trace | 経路追跡を開始すると地図を表示
音乐播放器 · Lo-fi 歌单 | 音樂播放器 · Lo-fi 播放清單 | Music player · Lo-fi playlist | 音楽プレーヤー・Lo-fi プレイリスト
正在准备曲目... | 正在準備曲目... | Preparing tracks… | 曲を準備中…
尝试自动播放中... | 嘗試自動播放中... | Trying autoplay… | 自動再生を試行中…
曲目 | 曲目 | Track | 曲
选择音乐曲目 | 選擇音樂曲目 | Choose a track | 曲を選択
上一首 | 上一首 | Previous track | 前の曲
播放 | 播放 | Play | 再生
下一首 | 下一首 | Next track | 次の曲
音乐： | 音樂： | Music: | 音楽：
FMA 曲目页 | FMA 曲目頁 | FMA track page | FMA の曲ページ
授权条款 | 授權條款 | License terms | ライセンス
服务器启动日志 | 伺服器啟動日誌 | Server boot log | サーバー起動ログ
小游戏列表 | 小遊戲列表 | Game list | ゲーム一覧
贪吃蛇 | 貪食蛇 | Snake | スネーク
俄罗斯方块 | 俄羅斯方塊 | Tetris | テトリス
扫雷 | 踩地雷 | Minesweeper | マインスイーパー
五子棋 | 五子棋 | Gomoku | 五目並べ
华容道 | 華容道 | Sliding puzzle | スライドパズル
方向键或下方按键控制，空格开始/暂停。 | 方向鍵或下方按鍵控制，空白鍵開始/暫停。 | Use arrow keys or the controls below. Space starts or pauses. | 矢印キーか下のボタンで操作。スペースで開始・一時停止。
得分 | 得分 | Score | スコア
游戏结束 | 遊戲結束 | Game over | ゲームオーバー
重新开始 | 重新開始 | Restart | 最初から
开始游戏 | 開始遊戲 | Start game | ゲーム開始
继续游戏 | 繼續遊戲 | Resume game | ゲーム再開
方向键、下方按键或滑动棋盘合并数字。 | 方向鍵、下方按鍵或滑動棋盤合併數字。 | Merge numbers with arrow keys, controls or a swipe. | 矢印キー、ボタン、スワイプで数字を合体。
2048 棋盘，使用方向键或滑动移动 | 2048 棋盤，使用方向鍵或滑動移動 | 2048 board. Use arrow keys or swipe to move | 2048 の盤面。矢印キーまたはスワイプで移動
← → 移动，↑ 旋转，↓ 加速。 | ← → 移動，↑ 旋轉，↓ 加速。 | ← → move, ↑ rotate, ↓ drop faster. | ← → 移動、↑ 回転、↓ 落下を加速。
下一个俄罗斯方块 | 下一個俄羅斯方塊 | Next Tetris piece | 次のテトリスブロック
下一个 | 下一個 | Next | 次
点击翻开；长按、右键或开启标记模式插旗。 | 點擊翻開；長按、右鍵或開啟標記模式插旗。 | Click to reveal; long-press, right-click or use flag mode to flag. | クリックで開く。長押し、右クリック、旗モードで旗を置く。
剩余标记 | 剩餘標記 | Flags left | 残りの旗
标记模式：关 | 標記模式：關 | Flag mode: Off | 旗モード：オフ
标记模式：开 | 標記模式：開 | Flag mode: On | 旗モード：オン
空格、点击画面或“起飞”按钮让小鸟上升。 | 空白鍵、點擊畫面或「起飛」按鈕讓小鳥上升。 | Press Space, tap the canvas or use “Flap” to fly up. | スペース、画面タップ、「飛ぶ」で鳥を上昇。
暂停 | 暫停 | Pause | 一時停止
点击落子；聚焦棋盘后方向键选位，回车落子。 | 點擊落子；聚焦棋盤後方向鍵選位，Enter 落子。 | Click to place a stone; focus the board, use arrows and Enter. | クリックで石を置く。盤面にフォーカスし、矢印で選んで Enter。
黑棋先手 | 黑棋先手 | Black plays first | 黒が先手
人人对局 | 雙人對局 | Two players | 2 人対戦
人机对局 | 人機對局 | Play computer | コンピューター対戦
点击空位旁数字，或滑动/方向键移动数字。 | 點擊空位旁數字，或滑動/方向鍵移動數字。 | Click a number next to the gap, swipe or use arrow keys. | 空きマスの隣の数字をクリック。スワイプや矢印キーでも移動。
步数 | 步數 | Moves | 手数
你赢了！ | 你贏了！ | You won! | 勝ちました！
手机游戏控制 | 手機遊戲控制 | Mobile game controls | スマホゲーム操作
向上 | 向上 | Up | 上
向左 | 向左 | Left | 左
开始 | 開始 | Start | 開始
向右 | 向右 | Right | 右
向下 | 向下 | Down | 下
起飞 | 起飛 | Flap | 飛ぶ
继续 | 繼續 | Resume | 再開
旋转 | 旋轉 | Rotate | 回転
落子 | 落子 | Place stone | 石を置く
开始游戏：方向键或按下开始 | 開始遊戲：方向鍵或按下開始 | Use arrow keys or Start to begin | 矢印キーか開始ボタンで始める
游戏结束，点击重新开始 | 遊戲結束，點擊重新開始 | Game over. Click Restart | ゲームオーバー。「最初から」をクリック
达到 2048！你可以继续游戏 | 達到 2048！你可以繼續遊戲 | Reached 2048! You can keep playing | 2048 達成！続けてプレイできます
游戏结束：没有可用移动 | 遊戲結束：沒有可用移動 | Game over: no moves left | ゲームオーバー：移動できません
游戏结束：踩到地雷 | 遊戲結束：踩到地雷 | Game over: hit a mine | ゲームオーバー：地雷を踏みました
黑棋 | 黑棋 | Black stone | 黒石
白棋 | 白棋 | White stone | 白石
空位 | 空位 | Empty | 空きマス
未翻开 | 未翻開 | Hidden | 未開封
已标记 | 已標記 | Flagged | 旗あり
地雷 | 地雷 | Mine | 地雷
空白 | 空白 | Blank | 空白
数字 {0} | 數字 {0} | Number {0} | 数字 {0}
周围 {0} 个地雷 | 周圍 {0} 個地雷 | {0} adjacent mines | 周囲に地雷 {0} 個
第 {0} 行第 {1} 列，{2} | 第 {0} 行第 {1} 列，{2} | Row {0}, column {1}, {2} | {0} 行 {1} 列、{2}
五子棋棋盘，第 {0} 行第 {1} 列，{2}。方向键选择，回车或空格落子 | 五子棋棋盤，第 {0} 行第 {1} 列，{2}。方向鍵選擇，Enter 或空白鍵落子 | Gomoku board, row {0}, column {1}, {2}. Use arrows to select, Enter or Space to place | 五目並べ、{0} 行 {1} 列、{2}。矢印で選び、Enter またはスペースで石を置く
人机对局：你执黑 | 人機對局：你執黑 | Computer game: you are black | コンピューター対戦：あなたは黒
人人对局：黑棋先手 | 雙人對局：黑棋先手 | Two players: black starts | 2 人対戦：黒が先手
黑棋胜利 | 黑棋勝利 | Black wins | 黒の勝ち
白棋胜利 | 白棋勝利 | White wins | 白の勝ち
和棋 | 和棋 | Draw | 引き分け
返回状态面板 | 返回狀態面板 | Back to status | ステータスに戻る
终端命令 | 終端命令 | Terminal command | ターミナルコマンド
国内 | 國內 | China | 中国国内
国际 | 國際 | International | 海外
国内来源 | 國內來源 | China source | 中国国内の情報源
国际来源 | 國際來源 | International source | 海外の情報源
抖音 / ByteDance | 抖音 / ByteDance | Douyin / ByteDance | Douyin / ByteDance
微信 | 微信 | WeChat | WeChat
淘宝 | 淘寶 | Taobao | Taobao
待检测 | 待檢測 | Pending | 待機中
尚无记录 | 尚無紀錄 | No samples yet | 記録なし
无记录 | 無紀錄 | No samples | 記録なし
超时 | 逾時 | Timeout | タイムアウト
请求失败 | 請求失敗 | Request failed | リクエスト失敗
查询中... | 查詢中... | Looking up… | 照会中…
未知 | 未知 | Unknown | 不明
查询失败 | 查詢失敗 | Lookup failed | 照会失敗
数据库归属地：{0} | 資料庫所在地：{0} | Database location: {0} | データベースの推定位置：{0}
接入机房 {0}（不是出口城市） | 接入機房 {0}（不是出口城市） | Edge location {0} (not the exit city) | 接続拠点 {0}（出口の都市とは異なります）
最近 {0} 次请求：{1} | 最近 {0} 次請求：{1} | Last {0} requests: {1} | 直近 {0} 回のリクエスト：{1}
已完成 {0} / 8 个站点 · {1} / 96 次请求 | 已完成 {0} / 8 個站點 · {1} / 96 次請求 | Completed {0} / 8 sites · {1} / 96 requests | 完了 {0} / 8 サイト・{1} / 96 リクエスト
浏览器报告离线，等待网络恢复后继续 | 瀏覽器回報離線，等待網路恢復後繼續 | Browser is offline; waiting to reconnect | オフラインです。接続の回復を待機中
检测完成 · 8 个站点各完成 12 次请求，已自动停止 | 檢測完成 · 8 個站點各完成 12 次請求，已自動停止 | Complete: 12 requests per site across 8 sites; checks stopped | 完了：8 サイト各 12 回の検査後、自動停止
暂停检测 | 暫停檢測 | Pause checks | 検査を一時停止
继续检测 | 繼續檢測 | Resume checks | 検査を再開
检测已暂停，保留最近的真实请求记录 | 檢測已暫停，保留最近的實際請求紀錄 | Checks paused; recent measured samples retained | 検査を一時停止。直近の実測記録を保持
服务超时、受限或不可访问，可稍后重试 | 服務逾時、受限或無法存取，可稍後重試 | Service timed out, restricted or unreachable. Try again later | サービスがタイムアウト、制限、または接続不可。後で再試行してください
IPIP 查询失败，无法获取城市天气 | IPIP 查詢失敗，無法取得城市天氣 | IPIP lookup failed; city weather unavailable | IPIP の照会に失敗。都市の天気を取得できません
正在查询 IPIP 城市... | 正在查詢 IPIP 城市... | Looking up city via IPIP… | IPIP で都市を照会中…
正在分别查询 4 家服务的出口信息... | 正在分別查詢 4 家服務的出口資訊... | Looking up exit information from 4 services… | 4 サービスの出口情報を照会中…
所有来源均未返回有效结果，请稍后重试或打开下方检测站点 | 所有來源均未回傳有效結果，請稍後重試或開啟下方檢測站點 | No valid results. Retry later or use the test sites below | 有効な結果がありません。後で再試行するか、下の検査サイトを利用してください
{0} / 4 个来源完成 | {0} / 4 個來源完成 | {0} / 4 sources complete | {0} / 4 情報源が完了
发现 {0} 个出口 IP，可能存在 VPN 分流或出口变化 | 發現 {0} 個出口 IP，可能存在 VPN 分流或出口變化 | Found {0} exit IPs; VPN routing or exit changes may apply | 出口 IP を {0} 個検出。VPN の分岐や出口変更の可能性
这些服务看到相同出口 IP | 這些服務看到相同出口 IP | These services see the same exit IP | 各サービスは同じ出口 IP を観測
同一 IP 的国家归属地存在数据库分歧 | 同一 IP 的國家所在地存在資料庫差異 | Databases disagree on the country of the same IP | 同じ IP の国についてデータベース間に相違があります
测速期间暂停网站延迟检测 | 測速期間暫停網站延遲檢測 | Website checks paused during speed test | 速度テスト中はサイトの応答時間検査を一時停止
页面在后台，连续检测已暂停 | 頁面在背景，連續檢測已暫停 | Page is in background; continuous checks paused | バックグラウンドのため連続検査を一時停止
浏览器报告离线 | 瀏覽器回報離線 | Browser is offline | ブラウザーはオフラインです
未检出 | 未檢出 | Not detected | 未検出
正在尝试 IPv{0} 专用查询服务 | 正在嘗試 IPv{0} 專用查詢服務 | Trying IPv{0}-specific services | IPv{0} 専用サービスを照会中
IPIP 看到的 IPv4 出口 | IPIP 看到的 IPv4 出口 | IPv4 exit observed by IPIP | IPIP が観測した IPv4 出口
IPv{0} 访问成功 · 来源：{1} | IPv{0} 存取成功 · 來源：{1} | IPv{0} reachable · Source: {1} | IPv{0} 接続成功・情報源：{1}
IPv6 查询未成功：可能未启用、VPN 未转发，或查询服务不可达。 | IPv6 查詢未成功：可能未啟用、VPN 未轉送，或查詢服務無法連線。 | IPv6 lookup failed: it may be disabled, not forwarded by the VPN, or the service is unreachable. | IPv6 の照会に失敗。未有効、VPN の転送対象外、またはサービス接続不可の可能性。
IPv4 查询服务未成功响应，请检查网络或重试。 | IPv4 查詢服務未成功回應，請檢查網路或重試。 | IPv4 services did not respond. Check your connection or retry. | IPv4 サービスが応答しません。接続を確認するか再試行してください。
IPIP 未返回城市，无法获取天气 | IPIP 未回傳城市，無法取得天氣 | IPIP returned no city; weather unavailable | IPIP が都市を返さないため、天気を取得できません
{0}实时天气 | {0}即時天氣 | Live weather in {0} | {0}の現在の天気
加载城市天气... | 載入城市天氣... | Loading city weather… | 都市の天気を読み込み中…
城市来源：IPIP | 城市來源：IPIP | City source: IPIP | 都市の情報源：IPIP
湿度 {0}% · 风速 {1} km/h · 城市：IPIP / 天气：Open-Meteo | 濕度 {0}% · 風速 {1} km/h · 城市：IPIP / 天氣：Open-Meteo | Humidity {0}% · Wind {1} km/h · City: IPIP / Weather: Open-Meteo | 湿度 {0}%・風速 {1} km/h・都市：IPIP / 天気：Open-Meteo
获取失败 | 取得失敗 | Unavailable | 取得失敗
可重新检测公网 IP 后重试天气查询 | 可重新檢測公開 IP 後重試天氣查詢 | Check public IP again to retry weather lookup | グローバル IP を再検査すると天気を再照会できます
城市定位或天气服务未成功响应 | 城市定位或天氣服務未成功回應 | City lookup or weather service did not respond | 都市照会または天気サービスが応答しません
晴朗 | 晴朗 | Clear | 晴れ
多云 | 多雲 | Cloudy | 曇り
雾 / 小雨 | 霧 / 小雨 | Fog / Light rain | 霧 / 小雨
降雨 | 降雨 | Rain | 雨
阵雨 | 陣雨 | Showers | にわか雨
正在加载音乐... | 正在載入音樂... | Loading music… | 音楽を読み込み中…
浏览器已拦截自动播放，点击播放 | 瀏覽器已阻擋自動播放，請點擊播放 | Autoplay blocked. Click Play | 自動再生が制限されています。「再生」を押してください
音频加载失败，请换一首或稍后重试 | 音訊載入失敗，請換一首或稍後重試 | Audio unavailable. Choose another track or retry later | 音声を読み込めません。別の曲を選ぶか後で再試行してください
点击播放 | 點擊播放 | Click Play | 再生をクリック
正在播放：{0} | 正在播放：{0} | Playing: {0} | 再生中：{0}
已暂停 | 已暫停 | Paused | 一時停止中
停止测速 | 停止測速 | Stop speed test | 速度テストを停止
正在测量节点 HTTP 延迟… | 正在測量節點 HTTP 延遲… | Measuring server HTTP latency… | サーバーの HTTP 応答時間を測定中…
正在下载测试数据（最多 8 秒 / 64 MiB）… | 正在下載測試資料（最多 8 秒 / 64 MiB）… | Download test (up to 8 seconds / 64 MiB)… | ダウンロード測定中（最大 8 秒 / 64 MiB）…
正在上传测试数据（最多 8 秒 / 16 MiB）… | 正在上傳測試資料（最多 8 秒 / 16 MiB）… | Upload test (up to 8 seconds / 16 MiB)… | アップロード測定中（最大 8 秒 / 16 MiB）…
测速完成 | 測速完成 | Speed test complete | 速度テスト完了
达到流量上限，样本不足 2 秒，结果仅供参考 | 達到流量上限，樣本不足 2 秒，結果僅供參考 | Traffic limit reached; sample under 2 seconds, indicative result only | 通信量上限に到達。2 秒未満の参考結果です
部分请求失败，结果可能偏低 | 部分請求失敗，結果可能偏低 | Some requests failed; result may be low | 一部の通信に失敗。結果が低くなる可能性
测速已停止，保留已完成阶段的结果。 | 測速已停止，保留已完成階段的結果。 | Test stopped; completed phase results retained. | テストを停止。完了した段階の結果を保持。
测速失败：{0}。可切换国际节点重试。 | 測速失敗：{0}。可切換國際節點重試。 | Speed test failed: {0}. Try another server. | 速度テスト失敗：{0}。別のサーバーで再試行してください。
测速已停止 | 測速已停止 | Speed test stopped | 速度テストを停止しました
节点响应 {0} | 節點回應 {0} | Server response {0} | サーバーの応答 {0}
上传响应 {0} | 上傳回應 {0} | Upload response {0} | アップロードの応答 {0}
下载响应 {0} | 下載回應 {0} | Download response {0} | ダウンロードの応答 {0}
上传未完成 | 上傳未完成 | Upload incomplete | アップロード未完了
已停止 | 已停止 | Stopped | 停止済み
{0}未成功，请更换节点或重试 | {0}未成功，請更換節點或重試 | {0} failed. Change server or retry | {0}失敗。サーバーを変更するか再試行してください
无法读取下载清单 | 無法讀取下載清單 | Cannot read download manifest | ダウンロード一覧を読み込めません
下载清单缺少文件分片 | 下載清單缺少檔案分片 | Download manifest has no file parts | ダウンロード一覧に分割ファイルがありません
正在下载 {0}/{1}… | 正在下載 {0}/{1}… | Downloading {0}/{1}… | ダウンロード中 {0}/{1}…
第 {0} 段下载失败 | 第 {0} 段下載失敗 | Part {0} download failed | 分割ファイル {0} のダウンロード失敗
第 {0} 段大小不符 | 第 {0} 段大小不符 | Part {0} size mismatch | 分割ファイル {0} のサイズ不一致
正在校验文件… | 正在驗證檔案… | Verifying file… | ファイルを検証中…
文件总大小不符 | 檔案總大小不符 | Total file size mismatch | ファイルの合計サイズ不一致
SHA256 校验失败 | SHA256 驗證失敗 | SHA256 verification failed | SHA256 検証失敗
下载完成，双击运行助手 | 下載完成，按兩下執行助手 | Download complete. Double-click to run the helper | ダウンロード完了。ダブルクリックでヘルパーを起動
下载失败：{0}，点击重试 | 下載失敗：{0}，點擊重試 | Download failed: {0}. Click to retry | ダウンロード失敗：{0}。クリックして再試行
最新项目页面（刷新即可同步修改） | 最新專案頁面（重新整理即可同步修改） | Current project page (refresh to update) | 最新のプロジェクトページ（再読み込みで更新）
程序内置页面快照（更新页面需下载新版助手） | 程式內建頁面快照（更新頁面需下載新版助手） | Bundled page snapshot (download a newer helper to update) | 内蔵ページのスナップショット（更新には新しいヘルパーが必要）
本地助手已连接 | 本機助手已連線 | Local helper connected | ローカルヘルパーに接続済み
可追踪 8 个预设网站或自定义地址 | 可追蹤 8 個預設網站或自訂位址 | Trace 8 preset sites or a custom address | 8 サイトまたは任意のアドレスを追跡できます
首次使用：下载并运行免安装助手，即可在自动打开的面板里追踪本机路由。 | 首次使用：下載並執行免安裝助手，即可在自動開啟的面板追蹤本機路由。 | Download and run the portable helper; trace local routes in the panel it opens. | ポータブルヘルパーをダウンロードして起動。自動で開くパネルで経路を追跡できます。
正在查询归属地… | 正在查詢所在地… | Looking up location… | 推定位置を照会中…
未收到跳点 IP | 未收到跳點 IP | No hop IP received | 中継 IP の応答なし
第 {0} 跳 | 第 {0} 跳 | Hop {0} | ホップ {0}
地图 ↗ | 地圖 ↗ | Map ↗ | 地図 ↗
正在解析目标并等待跳点… | 正在解析目標並等待跳點… | Resolving target and waiting for hops… | 宛先の名前解決と中継の応答を待機中…
追踪中 | 追蹤中 | Tracing | 追跡中
正在补全 IP 归属地 | 正在補全 IP 所在地 | Looking up hop locations | 中継 IP の推定位置を照会中
追踪完成 | 追蹤完成 | Trace complete | 追跡完了
部分结果 | 部分結果 | Partial results | 部分的な結果
追踪失败 | 追蹤失敗 | Trace failed | 追跡失敗
{0} 跳 | {0} 跳 | {0} hops | {0} ホップ
停止追踪 | 停止追蹤 | Stop trace | 追跡を停止
读取结果失败：{0}。任务可能仍在本机执行，请重连助手。 | 讀取結果失敗：{0}。工作可能仍在本機執行，請重新連線助手。 | Cannot read results: {0}. The local task may still be running; reconnect the helper. | 結果の取得失敗：{0}。処理が継続中の可能性があります。ヘルパーに再接続してください。
停止失败：{0} | 停止失敗：{0} | Cannot stop: {0} | 停止失敗：{0}
无法开始追踪：{0} | 無法開始追蹤：{0} | Cannot start trace: {0} | 追跡開始失敗：{0}
本地助手已退出。需要追踪时重新运行下载的程序即可。 | 本機助手已結束。需要追蹤時重新執行下載的程式即可。 | Local helper exited. Run the downloaded app again when needed. | ローカルヘルパーを終了。必要なときに再起動してください。
退出失败：{0} | 結束失敗：{0} | Cannot exit: {0} | 終了失敗：{0}
`;

const siteInterfaceCopy = new Map();
const siteInterfacePatterns = [];
function registerInterfaceCopy(source, values, preserveCaptures = false) {
    if (values.length !== 4) throw new Error(`Invalid interface translation row: ${source}`);
    siteInterfaceCopy.set(source, values);
    if (/\{\d+\}/.test(source)) {
        const keys = [];
        const escaped = source.split(/(\{\d+\})/).map(part => {
            if (/^\{\d+\}$/.test(part)) { keys.push(part); return "(.+?)"; }
            return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }).join("");
        siteInterfacePatterns.push({ regex: new RegExp(`^${escaped}$`, "u"), keys, values, preserveCaptures });
    }
}
for (const row of interfaceCopyRows.trim().split("\n")) {
    const values = row.trim().split(" | ");
    registerInterfaceCopy(values[0], values, ["数据库归属地：{0}", "{0}实时天气"].includes(values[0]));
}
// Simulator explanations are translated; commands and machine identifiers stay literal.
for (const [source, values] of [
    ["WELCOME TO MY DIGITAL SPACE", ["欢迎来到我的数字空间", "歡迎來到我的數位空間", "WELCOME TO MY DIGITAL SPACE", "私のデジタル空間へようこそ"]],
    ["SELECT A DESTINATION", ["选择一个入口", "選擇一個入口", "SELECT A DESTINATION", "行き先を選んでください"]],
    ["VIEW ALL", ["全部内容", "全部內容", "VIEW ALL", "すべての投稿"]],
    ["Type help to list commands.", ["输入 help 查看命令。", "輸入 help 查看指令。", "Type help to list commands.", "help を入力するとコマンド一覧を表示します。"]],
    ["hello-web: a static personal site with simulated live widgets.", ["hello-web：静态个人网站，终端中的状态为模拟数据。", "hello-web：靜態個人網站，終端中的狀態為模擬資料。", "hello-web: a static personal site with simulated live widgets.", "hello-web：静的な個人サイト。ターミナルの状態は模擬データです。"]],
    ["Tokyo: realtime widget available on dashboard; fallback 24°C cloudy.", ["东京：状态面板提供天气组件；此处模拟值为 24°C，多云。", "東京：狀態面板提供天氣元件；此處模擬值為 24°C，多雲。", "Tokyo: realtime widget available on dashboard; fallback 24°C cloudy.", "東京：ステータス画面に天気を表示。ここでは模擬値 24°C、曇りです。"]],
    ["2026-05-18 dashboard/terminal/ssh widgets added.", ["2026-05-18：加入状态面板、终端与 SSH 模拟组件。", "2026-05-18：加入狀態面板、終端與 SSH 模擬元件。", "2026-05-18 dashboard/terminal/ssh widgets added.", "2026-05-18：ステータス、ターミナル、SSH の模擬機能を追加。"]],
    ["{0}: {1}: command not found", ["{0}：{1}：未找到命令", "{0}：{1}：找不到指令", "{0}: {1}: command not found", "{0}：{1}：コマンドが見つかりません"]]
]) registerInterfaceCopy(source, values, true);

function interfaceText(source, lang = getStoredLang(), depth = 0) {
    const index = { "zh-CN": 0, "zh-TW": 1, en: 2, ja: 3 }[lang] ?? 0;
    if (depth > 5) return source;
    const direct = siteInterfaceCopy.get(source);
    if (direct) return direct[index];
    for (const pattern of siteInterfacePatterns) {
        const match = source.match(pattern.regex);
        if (match) {
            // Captured hostnames, location names and commands are preserved. Only
            // explicitly listed UI fragments within a capture can be translated.
            const captures = Object.fromEntries(pattern.keys.map((key, i) => [key, pattern.preserveCaptures ? match[i + 1] : interfaceText(match[i + 1], lang, depth + 1)]));
            return pattern.values[index].replace(/\{\d+\}/g, key => captures[key]);
        }
    }
    // Composite diagnostics retain each measured value and translate their UI segments.
    if (source.includes(" · ") || source.includes("、")) {
        return source.split(/( · |、)/).map(part => part === "、" ? (lang === "en" ? ", " : "、") : interfaceText(part, lang, depth + 1)).join("");
    }
    return source;
}

function setupInterfaceLocalization() {
    const textSources = new WeakMap();
    const attributeSources = new WeakMap();
    // Explicit exclusions protect editorial copy, language names and typed commands.
    const excluded = 'script, style, .lang-panel, [data-original-content], [contenteditable]';
    function translateText(node) {
        if (!node.parentElement || node.parentElement.closest(`${excluded}, [data-i18n]`)) return;
        const current = node.nodeValue;
        const old = textSources.get(node);
        const source = old && current === old.rendered ? old.source : current;
        const value = source.trim();
        if (!value) return;
        const rendered = source.replace(value, () => interfaceText(value));
        textSources.set(node, { source, rendered });
        if (rendered !== current) node.nodeValue = rendered;
    }
    function translateAttributes(node) {
        if (node.closest(excluded)) return;
        const saved = attributeSources.get(node) || {};
        for (const name of ["aria-label", "title", "alt", "placeholder"]) {
            if (name === "aria-label" && (node.hasAttribute("data-i18n-aria") || node.id === "themeToggle" || node.id === "langToggle")) continue;
            if (name === "placeholder" && node.hasAttribute("data-i18n-placeholder")) continue;
            const current = node.getAttribute(name);
            if (current === null) continue;
            const source = saved[name] && current === saved[name].rendered ? saved[name].source : current;
            const rendered = interfaceText(source);
            saved[name] = { source, rendered };
            if (current !== rendered) node.setAttribute(name, rendered);
        }
        attributeSources.set(node, saved);
    }
    function translateTree(root) {
        if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
        if (root.nodeType !== Node.ELEMENT_NODE || root.closest(excluded)) return;
        translateAttributes(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.TEXT_NODE) translateText(node);
            else translateAttributes(node);
        }
    }
    const originalTitle = document.title;
    function refresh() {
        document.title = interfaceText(originalTitle);
        translateTree(document.body);
        const map = document.getElementById("routeMap");
        if (map) map.dataset.emptyLabel = interfaceText("开始追踪后显示跳点地图");
    }
    // Only changed subtrees are visited; language changes never reconstruct game,
    // media or network state. Cache comparisons stop our own mutations looping.
    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === "characterData") translateText(record.target);
            else if (record.type === "attributes") translateAttributes(record.target);
            else for (const node of record.addedNodes) translateTree(node);
        }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "title", "alt", "placeholder"] });
    return refresh;
}
