<template xmlns:el-col="http://www.w3.org/1999/html">
  <a-layout>
    <!-- 上边栏 -->
    <a-page-header
        class="page-header"
        style="border: 1px solid rgb(235, 237, 240)"
        title="Dashboard"
        sub-title="在这里您可以查看、验证您的用户信息并发起转账和收款。"
    >
      <template #extra>
        <a-button key="1" type="primary" danger ghost>Log out</a-button>
      </template>
    </a-page-header>

    <a-layout-content class="content">
      <el-dialog
          title="验证银行卡"
          v-model:visible="dialogOfcardVerifyVisible"
          width="30%"
          center
      >
        <span>请输入邮箱验证码：</span>
        <el-input v-model="emailCode" placeholder="请输入验证码"></el-input>
        <template v-slot:footer>
      <el-button @click="dialogOfcardVerifyVisible = false">取消</el-button>
      <el-button type="primary" @click="verifyCodeAndUpdateStatus">提交</el-button>
        </template>

      </el-dialog>
      <div class="container-a">
        <div class="container-b">
          <a-card hoverable style="width: 30%;height: 45vh">
            <template #cover>
              <div class="card-cover">
                <img src="@/assets/info-card-3.jpg" alt="Background" class="background-image" />
                <div class="card-number">{{ main_card.card_num }}</div>
                <img src="@/assets/upay.png" alt="UnionPay Logo" class="card-logo" />
              </div>
            </template>

            <a-card-meta>
              <template #title>
                <div style="display: flex; align-items: center;">
                  <span>Main Card</span>
                  <!-- 在这里插入之前用于根据状态渲染tag的部分 -->
                  <template v-if="main_card">
                    <a-tag
                        v-if="main_card.card_status === 0"
                        color="green"
                        :key="0"
                        class="tag-margin"
                    >状态正常</a-tag>
                    <a-tag
                        v-else-if="main_card.card_status === 1"
                        color="blue"
                        @click="handleVerifyClick(main_card.card_num)"
                        :key="1"
                        class="tag-margin"
                    >点此验证</a-tag>
                    <a-tag
                        v-else
                        color="red"
                        :key="2"
                        class="tag-margin"
                    >出现异常</a-tag>
                  </template>
                </div>
              </template>
              <template #description>
                <span>默认收支的主银行卡</span>
              </template>
            </a-card-meta>
          </a-card>
          <div style="width: 20%; height: 45vh;">
            <el-row style="height: 45vh; display: flex; flex-direction: column; justify-content: space-between;">
              <a-card hoverable class="trans_card_style" @click="handleTransClick">
                <p>处理请求</p>
              </a-card>
              <a-card hoverable class="pay_card_style" @click="handlePayClick">
                <p>发起转账</p>
              </a-card>
              <a-card hoverable class="fetch_card_style" @click="handleFetchClick">
                <p>发起收款</p>
              </a-card>
            </el-row>
          </div>

          <el-row style="height: 45vh; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="height: 22.5vh;">
            <el-table
                :data="tableData"
                style="width: 100%; height: 100%; max-height: 100%;">
              <el-table-column
                  prop="card_num"
                  label="卡号"
                  width="180">
              </el-table-column>
              <el-table-column
                  prop="status"
                  label="卡状态"
                  width="120">
                <template v-slot="scope">
                  <el-tag
                      v-if="scope.row.status!== '点此验证'"
                  :type="scope.row.status === '状态正常'? 'success' : 'warning'"
                  disable-transitions>{{scope.row.status}}
                  </el-tag>
                  <el-button v-else @click="handleVerifyClick(scope.row.card_num)" type="text" :class="['tag-button', scope.row.status === '点此验证'? 'verify-button' : '']"> <!-- 当tag等于1时，显示为可点击的按钮 -->
                    点此验证
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                  prop="bank"
                  label="所属银行"
                  width="150">
              </el-table-column>
            </el-table>

          </div>
            <div style="height: 22.5vh;">
              <el-table
                  :data="tableData_trans"
                  style="width: 100%; height: 100%; max-height: 100%;">
                <el-table-column
                    prop="trans_num"
                    label="事务流水号"
                    width="180">
                </el-table-column>
                <el-table-column
                    prop="status"
                    label="事务状态"
                    width="120">
                  <template v-slot="scope">
                    <el-tag
                        v-if="scope.row.status === 'pending'"
                        type="info"
                        disable-transitions
                    >{{scope.row.status}}
                    </el-tag>
                    <el-tag
                        v-else-if="scope.row.status === 'expired'"
                        type="warning"
                        disable-transitions
                    >{{scope.row.status}}
                    </el-tag>
                    <el-tag
                        v-else-if="scope.row.status === 'complete'"
                        type="success"
                        disable-transitions
                    >{{scope.row.status}}
                    </el-tag>
                    <el-tag v-else type="default" disable-transitions>{{scope.row.status}}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="info"
                    label="详细信息"
                    width="150">
                  <template v-slot="scope">
                    <el-button
                        type="primary"
                        :class="['detail-button', scope.row.status === 'pending'? 'pending-button' : '']"
                        @click="handleGetDetail(scope.row.trans_num)"
                    >查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-row>

          <div style="height: 45vh">
            <el-row style="height: 45vh; display: flex; flex-direction: column; justify-content: space-between;">
              <a-card class="summary">
                <a-statistic
                    title="月度交易笔数"
                    :value="116"
                    :value-style="{ color: '#267af1' }"
                    style="margin-right: 50px"
                >
                  <template #prefix>
                    <arrow-up-outlined />
                  </template>
                </a-statistic>
              </a-card>
              <a-card class="summary">
                <a-statistic
                    title="月度收款总额"
                    :value="622"
                    :precision="2"
                    suffix="$"
                    :value-style="{ color: '#3f8600' }"
                    style="margin-right: 50px"
                >
                  <template #prefix>
                    <arrow-up-outlined />
                  </template>
                </a-statistic>
              </a-card>
              <a-card class="summary">
                <a-statistic
                    title="月度转出总额"
                    :value="255"
                    :precision="2"
                    suffix="$"
                    :value-style="{ color: '#c94141' }"
                    style="margin-right: 50px"
                >
                  <template #prefix>
                    <arrow-up-outlined />
                  </template>
                </a-statistic>
              </a-card>
            </el-row>
          </div>


        </div>

      </div>
    </a-layout-content>
  </a-layout>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      dialogOfcardVerifyVisible: false,
      tableData: [{
        card_num: '1111111111111111',
        status: '状态正常',
        bank: '志邈银行'
      },
        {
          card_num: '1111111111111111',
          status: '状态异常',
          bank: '志邈银行'
        },
        {
          card_num: '1111111111111111',
          status: '点此验证',
          bank: '志邈银行'
        },
        {
          card_num: '1111111111111111',
          status: '点此验证',
          bank: '志邈银行'
        }],
      tableData_trans:[{trans_num: '1234567890', status: 'pending'},
        {trans_num: '1234567890', status: 'expired'},
        {trans_num: '1234567890', status: 'complete'}],
      main_card: { 'card_prio': 0, 'card_num': '0000000000000000', 'card_status': 1 },
      other_cards: [
        { 'card_prio': 1, 'card_num': '1111111111111111', 'card_status': 0 },
        { 'card_prio': 1, 'card_num': '2222222222222222', 'card_status': 1 },
        { 'card_prio': 1, 'card_num': '2222222222222222', 'card_status': 2 },
      ]
    };
  },
  mounted() {
    //组件第一次挂载时，向后端发送请求获取一次原始信息，然后每三十秒获取一次
    this.fetchData(); // 在组件挂载时先执行一次获取数据的逻辑
    this.intervalId = setInterval(() => {
      this.fetchData(); // 每30秒执行一次获取数据的逻辑
    }, 30000); // 时间间隔为30秒，单位是毫秒
  },
  beforeUnmount() {
    clearInterval(this.intervalId); // 在组件销毁前清除定时器，避免内存泄漏
  },
  methods: {
    fetchData() {
      axios.get('/api/getTransactionData') // 根据实际后端接口调整URL
          .then((response) => {
            this.tableData_trans = response.data;
          })
          .catch((error) => {
            console.error('获取事务数据出错：', error);
          });
    },
    handleVerifyClick(cardNum) {
      console.log(cardNum)
      this.dialogOfcardVerifyVisible=true
    },
    handleLogout() {
      console.log('Logout clicked');
    },
    handlePayClick() {
      console.log('点击了发起转账卡片');
    },
    handleFetchClick() {
      console.log('点击了发起收款卡片');
    },
    handleTransClick(){

    },
    handleGetDetail(transNum) {
      console.log(transNum)
    }
  }
};

