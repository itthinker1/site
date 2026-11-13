# NocoBase AI 员工批量数据录入方案

> 适用版本：NocoBase 2.2.41（`@nocobase/app`）。基于 2026-11 在 `app1` 环境的实施与验证整理。
> 阅读顺序：第 1–3 章讲业务背景、总体思路与选型；第 4 章起是实现原理与落地步骤，技术细节集中在后半部分。只想动手的可直接看第 4 章。

## 1. 背景

### 1.1 业务场景

NocoBase 里有大量"把一批数据补进某张表"的需求，比如：

- **设备领用申请**：行政/研发补录历史领用记录，一次十几条。
- **方案评审**：批量录入待评审方案。
- **客户资料**：从邮件、名片、Excel、聊天记录里批量补录客户。
- **物资/资产台账**：盘点后成批登记。

这些需求的共同点：**数据来源零散（自然语言、邮件、表格），但目标结构固定（若干字段的二维表）**。

### 1.2 现在的问题

**人工录入的痛点：**

| 录入方式        | 问题                                                       |
| --------------- | ---------------------------------------------------------- |
| 逐条新建表单    | 记录多时重复操作、字段多、易错易漏                         |
| Excel 导入      | 要预先做严格模板、逐字段对齐；非技术用户难操作；报错难定位 |
| 复制粘贴 / 手敲 | 容易串行、漏字段、格式不统一（日期、数量、单位）           |

结果是单次批量补录耗时长、返工多。

**内置 AI 员工也帮不上忙。** 它能读懂你给的内容、帮你整理成结构化记录，但**最后一步"写进数据库"它做不了**——它默认没有写库能力，最多把内容填进一张表单的界面，而且填完还得人工逐个提交。10 条记录就是 10 次填表、10 次提交，和人工录入没有本质区别。

所以 AI 的价值停在"帮你整理"，1.1 的痛点并没有真正解决。

> 一句话：内置 AI 员工不是不够聪明，而是默认没有"写数据库"的能力。

### 1.3 目标与预期效果

**目标**：让业务人员把一段自然语言或一份表格交给 AI，由 AI 理解、抽取、结构化、映射字段，再经确定性流程批量写入目标表。

**预期效果：**

- **门槛低**：不用懂导入模板、不用逐条操作。
- **错误少**：字段映射和格式规范化由系统统一处理。
- **可把控**：AI 先把内容整理成结构化结果给用户确认，再落库。
- **更省时**：十几条记录从数十分钟缩短到一次对话。

使用方主要是行政、人事、运营等经常批量补录数据的业务人员。

---

## 2. 思路：让 AI 和确定性流程分工

### 2.1 分工原则

问题的本质是：AI 擅长"理解杂乱内容、整理成结构"，但**不应该直接操作数据库**——写错表、写错字段、绕过校验的风险太高。

因此本方案的思路是分工：

- **AI 负责"理解与结构化"**：把自然语言或表格整理成一条条结构化记录；
- **确定性流程负责"可靠落库"**：校验后批量写进目标表。

两者通过一个"AI 可调用的动作"衔接：AI 把整理好的数据交给它，它背后的确定性流程完成写入，再把结果返回给 AI。

### 2.2 为什么这样设计

- **扬长避短**：AI 发挥理解能力，不碰数据库。
- **安全可控**：写入由可校验、可审计的流程完成，AI 不会直接改库。
- **可复用**：同一个流程可服务多个业务场景。

> 具体由哪些技术组件构成、一次调用如何流转，见第 4 章「实现原理」。

---

## 3. 方案怎么选：服务一张表还是多张表

同样的"AI 理解 + 流程落库"思路，落地上有两种做法，取舍在于**服务范围**：

### 3.1 固定单表方案

一套流程只服务**一张指定的表**。

**优点：**

- **简单**：实现直观，落地快。
- **安全**：只认一张表，AI 不可能写错表。

**缺点：**

- **只能服务一张表**：业务要录另一张表，就得再建一套，重复建设。
- **表结构一变就要改**：字段增删、改名，都要回来调整。
- **越堆越多**：每张表一套，AI 要记的工具越来越多，容易选错。
- **难复用**：为一张表建的能力，换一张表就用不了。

