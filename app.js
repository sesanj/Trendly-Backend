import fs from "node:fs/promises";
import cors from "cors";

import bodyParser from "body-parser";
import express from "express";

const app = express();

app.use(express.static("images"));
app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

app.get("/orders", async (req, res) => {
  try {
    const fileContent = await fs.readFile("./data/orders.json");

    const ordersData = JSON.parse(fileContent);

    res.status(200).json({ orders: ordersData });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/user-orders", async (req, res) => {
  try {
    const userEmail = req.query.email;
    const fileContent = await fs.readFile("./data/orders.json");

    const orders = JSON.parse(fileContent);

    let userOrders = orders.filter(
      (order) => order.customer.email.toLowerCase() === userEmail.toLowerCase()
    );

    res.status(200).json({ order: userOrders });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/filter-orders", async (req, res) => {
  try {
    const filter = req.query.filter;
    const fileContent = await fs.readFile("./data/orders.json");

    const orders = JSON.parse(fileContent);

    let flteredOrders = orders.filter((order) => order.status == filter);

    res.status(200).json({ filtered: flteredOrders });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/track-order", async (req, res) => {
  try {
    const orderEmail = req.query.email;
    const orderID = req.query.orderId;

    const fileContent = await fs.readFile("./data/orders.json");

    const orders = JSON.parse(fileContent);
    let order = orders.filter(
      (order) =>
        order.orderID == orderID &&
        order.customer.email.toLowerCase() == orderEmail.toLowerCase()
    )[0];

    res.status(200).json({ track: order });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/completed-order", async (req, res) => {
  try {
    const orderID = req.query.orderId;

    const fileContent = await fs.readFile("./data/orders.json");

    const orders = JSON.parse(fileContent);
    let order = orders.filter((order) => order.orderID == orderID)[0];

    res.status(200).json({ completed: order });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/users", async (req, res) => {
  try {
    const fileContent = await fs.readFile("./data/users.json");

    const users = JSON.parse(fileContent);

    res.status(200).json({ users: users });
  } catch (error) {
    handleError(res, error);
  }
});

app.get("/logged-user", async (req, res) => {
  try {
    const userID = req.query.userId;
    const fileContent = await fs.readFile("./data/users.json");

    const users = JSON.parse(fileContent);

    let loggedUser;

    users.some((user) => (user.ID === userID ? (loggedUser = user) : null));

    res.status(200).json({ user: loggedUser });
  } catch (error) {
    handleError(res, error);
  }
});

app.put("/add-order", async (req, res) => {
  try {
    const orderInfo = req.body.order;

    const fileContent = await fs.readFile("./data/orders.json");
    const orderData = JSON.parse(fileContent);

    orderData.push(orderInfo);

    await fs.writeFile("./data/orders.json", JSON.stringify(orderData));

    res.status(200).json({ order: orderData });
  } catch (error) {
    handleError(res, error);
  }
});

app.put("/add-user", async (req, res) => {
  try {
    const userInfo = req.body.user;

    const fileContent = await fs.readFile("./data/users.json");
    const userData = JSON.parse(fileContent);

    userData.push(userInfo);

    await fs.writeFile("./data/users.json", JSON.stringify(userData));

    res.status(200).json({ order: userData });
  } catch (error) {
    handleError(res, error);
  }
});

app.put("/update-order", async (req, res) => {
  try {
    // Check if body exists and has expected properties
    if (!req.body || !req.body.orderID || !req.body.orderStatus) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const orderID = req.body.orderID;
    const orderStatus = req.body.orderStatus;

    const fileContent = await fs.readFile("./data/orders.json");
    let orderData = JSON.parse(fileContent);

    let order = orderData.find((order) => order.orderID === orderID);

    if (order) {
      orderData.some((order) =>
        order.orderID === orderID ? (order.status = orderStatus) : ""
      );
    }

    await fs.writeFile("./data/orders.json", JSON.stringify(orderData));

    return res.status(200).json({ order: orderData });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// 404
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  res.status(404).json({ message: "404 - Not Found" });
});

// app.listen(3000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
