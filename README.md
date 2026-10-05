# 832401313 Calculator Backend

这是软件工程实践第一次作业的后端项目。后端使用 Flask 提供 HTTP API，使用 SQLite 保存计算历史，负责表达式校验、解析和计算。

## 技术栈

- Python 3.10+
- Flask
- Flask-Cors
- SQLite
- pytest

## 安装与启动

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

服务默认运行在 `http://127.0.0.1:5000`。数据库文件 `calculator.db` 会在第一次启动时自动创建。

## API

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/api/health` | 检查服务状态 |
| POST | `/api/calculate` | 后端计算表达式并保存成功记录 |
| GET | `/api/history` | 查询历史记录 |
| DELETE | `/api/history/<id>` | 删除指定历史记录 |
| DELETE | `/api/history` | 清空全部历史记录 |

计算请求示例：

```json
{"expression":"(1+2)*3"}
```

## 测试

```bash
pytest
```

## 部署提示

可以把本目录连接到 Render 等支持 Python 的云平台，启动命令使用 `gunicorn app:app`。部署完成后，把得到的后端地址填入前端 `app.js` 的 `API_BASE`，再把前端目录发布到 GitHub Pages 或其他静态网站托管服务。

## 安全说明

表达式由项目自己的递归下降解析器处理，未使用 `eval`、`exec` 或其他任意代码执行方法。数据库写入使用参数化 SQL。

