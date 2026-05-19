# 开发者文档

本文档面向 `@caijinglong/pdf-compress` 的维护者，说明本地开发、发版前检查、npm Trusted Publishing 配置和 GitHub Release 发布流程。

## 项目结构

- `src/`: 核心源码
- `examples/`: 浏览器示例页面
- `assets/samples/`: 公开样例 PDF 与来源说明
- `scripts/`: 构建辅助脚本
- `tests/`: 单元、集成和 smoke 测试
- `.github/workflows/`: CI 与发布流程

## 本地开发

安装依赖：

```bash
/Users/cai/.bun/bin/bun install
```

本地构建：

```bash
/Users/cai/.bun/bin/bun run build
```

运行测试：

```bash
/Users/cai/.bun/bin/bun test
```

类型检查：

```bash
/Users/cai/.bun/bin/bun run typecheck
```

本地示例预览：

```bash
/Users/cai/.bun/bin/bun run serve
```

## 发版前检查

发版前至少确认以下事项：

1. `package.json.version` 已更新到目标版本。
2. `README.md`、`README.zh-CN.md` 和开发者文档与当前实现一致。
3. `bun run build`、`bun test`、`bun run typecheck` 全部通过。
4. 如果本次修改影响发布流程，确认 `.github/workflows/release.yml` 已同步更新。

## 发布约束

以下约束必须满足，否则自动发布会失败：

- npm 侧必须先为当前包配置 Trusted Publisher。
- 绑定目标必须是当前 GitHub 仓库和 `.github/workflows/release.yml`。
- 当前发布流程只支持 GitHub-hosted runner。
- workflow 必须具备 `id-token: write` 权限。
- 发布入口只认 GitHub Release 的 `published` 事件。
- `package.json.version` 必须与 Release tag 一致。

如果 Trusted Publisher 尚未绑定，GitHub Actions 会在 `npm publish` 阶段失败。这是发布配置问题，不是代码问题。

当前仓库已经手动完成首个版本 `0.1.0` 的发布，后续版本建议全部走 Trusted Publishing 自动发布。

## 手工配置 Trusted Publisher

这部分不能仅靠仓库文件自动完成，必须由维护者手工操作：

1. 登录 npm。
2. 打开 `@caijinglong/pdf-compress` 对应包的设置页。
3. 进入 Trusted Publisher 配置页面。
4. 新增一个 Trusted Publisher。
5. 绑定当前 GitHub 仓库。
6. 指定 workflow 文件为 `.github/workflows/release.yml`。
7. 保存配置。

建议在首次启用后立即做一次测试发布，确认 OIDC 链路可用。

## 首次发布说明

`@caijinglong/pdf-compress@0.1.0` 已经通过手动方式发布到 npm 官方源。

如果未来你在其他仓库复用这套流程，需要注意：

1. 一个尚未在 npm 上存在的新包，通常不能直接依赖 Trusted Publishing 完成首发。
2. 首次发布通常仍需要手动执行一次：

```bash
npm_config_registry=https://registry.npmjs.org /opt/homebrew/bin/npm publish --access public
```

3. 如果本机默认 registry 指向镜像站，首次手动发布时应显式指定 npm 官方源。
4. 包创建成功后，再到 npm 后台配置 Trusted Publisher，后续版本即可切换到 GitHub Release 自动发布。

## GitHub Release 自动发布流程

当前自动发布流程由 `.github/workflows/release.yml` 负责，触发条件是 GitHub Release 被发布。

自动流程会执行：

1. checkout 仓库
2. 安装 Bun
3. 安装 Node.js 22
4. `bun install --frozen-lockfile`
5. `bun run build`
6. `bun test`
7. `bun run typecheck`
8. 校验 Release tag 与 `package.json.version` 一致
9. `npm publish --access public`

## 推荐发版步骤

1. 更新 `package.json.version`
2. 运行本地构建、测试和类型检查
3. 提交代码并推送到 GitHub
4. 在 GitHub 创建对应版本的 Release，例如 `v0.1.1`
5. 点击发布 Release
6. 等待 GitHub Actions 自动完成 npm 发布

## 常见失败与排查

### Trusted Publisher 未绑定

表现：

- `npm publish` 认证失败
- workflow 前面的构建和测试都通过，但发布失败

处理：

- 回到 npm 后台检查 Trusted Publisher 是否已配置
- 确认仓库名和 workflow 文件路径完全匹配

### Release tag 与版本不一致

表现：

- workflow 在版本校验步骤失败

处理：

- 检查 `package.json.version`
- 检查 Release tag 是否形如 `v0.1.1`
- 修正后重新创建或重新发布 Release

### 构建、测试或类型检查失败

表现：

- 发布在 `npm publish` 前中断

处理：

- 本地先重跑：

```bash
/Users/cai/.bun/bin/bun run build
/Users/cai/.bun/bin/bun test
/Users/cai/.bun/bin/bun run typecheck
```

- 修复问题后再重新发 Release

### npm 版本已存在

表现：

- `npm publish` 提示该版本已存在

处理：

- 升级 `package.json.version`
- 重新创建新的 Release
