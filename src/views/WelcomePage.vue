<template>
  <div class="welcome-page">
    <!-- 主内容 -->
    <div class="content">
      <!-- 左侧部分 -->
      <div class="left-section">
        <div>
          <img src="@/assets/logo.png" alt="logo" class="logo-image" />
          <el-divider direction="vertical" />
          <span class="words-link">Easy to Pay</span>
        </div>
        <div class="features">
          <div class="feature-item">
            <img src="@/assets/feature1.png" alt="Feature 1" />
            <div>
              <h3>财务收支管理</h3>
              <p>提供开箱即用的财务管理与收支报表</p>
            </div>
          </div>
          <div class="feature-item">
            <img src="@/assets/feature2.png" alt="Feature 2" />
            <div>
              <h3>多场景应用</h3>
              <p>满足您的商旅、购物、应用、游戏等收支管理需求</p>
            </div>
          </div>
          <div class="feature-item">
            <img src="@/assets/feature3.png" alt="Feature 3" />
            <div>
              <h3>安全是生命线</h3>
              <p>数据加密，保护您的数据安全</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧部分 -->
      <div class="right-section">
        <el-card class="login-card">
          <h2>登录您的账户</h2>
          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="账号登录" name="account">
              <el-form :model="loginForm" :rules="rules" ref="loginForm" @submit.prevent="handleLogin">
                <el-form-item label="邮箱" prop="account">
                  <el-input v-model="loginForm.account" placeholder="请输入账号（email/phone）" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input v-model="loginForm.password" placeholder="请输入密码" type="password" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" block @click="handleLogin">登录</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <div class="register-link">
            <a href="#" @click="navigateTo('register')">立即注册</a>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>


<script>

import axios from "@/api/axios"; // 导入 Axios 实例
import JSEncrypt from 'jsencrypt';

export default {
  data() {
    return {
      activeTab: "account",
      loginForm: {
        account: "",
        password: "",
      },
      rules: {
        account: [
                    { required: true, message: "账户名不能为空", trigger: "blur" },
                    {
                      validator: (rule, value, callback) => {
                        const isEmail = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value);
                        const isPhoneNumber = /^\d{11}$/.test(value);
                        if (!isEmail && !isPhoneNumber) {
                          callback(new Error("账户名必须为有效的邮箱地址或电话"));
                        } else {
                          callback();
                        }
                      },
                      trigger: "blur"
                    }
                  ],
        password: [{required: true, message: "密码不能为空", trigger: "blur"},
                    { min: 6, message: "密码至少为6位", trigger: "blur" }]
      }
    };
  },
  methods: {
    async handleLogin() {
      // 表单校验
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          try {
            const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiRVoWXso/VtjtoFAA14H
colY4nrjqGmJMoKd5A+RReRHYgNWW1yPdNewcSMZDz94PO9yAD4vCpfH+2sqZ0qO
XYQ1cimgUttr7Vt2QjOT55/p9lyQb2HXBYBfcwgfCET2DA5ZiGeIXDX2/0oZ7KSz
Axm8E6+PjIASahGgPAyT/P6tIIc+TNEA73EZ2C4gXIlh7VjsjyBLoE2/J8cb6fX7
2MUTj+Z6IA28FvBOFTGHk8OJq3ryGJ+t6NMakzyLunnLyJKuYJFC6FQWFdFmNvKy
mg4W/3bKazbm6F/tq85ZUY1khTb6iO+2UbReoXV1XSGJnCYNf12/A5jtuXOzPlxT
swIDAQAB
-----END PUBLIC KEY-----`;

            // 使用 JSEncrypt 加密字段
            const encryptor = new JSEncrypt();
            encryptor.setPublicKey(publicKey);
            const encryptedFormData = {}
            Object.keys(this.loginForm).forEach((key) => {
              encryptedFormData[key] = encryptor.encrypt(this.loginForm[key]);
            });
            axios.post("/login", encryptedFormData).then(response => {
              const loginResponse = response;
              if(loginResponse.status===200){
                
                // TODO: 从后端获取email对应的username
                // axios.get('/userofemail', this.loginForm.account).then(response => {
                //     const username = response.data;
                //     localStorage.setItem("loggedInUser", JSON.stringify({
                //     username: username,
                //     loginTime: new Date().toISOString()
                //   }));//记录当前登录
                // })
                // .catch((error) => {alert('服务器错误' + error.message);});
                
                localStorage.setItem("loggedInUser", JSON.stringify({
                  username: this.loginForm.account,
                  loginTime: new Date().toISOString()
                }));//记录当前登录
                this.$message.success("登录成功！");
                this.$refs.loginForm.resetFields();
                this.$router.push("/dashboard");
              }
              if(loginResponse.status===202){
                this.$message.error(loginResponse.data);
              }
            });
          } catch (error) {
            console.error("登录失败:", error);
            this.$message.error(error.response?.data?.message || "登录失败，请稍后再试");
          }
        } else {
          this.$message.error("请检查表单填写是否正确");
        }
      });
    },
    navigateTo(route) {
      this.$router.push(`/${route}`);
    },
  },
};
</script>

<style scoped>
.words-link {
  font-size: 36px; /* 你可以根据需要设置字体大小 */
}
.welcome-page {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  overflow: hidden;
}

.content {
  display: flex;
  width: 80%;
  max-width: 1200px;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  flex: 1;
}

.logo {
  margin-bottom: 20px;
}

.logo img {
  width: 120px;
  margin-bottom: 10px;
}

.tagline {
  font-size: 18px;
  color: #666;
}

.features {
  margin-top: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.feature-item img {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.right-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-tabs {
  margin-bottom: 20px;
}

.register-link {
  text-align: center;
  margin-top: 10px;
}

.register-link a {
  color: #409eff;
  font-size: 14px;
}

.logo-image {
  width: 64px; /* 你可以根据需要设置宽度 */
  height: auto; /* 高度自动，保持图片比例 */
  /* 或者你也可以设置高度 */
  /* height: 50px; */
}
</style>
