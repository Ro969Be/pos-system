const express = require("express");
const router = express.Router();
const {
  login,
  registerStaff,
  registerCustomer,
  registerPublicCustomer,
} = require("../controllers/authController");

// 共通ログイン
router.post("/login", login);

// 各種登録
router.post("/staff/register", registerStaff);
router.post("/customer/register", registerCustomer);
router.post("/public-customer/register", registerPublicCustomer);

module.exports = router;