### 3.2 通用多表方案

一套流程服务**所有表**，由 AI 在调用时指定目标表。

**优点：**

- **一个能力服务所有表**：新增表不用重建，AI 直接指定即可。
- **表结构变化免改**：字段调整不用动流程。
- **扩展性好**：一次建设，长期复用。

**缺点：**

- **实现更复杂**：技术门槛更高。
- **有写错表的风险**：AI 动态选表，可能写错目标表（需用白名单、受限角色兜底，见第 7 章）。
- **权限配置更复杂**：需要单独管理调用权限。

### 3.3 选型建议

| 场景                                         | 建议                                 |
| -------------------------------------------- | ------------------------------------ |
| 只服务一张表、追求简单安全                   | 固定单表                             |
| 要服务多张表、表结构常变、想一次建设长期复用 | 通用多表（本方案）                   |
| 想先快速上线、后续再扩展                     | 先用固定单表，需要时再升级为通用多表 |

两种方案并非非此即彼：可先按固定单表快速落地，业务扩展到多表时再迁移。

### 3.4 什么情况下不适合用这套

这套方案解决的是"把已结构化的数据批量写进表"，不覆盖需要业务规则介入的场景：

- **需要审批联动**：数据要经多级审批后才生效——应走审批流，而非直接写库。
- **需要强业务校验**：如跨表校验、唯一性约束、复杂计算——应在工作流里加校验节点，或走表单提交。
- **单批数据量过大**：数百上千条会触及请求超时，应分批，或改用专门的导入工具。
- **必须经表单校验**：若字段有前端校验规则，直接调 API 会绕过，需在服务端补校验。

简言之：AI 负责"理解与结构化"，确定性规则交给工作流；两者都不该承担的业务规则，仍应放在业务系统里。

---

## 4. 怎么做

> 动手前请先阅读第 5 章「关键约束与常见坑」——其中的 `sync`、`autoCall`、工具描述等几条，是能否跑通的关键。

### 4.1 实现原理

本方案由 4 个部分组成，缺一不可：

| 组成部分                                | 是什么                                      | 负责什么                                                                           |
| --------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| **AI 员工 `typer`**                     | 一条 AI 员工记录（和内置的 dex/ellis 同类） | 对话入口：理解用户要录什么，把零散内容解析成结构化记录，决定调用哪个工具           |
| **自定义工具 `workflowCaller-<key>`**   | AI 可调用的一个"动作"                       | 接收 AI 传来的 `collection`（目标表）和 `records`（记录 JSON），转交给背后的工作流 |
| **工作流**（script → request → output） | 确定性后端流程                              | 真正干活：解析 JSON、调用 NocoBase API 批量写库、把结果返回                        |
| **API key**                             | 一个访问凭证                                | 工作流调用 NocoBase 自身 API 时用于身份认证                                        |

**关键分工：AI 员工不直接碰数据库。** 它只负责"理解内容 + 决定调用工具"；真正写库的是工作流。这样 AI 发挥擅长的理解能力，写入则由可控、可校验的流程完成。

**一次批量录入的调用链：**

```
用户 → AI 员工（理解/结构化/选工具）→ 自定义工具 → 工作流（解析/写库/返回）→ AI 员工 → 用户
```

以设备领用为例：

1. 用户在对话框说："11.3 研发领 2 台 iPhone，行政领 1 台复印机……"（或直接贴一份表格）。
2. **AI 员工 typer** 理解内容，整理成结构化记录：
   `[{ "title": "...", "department": "研发", "deviceName": "iPhone15", "quantity": 2, ... }, ...]`
   若不确定目标表的字段，会先用 `data-metadata` 技能查一下。
3. typer 决定调用工具 `workflowCaller-<key>`，传入：
   - `collection` = `"equipmentRequests"`（写哪张表）
   - `records` = `"[{...},{...}]"`（记录数组的 JSON 字符串）
4. **工具**把参数转交给工作流（`workflowPlugin.trigger`）。
5. **工作流**执行三步：
   - `script`：把 `records` 字符串解析成数组；
   - `request`：带上 API key，`POST /api/equipmentRequests:create`，body 为数组 → 批量创建；
   - `output`：把创建结果整理返回。