</script>

<style scoped>
.tag-button {


  cursor: pointer; /* 设置鼠标指针为手型，提示可点击 */
}

.verify-button {
  color: #2479f3; /* 可以根据需求设置特定的颜色，让其更醒目 */
}

.trans_card_style {
  width: 100%;
  height: 15vh;
  background: #f14444; /* 清新绿色背景 */
  color: white; /* 文字颜色设为白色 */
  display: flex;
  justify-content: center; /* 水平居中内容 */
  align-items: center; /* 垂直居中内容 */
}

.pay_card_style {
  width: 100%;
  height: 15vh;
  background: orange; /* 橘橙色背景 */
  color: white; /* 文字颜色设为白色，使其在橘橙色背景上更清晰 */
  display: flex;
  justify-content: center; /* 水平居中内容 */
  align-items: center; /* 垂直居中内容 */
}

.fetch_card_style {
  width: 100%;
  height: 15vh;
  background: #3fb63f; /* 清新绿色背景 */
  color: white; /* 文字颜色设为白色 */
  display: flex;
  justify-content: center; /* 水平居中内容 */
  align-items: center; /* 垂直居中内容 */
}
.trans_card_style p,
.pay_card_style p,
.fetch_card_style p {
  font-size: 2.5vw; /* 根据视口宽度动态调整文字大小，这里设置为视口宽度的2.5%，你可以按需调整数值 */
  font-weight: bold; /* 设置文字加粗 */
  font-family: Arial, Helvetica, sans-serif; /* 设置字体，可根据喜好和项目要求替换 */
  margin: 0; /* 去除默认的段落 margin，确保文字居中效果更好 */
}


