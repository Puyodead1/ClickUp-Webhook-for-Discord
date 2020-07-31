const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const { inspect } = require("util");
const app = express();
app.use(bodyParser.json());

const TOKEN = "INSERT TOKEN HERE";

const WEBHOOK_URL =
  "INSERT WEBHOOK URL HERE";

async function getTask(id) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${id}`, {
    headers: {
      Authorization: TOKEN,
    },
  }).then((res) => res.json());
  return res;
}

async function getList(id) {
  const res = await fetch(`https://api.clickup.com/api/v2/list/${id}`, {
    headers: {
      Authorization: TOKEN,
    },
  }).then((res) => res.json());
  return res;
}

async function getFolder(id) {
  const res = await fetch(`https://api.clickup.com/api/v2/folder/${id}`, {
    headers: {
      Authorization: TOKEN,
    },
  }).then((res) => res.json());
  return res;
}

function build(task, items) {
  const embeds = [];
  for (const item of items) {
    switch (item.field) {
      case "task_creation":
        embeds.push({
          url: task.url,
          title: "A new task was created",
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          color: 0x2ecc71,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Folder",
              value: task.folder.name,
              inline: true,
            },
            {
              name: "Project",
              value: task.project.name,
              inline: true,
            },
            {
              name: "List",
              value: task.list.name,
              inline: true,
            },
            {
              name: "Task",
              value: task.name,
              inline: true,
            },
          ],
        });
        break;
      case "status":
        embeds.push({
          url: task.url,
          title: "Task Status Updated",
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          color: parseInt(item.after.color.replace(/^#/, ""), 16),
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Folder",
              value: task.folder.name,
              inline: true,
            },
            {
              name: "Project",
              value: task.project.name,
              inline: true,
            },
            {
              name: "List",
              value: task.list.name,
              inline: true,
            },

            {
              name: "Task Name",
              value: task.name,
              inline: true,
            },
            {
              name: "⠀",
              value: "⠀",
              inline: true,
            },
            {
              name: "⠀",
              value: "⠀",
              inline: true,
            },
            {
              name: "Old Status",
              value: item.before.status || "N/A",
              inline: true,
            },
            {
              name: "New Status",
              value: item.after.status || "N/A",
              inline: true,
            },
          ],
        });
        break;
      case "priority":
        let color = 16711680;
        if (item.before && item.after) color = parseInt(item.after.color.replace(/^#/, ""), 16);
        else if (item.after && !item.before)
          color = parseInt(item.after.color.replace(/^#/, ""), 16);
        embeds.push({
          url: task.url,
          title: "Task Priority Updated",
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          color,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Folder",
              value: task.folder.name,
              inline: true,
            },
            {
              name: "Project",
              value: task.project.name,
              inline: true,
            },
            {
              name: "List",
              value: task.list.name,
              inline: true,
            },

            {
              name: "Task Name",
              value: task.name,
              inline: true,
            },
            {
              name: "⠀",
              value: "⠀",
              inline: true,
            },
            {
              name: "⠀",
              value: "⠀",
              inline: true,
            },
            {
              name: "Old Priority",
              value: item.before ? item.before.priority : "N/A" || "N/A",
              inline: true,
            },
            {
              name: "New Priority",
              value: item.after ? item.after.priority : "N/A" || "N/A",
              inline: true,
            },
          ],
        });
        break;

      case "assignee_add":
        embeds.push({
          url: task.url,
          title: "Assignee Added",
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          color: 0x2ecc71,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Folder",
              value: task.folder.name,
              inline: true,
            },
            {
              name: "Project",
              value: task.project.name,
              inline: true,
            },
            {
              name: "List",
              value: task.list.name,
              inline: true,
            },
            {
              name: "Username",
              value: item.after.username,
              inline: true,
            },
            {
              name: "Task Name",
              value: task.name,
              inline: true,
            },
          ],
          footer: {
            text: item.after.username,
            icon_url: item.after.profilePicture,
          },
        });
        break;

      case "assignee_rem":
        embeds.push({
          url: task.url,
          title: "Assignee Removed",
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          color: 0xe74c3c,
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Folder",
              value: task.folder.name,
              inline: true,
            },
            {
              name: "Project",
              value: task.project.name,
              inline: true,
            },
            {
              name: "List",
              value: task.list.name,
              inline: true,
            },
            {
              name: "Username",
              value: item.before.username,
              inline: true,
            },
            {
              name: "Task Name",
              value: task.name,
              inline: true,
            },
          ],
          footer: {
            text: item.before.username,
            icon_url: item.before.profilePicture,
          },
        });
        break;

      case "section_moved":
        embeds.push({
          url: task.url,
          title: "Task Moved",
          color: 0xe67e22,
          timestamp: new Date().toISOString(),
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          fields: [
            {
              name: "Old Project",
              value: item.before.project.name,
              inline: true,
            },
            {
              name: "New Project",
              value: item.after.project.name,
              inline: true,
            },
            {
              name: "⠀",
              value: "⠀",
              inline: true,
            },
            {
              name: "Old Category",
              value: item.before.category.name,
              inline: true,
            },
            {
              name: "New Category",
              value: item.after.category.name,
              inline: true,
            },
            {
              name: "⠀",
              value: "⠀",
              inline: true,
            },
            {
              name: "Old Folder",
              value: item.before.name,
              inline: true,
            },
            {
              name: "New Folder",
              value: item.after.name,
              inline: true,
            },
          ],
        });
        break;

      case "comment":
        embeds.push({
          url: task.url,
          title: `New Comment on task: ${task.name}`,
          color: 0x2ecc71,
          timestamp: new Date().toISOString(),
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          description: item.comment.text_content,
        });
        break;

      case "name":
        embeds.push({
          title: `List Name Updated`,
          color: 0xf1c40f,
          timestamp: new Date().toISOString(),
          author: {
            name: item.user.username,
            icon_url: item.user.profilePicture,
          },
          fields: [
            {
              name: "Old",
              value: item.before,
              inline: true,
            },
            {
              name: "New",
              value: item.after,
              inline: true,
            },
          ],
        });
        break;
    }
  }
  return embeds;
}