6. 工具把结果交回 typer，typer 汇总回复用户："已创建 N 条"。

**和内置 AI 员工的技术差异：**

| 能力                             | 内置员工       | typer（本方案）    |
| -------------------------------- | -------------- | ------------------ |
| 理解 / 解析内容                  | ✅              | ✅                  |
| 查数据 / 读表结构                | ✅              | ✅                  |
| 填表单（不落库，需逐个手动提交） | ✅ `formFiller` | ✅                  |
| 批量写入数据库                   | ❌              | ✅ `workflowCaller` |

> 平台默认不开放"写库"工具，是出于安全考虑：让模型直接写数据库容易写错表、写错字段、绕过校验。把写操作交给可控的工作流，才稳妥。本方案就是补上这块。

### 4.2 前置条件

```bash
# 1) CLI 已认证（OAuth 浏览器登录）
nb env list                    # Auth 列应为 oauth
nb env auth <env>              # 若失效

# 2) 关键插件已启用
nb plugin list | grep -E 'plugin-ai|plugin-workflow|plugin-api-keys'
# 需启用：plugin-ai、plugin-workflow、plugin-api-keys（及工作流节点相关插件）

# 3) AI 员工所需的大模型服务已配置
#    AI 员工对话依赖已配置的 LLM 服务，未配置则员工无法工作。
#    检查/配置请走 nocobase-ai-manager（如 nb api ai llm-providers list-llm-services）
```

### 4.3 实施步骤

> 约定：`<env>` 为环境名，`<API_KEY>` 为步骤 1 生成的 token，其余 `<...>` 为运行时获取的 ID/Key。

#### 步骤 1：生成 API key

工作流 `request` 节点调用 NocoBase 自身 API 时**不自动带认证**，需要显式配置 `Authorization`。

```bash
nb api resource create --resource apiKeys \
  --values '{"name":"ai-batch-create","role":{"name":"admin"},"expiresIn":"never"}' \
  --env <env> --yes
# 返回 {"data":{"token":"eyJ..."}}，立即保存 <API_KEY>（token 字段 hidden，列表不再返回明文）
```

> `role` 必须是对象 `{"name":"<角色名>"}`，角色可选 `admin` / `member` / `root`。
> 生产环境应使用受限角色，见第 7 章。

#### 步骤 2：创建同步工作流

```bash
cat > /tmp/wf-sync.json <<'JSON'
{
  "title": "批量录入数据",
  "type": "ai-employee",
  "sync": true,
  "description": "批量向指定数据集合写入多条记录。collection 为目标集合名（如 equipmentRequests/customers），records 为记录数组 JSON 字符串，每条记录字段名需匹配集合字段。不确定集合字段时先用 data-metadata 查询。",
  "config": {
    "description": "批量向指定数据集合写入多条记录。参数 collection 为目标集合名，records 为记录数组 JSON 字符串。",
    "parameters": [
      { "name": "collection", "type": "string", "required": true, "description": "目标数据集合名，例如 equipmentRequests" },
      { "name": "records", "type": "string", "required": true, "description": "记录数组 JSON 字符串，例如 [{\"title\":\"申请1\",\"deviceName\":\"笔记本\",\"quantity\":2}]" }
    ]
  }
}
JSON

nb api workflow workflows create --body-file /tmp/wf-sync.json --env <env> --yes -j
# 记录返回的 id (<WORKFLOW_ID>) 与 key (<WORKFLOW_KEY>)；工具名将为 workflowCaller-<WORKFLOW_KEY>
```

> 用 `--body-file` 而非 `--config`，避免嵌套 JSON 的 shell 转义错误。
> 顶层 `description` 决定 AI 看到的工具描述，务必写清楚。

#### 步骤 3：搭建节点链（script → request → output）

**3a. script 节点**（把 records 字符串解析成数组，并对非数组输入做兜底）：