.custom-row-height {
  height: 30vh; /* 使用视口高度的50%作为el-row的高度，可根据需求调整比例 */
  flex: 1;
  display: flex;
}
.tag-margin {
  margin-left: 8px; /* 同样可以按需调整此数值来改变间隔大小 */
}
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
}

/* 大容器A样式 */
.container-a {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 16px; /* 小容器间的间距 */
}

/* 小容器B样式 */
.container-b {
  display: flex;
  flex-direction: row; /* 水平排列 */
  gap: 16px; /* 卡片间的间距 */
  background: #f0f2f5;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

/* 卡片样式 */
.card {
  flex: 1; /* 平均分配空间 */
  background: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  height: auto;
}

.card-cover {
  position: relative; /* 保证子元素绝对定位 */
  width: 100%;
  padding-top: 56.25%; /* 宽高比固定为 16:9 */
  overflow: hidden; /* 确保背景图片不溢出 */
  border-radius: 4px; /* 可选：与卡片保持一致的圆角 */
}

/* 背景图片样式 */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片覆盖整个区域 */
  border-radius: 4px; /* 与父容器一致的圆角 */
}

/* Logo 样式 */
.card-logo {
  position: absolute;
  bottom: 8%; /* 距离底部的比例 */
  right: 8%; /* 距离右侧的比例 */
  width: 15%; /* Logo 占背景宽度的百分比 */
  height: auto; /* 自动调整高度以保持比例 */
  z-index: 1; /* 确保 Logo 显示在背景图片上方 */
}

.card-number {
  position: absolute;
  top: 20%; /* 距离顶部的比例 */
  left: 50%; /* 左侧偏移到 50% */
  transform: translateX(-50%); /* 将元素自身向左平移一半宽度，达到居中效果 */
  font-size: calc(1vw + 1vh); /* 根据视口大小动态调整字体大小 */
  font-weight: bold;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap; /* 防止换行 */
  text-align: center;
}

.summary {
  flex: 1; /* 平均分配空间 */
  background: white;
  padding: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  white-space: nowrap; /*避免换行*/
  height: 30%
}
</style>