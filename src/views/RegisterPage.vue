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
        <el-card class="register-card">
          <h2>创建您的账户</h2>
          <el-form :model="registerForm" :rules="rules" ref="registerForm" label-width="100px" @submit.prevent="handleRegister">
            <!-- 姓名 -->
            <el-form-item label="用户名" prop="name">
              <el-input v-model="registerForm.name" placeholder="请输入用户名" />
            </el-form-item>

            <!-- 社会安全号码 (SSN) -->
            <el-form-item label="SSN" prop="ssn">
              <el-input v-model="registerForm.ssn" placeholder="请输入社会安全号码" maxlength="18" />
            </el-form-item>

            <!-- 电话号码 -->
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <!-- 电子邮箱 -->
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" placeholder="请输入电子邮箱" />
            </el-form-item>

            <!-- 设置密码 -->
            <el-form-item label="密码" prop="password">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码 (至少6位)" />
            </el-form-item>

            <!-- 确认密码 -->
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
            </el-form-item>

            <!-- 注册按钮 -->
            <el-form-item>
              <el-button type="primary" block @click="handleRegister">注册</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/api/axios"; // 导入 Axios 实例
import JSEncrypt from 'jsencrypt';

export default {
  name: "RegisterCard",
  data() {
    return {
      registerForm: {
        name: "",
        ssn: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      rules: {
        name: [{ required: true, message: "用户名不能为空", trigger: "blur" },
          { max: 36, message: "超过长度限制", trigger: "blur" },],
        ssn: [{ required: true, message: "SSN不能为空", trigger: "blur" },
          {
            pattern: /^\d{18}$/,
            message: "SSN必须是18位纯数字",
            trigger: "blur",
          },],
        phone: [{ required: true, message: "手机号不能为空", trigger: "blur" },
          {
            pattern: /^\d{11}$/,
            message: "手机号必须是11位纯数字",
            trigger: "blur",
          },],
        email: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 6, message: "密码至少6位", trigger: "blur" },
        ],
        confirmPassword: [
          { required: true, message: "请确认密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error("两次输入的密码不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    async handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          try {
            // 公钥（从后端获取或嵌入）
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
            const encryptor = new JSEncrypt()
            encryptor.setPublicKey(publicKey)
            const encryptedFormData = {}
            Object.keys(this.registerForm).forEach((key) => {
              encryptedFormData[key] = encryptor.encrypt(this.registerForm[key]);
            });
            axios.post("/register", encryptedFormData).then(response => {
              const registrationResponse = response;
              if(registrationResponse.status===200){
                this.$message.success("注册成功！");
                this.$refs.registerForm.resetFields();
                this.$router.push("/");
              }
              if(registrationResponse.status===202){
                this.$message.error(registrationResponse.data);
                this.$refs.registerForm.resetFields();
              }
            });
          } catch (error) {
            console.error("注册失败:", error);
            this.$message.error(error.response?.data?.message || "注册失败，请稍后再试");
          }
        } else {
          this.$message.error("请检查表单填写是否正确");
        }
      });
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

.register-card {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 15px;
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