```bash
cat > /tmp/n-script.json <<'JSON'
{
  "type": "script",
  "title": "解析 records JSON",
  "config": {
    "arguments": [ { "name": "records", "value": "{{$context.records}}" } ],
    "content": "const parsed = JSON.parse(records || '[]'); return Array.isArray(parsed) ? parsed : [parsed];",
    "timeout": 5000,
    "continue": false
  }
}
JSON

nb api workflow workflows nodes create --workflow-id <WORKFLOW_ID> --body-file /tmp/n-script.json --env <env> --yes -j
# 记录 script 节点 id (<SCRIPT_ID>) 与 key (<SCRIPT_KEY>)
```

**3b. request 节点**（动态表名批量写入）：

```bash
# 先把步骤 3a 返回的 SCRIPT_ID / SCRIPT_KEY、以及步骤 1 的 API key 设为环境变量
# （把 <...> 替换为实际值）
export SCRIPT_ID=<SCRIPT_ID>
export SCRIPT_KEY=<SCRIPT_KEY>
export API_KEY=$(cat /tmp/api_key.txt)   # 步骤 1 保存的 token

python3 - <<'PY'
import json, os
body = {"type":"request","title":"HTTP 批量创建","upstreamId": int(os.environ["SCRIPT_ID"]), "config":{
  "method":"POST",
  "url":"http://127.0.0.1:13000/app1/api/{{$context.collection}}:create",
  "contentType":"application/json",
  "headers":[{"name":"Authorization","value":"Bearer "+os.environ["API_KEY"]}],
  "data":"{{$jobsMapByNodeKey."+os.environ["SCRIPT_KEY"]+"}}",
  "timeout":10000,"ignoreFail":False,"onlyData":True}}
open('/tmp/n-request.json','w').write(json.dumps(body))
PY

nb api workflow workflows nodes create --workflow-id <WORKFLOW_ID> --body-file /tmp/n-request.json --env <env> --yes -j
# 记录 request 节点 id (<REQUEST_ID>) 与 key (<REQUEST_KEY>)
```

> `url` 用 `{{$context.collection}}` 动态拼表名；`data` 引用 script 输出（数组）；`onlyData=true` 让输出直接是创建结果。

**3c. output 节点**（把结果返回给 AI）：

```bash
cat > /tmp/n-output.json <<'JSON'
{
  "type": "output",
  "title": "返回创建结果",
  "upstreamId": <REQUEST_ID>,
  "config": {
    "value": { "status": "success", "message": "批量创建完成", "created": "{{$jobsMapByNodeKey.<REQUEST_KEY>}}" }
  }
}
JSON

nb api workflow workflows nodes create --workflow-id <WORKFLOW_ID> --body-file /tmp/n-output.json --env <env> --yes -j
```

#### 步骤 4：启用工作流（工具注册的前提）

```bash
nb api workflow workflows update --filter-by-tk <WORKFLOW_ID> --enabled --env <env> --yes
# 验证工具已注册
nb api resource list --resource aiTools --env <env> --yes -j \
  | jq -r '.data[] | select(.definition.name|startswith("workflowCaller-")) | .definition.name'
```

#### 步骤 5：创建 AI 员工

```bash
# 先确认 username 不存在
nb api ai employees list --env <env> --yes -j | jq -r '.data[].username'

cat > /tmp/employee.json <<'JSON'
{
  "username": "typer",
  "nickname": "Typer",
  "position": "数据录入专员",
  "avatar": "nocobase-015-male",
  "bio": "从文本/表格/文档中提取并整理数据，可批量写入任意数据表。",
  "about": "你是 Typer，一名数据录入专员。基于用户提供的表格、Excel、邮件或文档内容：1) 提取并结构化每条记录；2) 若不确定目标集合或字段，先用 data-metadata 技能确认集合与字段名；3) 调用批量录入工具把 records 数组以 JSON 字符串传给指定 collection；4) 汇总创建结果。字段值须与集合字段名严格一致，数量等数字字段输出为数字。",
  "greeting": "把要录入的表格或文档发给我，我帮你批量写入数据表。",
  "enabled": true
}
JSON

nb api ai employees create --body-file /tmp/employee.json --env <env> --yes -j
```

> `avatar` 必须是受支持的种子值（默认 `nocobase-015-male`）。
> CLI 记录面**不支持** `skillSettings`，工具绑定要单独做（见步骤 6）。

