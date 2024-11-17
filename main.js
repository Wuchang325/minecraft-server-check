const express = require("express");
const mcpePing = require("mcpe-ping");
const util = require("minecraft-server-util");
const dot = require("dot-prop");

const app = express();

// 创建一个统一的 API 路由，用于检测 BE 和 JE 服务器状态
app.get("/ping/:type/:host/:port/:path?", (req, resp) => {
  const { type, host, port, path = '' } = req.params;

  // 根据类型选择不同的检测方法
  if (type === 'be') {
    // 检测 Bedrock Edition 服务器
    mcpePing(host, +port, (err, data) => {
      try {
        if (err) {
          resp.json(err);
        } else if (path) {
          resp.end(dot.get(data, path) + '');
        } else {
          resp.json(data);
        }
      } catch (e) {
        resp.json(e);
      }
    }, 5000);
  } else if (type === 'je') {
    // 检测 Java Edition 服务器
    util.status(host, +port)
      .then((data) => {
        if (path) {
          resp.end(dot.get(data, path) + '');
        } else {
          resp.json(data);
        }
      })
      .catch((error) => {
        resp.json({
          error: true,
          description: error.toString()
        });
      });
  } else {
    // 如果类型不正确，返回错误信息
    resp.json({
      error: true,
      description: "Invalid type. Use 'je' for Java Edition or 'be' for Bedrock Edition."
    });
  }
});

// 启动服务器
const PORT = +(process.env.PORT || 1234);
app.listen(PORT, () => {
  console.log(`程序已启动`);
  console.log(`正在监听端口 ${PORT}`);
});