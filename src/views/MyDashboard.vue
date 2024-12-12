<template>
  <a-layout>
    <!-- 上边栏 -->
    <a-layout-header class="header">
      <div class="header-left">
        <h1>Dashboard</h1>
      </div>
      <div class="header-right">
        <a-avatar :src="userAvatar" />
        <a-button type="link" @click="handleLogout">Logout</a-button>
      </div>
    </a-layout-header>

    <!-- 主体内容 -->
    <a-layout-content class="content">
      <div class="container" v-for="(container, index) in containers" :key="index">
        <div class="item" v-for="(item, idx) in container.items" :key="idx">
          {{ item }}
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script>
export default {
  data() {
    return {
      userAvatar: "https://via.placeholder.com/40", // 默认用户头像
      containers: [
        { items: ["Item 1-1", "Item 1-2", "Item 1-3"] },
        { items: ["Item 2-1", "Item 2-2", "Item 2-3"] },
        { items: ["Item 3-1", "Item 3-2", "Item 3-3"] },
      ],
    };
  },
  methods: {
    handleLogout() {
      console.log("Logout clicked");
      // 实现退出逻辑，例如跳转到登录页
    },
  },
};
</script>

<style scoped>
/* 上边栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #001529;
  color: white;
  padding: 0 24px;
}

.header-left h1 {
  color: white;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 主体内容样式 */
.content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px; /* 容器间的间距 */
}

/* 容器样式 */
.container {
  display: flex;
  flex-direction: row;
  gap: 16px; /* 容器内部元素间的间距 */
  background: #f0f2f5;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item {
  background: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  flex: 1; /* 自动分配可用空间 */
  text-align: center;
}
</style>