#### 步骤 6：绑定工具

```bash
nb api resource update --resource aiEmployees --filter-by-tk typer \
  --values '{"skillSettings":{"skills":[],"tools":[{"name":"workflowCaller-<WORKFLOW_KEY>","autoCall":true}]}}' \
  --env <env> --yes

# readback 验证
nb api ai employees get --filter-by-tk typer --env <env> --yes -j | jq -c '.data | {username, tools:.skillSettings.tools}'
```

#### 步骤 7：验证

```bash
# 1) 工作流：sync=true 且 enabled
nb api workflow workflows get --filter-by-tk <WORKFLOW_ID> --env <env> --yes -j | jq -c '.data|{sync,enabled}'
# 2) 工具已注册且描述非空
nb api resource list --resource aiTools --env <env> --yes -j \
  | jq -c '.data[]|select(.definition.name=="workflowCaller-<WORKFLOW_KEY>")|{name:.definition.name,desc:(.definition.description[0:40])}'
# 3) 员工绑定 autoCall=true
# 4) script 节点逻辑（flow-nodes test）
nb api workflow flow-nodes test --body-file /tmp/test-script.json --env <env> --yes -j
# 5) request 目标 API 等价冒烟（curl + <API_KEY> 写一条后删除）
# 6) 在 AI 对话界面开新会话做端到端实测
```

> `ai-employee` 触发器不支持 `workflows execute`，第 6 步是唯一可做的端到端验证。

---

## 5. 关键约束与常见坑

自定义工具名固定为 `workflowCaller-<workflow.key>`（`scope=CUSTOM`、`from=workflow`、`execution=backend`），绑定员工时务必用这个准确名字。以下约束与坑是实施中最容易出问题的地方：

| #   | 坑                           | 现象                                    | 正确做法                                                                                     |
| --- | ---------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | 工作流 `sync=false`          | 工具调用立即报错/中断，`executed=0`     | 创建时 `"sync": true`；建好后不能改，只能重建                                                |
| 2   | 员工 `autoCall=false`        | 每次调用弹确认，用户忽略后 AI 反复重试  | 绑工具时 `autoCall: true`                                                                    |
| 3   | 工具描述为空                 | AI 不知道工具干什么，不调用或乱调       | 设工作流**顶层** `description`（不是 config.description）                                    |
| 4   | 参数类型限制                 | 直接传数组/对象失败                     | 多行数据用 **JSON 字符串**传 `records`，节点内 `JSON.parse`                                  |
| 5   | CLI 不支持 `skillSettings`   | `nb api ai employees create` 绑不了工具 | 用 `nb api resource update --resource aiEmployees` 写 `skillSettings`                        |
| 6   | 触发器不支持手动执行         | 没法用 CLI 测试                         | 只能在 AI 对话界面端到端验证                                                                 |
| 7   | 工作流 key 变了 → 工具名变了 | 重建工作流后旧绑定失效                  | 重建后更新员工 `tools[].name`，并停用旧工作流                                                |
| 8   | 非 string 字段赋值           | 数字字段写入失败/类型错                 | `create` 节点非 string 字段要"纯变量"赋值；本方案走 API 不受此限                             |
| 9   | 重试导致重复写入             | AI 重试可能重复落库                     | 工作流用同步模式保证一次一结果；批量写入天然不幂等，建议按业务唯一键去重，或先让用户确认再写 |
| 10  | API key 权限过大             | 能写任意表                              | 用受限角色 + 集合白名单（见第 7 章）                                                         |

---

## 6. 出问题怎么查

如果 AI 反复说"批量写入似乎被中断了"，按下面的证据链查，不要瞎改：

1. **看 AI 消息记录**（`aiMessages`）：

   ```bash
   nb api resource list --resource aiMessages --sort -createdAt --page-size 60 --env <env> --yes -j \
     | jq -r '.data[] | select(.role=="typer") | "\(.content|tostring[0:80]) | toolCalls=\((.toolCalls//[])|tostring[0:200])"'
   ```

   > 注：命令里的 `typer` 换成你的员工名。

   - `role=tool` 的消息是 `"The user ignored the application for tools usage"` → `autoCall`/确认问题（坑 2）。
   - `toolCalls[].args` 缺 `collection` → 参数/schema 问题（坑 3/4）。