async function post(data) {
  if (data.event === "taskCreated" || data.event === "taskUpdated") {
    const task = await getTask(data.task_id);
    if (!data.history_items) return null;
    const embeds = build(task, data.history_items);
    for (const embed of embeds) {
      const body = JSON.stringify({
        embeds: [embed],
        author: {
          name: task.creator.username,
          icon_url: task.creator.profilePicture,
        },
        username: "ClickUp",
        avatar_url:
          "https://store-images.s-microsoft.com/image/apps.56560.fd6cc851-feab-42bf-8fc7-0caabb6dd238.cdfdf62d-493c-44b7-97a8-a4f5f6f6b957.a89f355d-c851-4e58-944e-81c1aa19e038.png",
      });
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
    }
  } else if (data.event === "taskDeleted") {
    const body = JSON.stringify({
      embeds: [
        {
          title: "Task Deleted",
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "Task ID",
              value: data.task_id,
            },
          ],
        },
      ],
      color: 0xe74c3c,
      username: "ClickUp",
      avatar_url:
        "https://store-images.s-microsoft.com/image/apps.56560.fd6cc851-feab-42bf-8fc7-0caabb6dd238.cdfdf62d-493c-44b7-97a8-a4f5f6f6b957.a89f355d-c851-4e58-944e-81c1aa19e038.png",
    });
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  } else if (data.event === "listCreated") {
    const list = await getList(data.list_id);
    const body = JSON.stringify({
      embeds: [
        {
          title: "List Created",
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "List ID",
              value: data.list_id,
            },
            {
              name: "List Name",
              value: list.name,
            },
          ],
        },
      ],
      color: 0x2ecc71,
      username: "ClickUp",
      avatar_url:
        "https://store-images.s-microsoft.com/image/apps.56560.fd6cc851-feab-42bf-8fc7-0caabb6dd238.cdfdf62d-493c-44b7-97a8-a4f5f6f6b957.a89f355d-c851-4e58-944e-81c1aa19e038.png",
    });
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  } else if (data.event === "listUpdated") {
    const list = await getList(data.list_id);
    if (!data.history_items) return null;
    const embeds = build(list, data.history_items);
    for (const embed of embeds) {
      const body = JSON.stringify({
        embeds: [embed],
        username: "ClickUp",
        avatar_url:
          "https://store-images.s-microsoft.com/image/apps.56560.fd6cc851-feab-42bf-8fc7-0caabb6dd238.cdfdf62d-493c-44b7-97a8-a4f5f6f6b957.a89f355d-c851-4e58-944e-81c1aa19e038.png",
      });
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
    }
  } else if (data.event === "listDeleted") {
    const body = JSON.stringify({
      embeds: [
        {
          title: "List Deleted",
          timestamp: new Date().toISOString(),
          fields: [
            {
              name: "List ID",
              value: data.list_id,
            },
          ],
        },
      ],
      color: 0xe74c3c,
      username: "ClickUp",
      avatar_url:
        "https://store-images.s-microsoft.com/image/apps.56560.fd6cc851-feab-42bf-8fc7-0caabb6dd238.cdfdf62d-493c-44b7-97a8-a4f5f6f6b957.a89f355d-c851-4e58-944e-81c1aa19e038.png",
    });
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });
  }
}

app.post("/webhook", async (req, res) => {
  if (!req.headers["content-type"] || req.headers["content-type"] !== "application/json")
    return res.sendStatus(400);
  const data = req.body;
  if (!data) return res.sendStatus(400);
  console.log(inspect(data, false, 20));
  await post(data);
  return res.sendStatus(200);
});

app.listen(80);