2. **看工作流执行记录**：

   ```bash
   nb api workflow executions list --filter '{"workflowId":<WORKFLOW_ID>}' --env <env> --yes -j | jq -c '{count:.meta.count}'
   nb api workflow workflows get --filter-by-tk <WORKFLOW_ID> --env <env> --yes -j | jq -c '.data|{sync,enabled,executed}'
   ```

   - `executed=0` 且无 executions → 工具根本没触发工作流（多半是 sync/autoCall 问题）。
   - 有 executions 但 status<0 → 再看 jobs 的错误。

3. **看日志**（`storage/logs/main/request_<date>.log`）：

   - 出现 `aiConversations:resumeToolCall` / `updateUserDecision` → 工具进了人工确认流程（坑 2）。

4. **核对配置**：`sync=true`、`autoCall=true`、工具描述非空、员工绑定的是**当前启用**工作流的工具名。

---

## 7. 安全与权限

验证阶段用的是 **admin 角色** API key，能写任意集合。生产环境建议收紧：

**a) 用受限角色**：API key 绑定只拥有目标表写权限的角色，而不是 admin。

**b) 集合白名单**：把步骤 3a 的 script 节点配置替换为以下内容（增加表名校验），防止 AI 写错表。

```json
{
  "type": "script",
  "config": {
    "arguments": [
      { "name": "collection", "value": "{{$context.collection}}" },
      { "name": "records", "value": "{{$context.records}}" }
    ],
    "content": "const ALLOWED=['equipmentRequests','customers','schemeReviews']; if(!ALLOWED.includes(collection)){throw new Error('collection not allowed: '+collection);} const p=JSON.parse(records||'[]'); return Array.isArray(p)?p:[p];",
    "timeout": 5000, "continue": false
  }
}
```

**c) 字段白名单**：如需限制可写字段，可在 script 中裁剪每条记录，只保留允许的键。

**d) API key 轮换**：token 明文存在工作流节点配置里（管理员可读）。应定期轮换，并同步更新 request 节点的 `Authorization`。

**e) 调用权限**：`autoCall: true` 是免确认自动执行，要通过员工/角色 ACL 控制谁能对话。

---

## 8. 配置清单与验收标准

| 项       | 值                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 员工     | `typer`（business，数据录入专员，enabled）                                                                             |
| 工作流   | id `397353149464576`，key `w5t0mociajk`，`sync=true`，enabled                                                          |
| 工具     | `workflowCaller-w5t0mociajk`（CUSTOM / backend）                                                                       |
| 节点链   | script `397353168338944`(ftsudy2gbhn) → request `397353180921856`(lu32supz3tw) → output `397353535340544`(cwjqs7nw8di) |
| API key  | `ai-batch-create`（admin，token 存于 request 节点 Authorization）                                                      |
| 旧工作流 | `397351505297408`(yc30n4ksssf) 已停用（sync=false 的历史版本）                                                         |

> 上表为本环境实例；其他环境按实际 ID/Key 替换。

### 验收标准

实施完成的判定条件：

1. 工作流 `sync=true` 且已启用；
2. 自定义工具 `workflowCaller-<key>` 已注册、描述非空；
3. 员工 `skillSettings.tools` 已绑定该工具且 `autoCall=true`；
4. 在 AI 对话中开新会话，能成功批量写入 N 条记录；
5. 异常输入（不存在的表、非法 JSON、空数组）返回可读错误，而非静默失败或崩溃。

---

## 9. 以后怎么改

- **新增可写的表**：通用多表方案不用改工具，AI 直接传新的 `collection` 即可（前提：API key 角色有权限；若开了白名单，要把新表加进去）。
- **改字段/类型**：不用改工作流（records 直接透传给 API），只要在工具描述里补上字段说明，方便 AI 正确映射。
- **改批量上限/超时**：调 request 节点的 `timeout`；大批量建议分批（比如每批 50 条）。
- **换模型**：员工的 `modelSettings` 通过 `nocobase-ai-manager` 配专用模型；本方案保持默认全局模型。