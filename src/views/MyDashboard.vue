<template xmlns:el-col="http://www.w3.org/1999/html">
  <a-layout>
    <!-- 上边栏 -->
    <a-page-header
        class="page-header"
        style="border: 1px solid rgb(235, 237, 240)"
        :title="`Dashboard - ${nowUser}`"
        sub-title="在这里您可以查看、验证您的用户信息并发起转账和收款。"
    >
      <template #extra>
        <a-button key="1" type="primary" @click="handleLogout" danger ghost>Log out</a-button>
        <el-button @click="handleAddCard()" type="primary">
                    添加卡
        </el-button>
      </template>
    </a-page-header>

    <a-layout-content class="content">
      <el-dialog
          :title="`验证银行卡 - ${last_op_card || ''}`"
          v-model="dialogOfcardVerifyVisible"
          width="30%"
          center
      >
        <span>请输入邮箱验证码：</span>
        <el-input v-model="emailCode" placeholder="请输入验证码"></el-input>
        <template v-slot:footer>
          <el-button @click="dialogOfcardVerifyVisible = false">取消</el-button>
          <el-button type="primary" @click="verifyCodeAndUpdateStatus(last_op_card)">提交</el-button>
        </template>
      </el-dialog>
      
      <el-dialog
        :title="`发起转账 - ${nowUser}`"
        v-model="dialogOfPayVisible"
        width="30%"
        center
      >
        <span>转账信息：</span>
        <el-form :model="payForm" :rules="rules" ref="payForm" label-width="120px" @submit.prevent="handlePaySubmit">
          <el-form-item label="收款方信息类型" prop="payeeType">
            <el-radio-group v-model="payForm.payeeType">
              <el-radio label="email">邮箱</el-radio>
              <el-radio label="phone">电话号码</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="收款方信息" prop="infoPayee">
            <el-input v-model="payForm.infoPayee" :placeholder="payForm.payeeType === 'email' ? '请输入收款方邮箱' : '请输入收款方电话号码'"></el-input>
          </el-form-item>
          <el-form-item label="转账金额" prop="amount">
            <el-input v-model="payForm.amount" placeholder="转账金额"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="memo">
            <el-input v-model="payForm.memo" placeholder="备注(可选)"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" block @click="handlePaySubmit">提交转账</el-button>
            <el-button @click="dialogOfPayVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog
        title="转账信息"
        v-model="payOutVisible"
        width="30%"
        center
      >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="转账编号">{{ payOutForm.p_id }}</el-descriptions-item>
        <el-descriptions-item label="发送方 ID">{{ payOutForm.p_sender_id }}</el-descriptions-item>
        <el-descriptions-item label="接收方 ID">{{ payOutForm.p_recipient_id }}</el-descriptions-item>
        <el-descriptions-item label="收款方信息">{{ payOutForm.p_recipient_email_or_phone }}</el-descriptions-item>
        <el-descriptions-item label="收款方类型">{{ payOutForm.p_recipient_type }}</el-descriptions-item>
        <el-descriptions-item label="转账金额">{{ parseFloat(payOutForm.p_amount).toFixed(2) }} $</el-descriptions-item>
        <el-descriptions-item label="备注">{{ payOutForm.p_memo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ payOutForm.p_status }}</el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ payOutForm.p_initiated_at }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ payOutForm.p_completed_at }}</el-descriptions-item>
        <el-descriptions-item label="取消原因">{{ payOutForm.p_cancellation_reason }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="payOutVisible = false">关闭</el-button>
      </template>
      </el-dialog>

      <el-dialog
        title="收款信息"
        v-model="fetchOutVisible"
        width="30%"
        center
      >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="收款编号">{{ fetchOutForm.f_id }}</el-descriptions-item>
        <el-descriptions-item label="需求方 ID">{{ fetchOutForm.f_requester_id }}</el-descriptions-item>
        <el-descriptions-item label="付款方 ID">{{ fetchOutForm.f_recipient_id }}</el-descriptions-item>
        <el-descriptions-item label="付款方信息">{{ fetchOutForm.f_recipient_email_or_phone }}</el-descriptions-item>
        <el-descriptions-item label="收款金额">{{ parseFloat(fetchOutForm.f_amount).toFixed(2) }} $</el-descriptions-item>
        <el-descriptions-item label="备注">{{ fetchOutForm.f_memo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ fetchOutForm.f_status }}</el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ fetchOutForm.f_initiated_at }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ fetchOutForm.f_completed_at }}</el-descriptions-item>
      </el-descriptions>
        <div v-for="(payer, index) in fetchOutForm.f_extraPayers" :key="index">
          <el-divider content-position="left">付款方 {{ index + 2 }}</el-divider>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收款编号">{{ payer.f_id }}</el-descriptions-item>
          <el-descriptions-item label="需求方 ID">{{ payer.f_requester_id }}</el-descriptions-item>
          <el-descriptions-item label="付款方 ID">{{ payer.f_recipient_id }}</el-descriptions-item>
          <el-descriptions-item label="收款金额">{{ parseFloat(payer.f_amount).toFixed(2) }} $</el-descriptions-item>
        </el-descriptions>
        </div>
      <template #footer>
        <el-button @click="fetchOutVisible = false">关闭</el-button>
      </template>
      </el-dialog>

      <el-dialog
      :title="`处理请求-${nowUser}`"
      v-model="dialogOfTransVisible"
      width="30%"
      center
      >
      <div v-for="(trans, index) in transForm" :key="index">
        <el-divider content-position="left">请求 {{ index + 1 }}</el-divider>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收款编号">{{ trans.t_id }}</el-descriptions-item>
          <el-descriptions-item label="需求方 ID">{{ trans.t_requester_id }}</el-descriptions-item>
          <el-descriptions-item label="付款方 ID">{{ trans.t_recipient_id }}</el-descriptions-item>
          <el-descriptions-item label="收款金额">{{ parseFloat(trans.t_amount).toFixed(2) }} $</el-descriptions-item>
          <el-descriptions-item label="备注">{{ trans.t_memo }}</el-descriptions-item>
        </el-descriptions>
        <el-button @click="handleTrans(index)" type="primary" center>
                    处理付款
        </el-button>
      </div>
      <template #footer>
        <el-button @click="dialogOfTransVisible = false">关闭</el-button>
      </template>
      </el-dialog>

      <el-dialog
      :title="`发起收款-${nowUser}`"
      v-model="dialogOfFetchVisible"
      width="30%"
      center
      >
        <span>收款信息：</span>
        <el-form :model="fetchForm" :rules="rules" ref="fetchForm" label-width="120px" @submit.prevent="handlePaySubmit">
          <el-form-item label="付款方信息类型" prop="fetcheeType">
            <el-radio-group v-model="fetchForm.fetcheeType">
              <el-radio label="email">邮箱</el-radio>
              <el-radio label="phone">电话号码</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="付款方信息" prop="infofetchee">
            <el-input v-model="fetchForm.infofetchee" :placeholder="fetchForm.fetcheeType === 'email' ? '请输入付款方邮箱' : '请输入付款方电话号码'"></el-input>
          </el-form-item>
          <el-form-item label="收款金额" prop="amount">
            <el-input v-model="fetchForm.amount" placeholder="收款金额"></el-input>
          </el-form-item>
          <el-form-item label="添加">
            <el-button type="primary" @click="addNewPayer">+</el-button>
          </el-form-item>
            <div v-for="(payer, index) in fetchForm.extraPayers" :key="index">
              <el-divider content-position="left">付款方 {{ index + 2 }}</el-divider>
                <el-form-item label="付款方信息类型">
                  <el-radio-group v-model="payer.fetcheeType">
                    <el-radio label="email">邮箱</el-radio>
                    <el-radio label="phone">电话号码</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="付款方信息" :prop="`extraPayers[${index}].infofetchee`" :rules="dynamicRules[index]?.infofetchee">
                  <el-input v-model="payer.infofetchee" :placeholder="payer.fetcheeType === 'email' ? '请输入付款方邮箱' : '请输入付款方电话号码'"></el-input>
                </el-form-item>
                <el-form-item label="收款金额">
                  <el-input v-model="payer.amount" placeholder="收款金额"></el-input>
                </el-form-item>
                <el-form-item label="删除">
                  <el-button type="danger" @click="removePayer(index)">-</el-button>
                </el-form-item>
            </div>
          <el-form-item label="备注" prop="memo">
            <el-input v-model="fetchForm.memo" placeholder="备注(可选)"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" block @click="handleFetchSubmit">提交收款</el-button>
            <el-button @click="dialogOfFetchVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <el-dialog
        :title="`事务详情 ${queryForm.q_id}`"
        v-model="dialogOfQuery"
        width="30%"
        center
      >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="发送方 ID">{{ queryForm.q_sender }}</el-descriptions-item>
        <el-descriptions-item label="接收方 ID">{{ queryForm.q_receiver }}</el-descriptions-item>
        <el-descriptions-item label="事务类型">{{ queryForm.q_type }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ parseFloat(queryForm.q_amount).toFixed(2) }} $</el-descriptions-item>
        <el-descriptions-item label="备注">{{ queryForm.q_memo }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ queryForm.q_status }}</el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ queryForm.q_initiated_at }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ queryForm.q_completed_at }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogOfQuery = false">关闭</el-button>
      </template>
      </el-dialog>

      <el-dialog
        title="银行卡信息，首次添加默认主卡"
        v-model="dialogOfAddCard"
        width="30%"
        center
      >
        <span>银行卡信息</span>
        <el-form :model="addCardData" label-width="120px" @submit.prevent="addCard">
          <el-form-item label="银行名称" prop="amount">
            <el-input v-model="addCardData.a_bank_id" placeholder="银行名称"></el-input>
          </el-form-item>
          <el-form-item label="卡号" prop="memo">
            <el-input v-model="addCardData.a_account_num" placeholder="卡号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" block @click="addCard">添加</el-button>
            <el-button @click="dialogOfAddCard = false">取消</el-button>
          </el-form-item>
        </el-form>
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
                    :value="stats.transCount"
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
                    :value="stats.totalReceived"
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
                    :value="stats.totalTransferred"
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
import axios from "@/api/axios"; // 导入 Axios 实例

export default {
  data() {
    return {
      dialogOfcardVerifyVisible: false,
      dialogOfPayVisible: false,
      dialogOfFetchVisible: false,
      dialogOfTransVisible: false,
      dialogOfQuery: false,
      dialogOfAddCard: false,
      payOutVisible: false,
      fetchOutVisible: false,
      tableData: [],
        // 状态正常 | 点此验证
        // {
        //   card_num: '1111111111111111',
        //   status: '状态正常',
        //   bank: '志邈银行'
        // },
      tableData_trans:[],
        // { trans_num: '1234567890', status: 'expired'},
      main_card: {},
        // 0 正常 1 验证 其他 异常
        // { 'card_prio': 0, 'card_num': '0000000000000000', 'card_status': 1 }
      other_cards: [],
        // { 'card_prio': 1, 'card_num': '1111111111111111', 'card_status': 0 }
      stats: {
        transCount: 0, //月度交易笔数
        totalReceived: 0.0, //收款总额
        totalTransferred: 0.0 //转出总额
        },
      last_op_card: -1,  // 保存上次操作的card_number
      emailCode: '',     // 保存中间输入
      nowUser: 'None',   // 保存当前用户
      payForm: {
        infoPayee: '',
        payeeType: 'email',
        amount: '',
        memo: ''
      },
      payOutForm: {
        p_id: '1',
        p_sender_id: '2',
        p_recipient_id: '3',
        p_recipient_email_or_phone: '4',
        p_recipient_type: '5',
        p_amount: '10',
        p_memo: '6',
        p_status: '7',
        p_initiated_at: '8',
        p_completed_at: '9',
        p_cancellation_reason: '0'
      },
      fetchForm: {
        infofetchee: '',
        fetcheeType: 'email',
        amount: '',
        memo: '',
        extraPayers: []
      },
      fetchOutForm: {
        f_id: '1',
        f_requester_id: '2',
        f_recipient_id: '3',
        f_recipient_email_or_phone: '4',
        f_amount: '5',
        f_memo: '6',
        f_status: '7',
        f_initiated_at: '8',
        f_completed_at: '9',
        f_extraPayers: []
      },
      transForm: [
      {t_id: '1', t_requester_id: '2', t_recipient_id: '3', t_amount: '4', t_memo: '5'},
      {t_id: '2', t_requester_id: '3', t_recipient_id: '4', t_amount: '5', t_memo: '6'}
      ],
      queryForm: {
        q_id: '0',
        q_sender: '1',
        q_receiver: '2',
        q_type: 'payment',
        q_amount: '3',
        q_memo: '4',
        q_status: '5',
        q_initiated_at: '6',
        q_completed_at: '7'
      },
      addCardData: {
        a_bank_id: '',
        a_account_num: '',
      },
      rules: {
        infoPayee: [
          { required: true, message: '收款方不能为空', trigger: 'blur'},
          { 
            validator: (rule, value, callback) => {
              this.typeCheck(rule, value, callback, this.payForm.payeeType);
            },
            trigger: 'blur'
          }
        ],
        infofetchee: [
          { required: true, message: '付款方不能为空', trigger: 'blur'},
          { 
            validator: (rule, value, callback) => {
              this.typeCheck(rule, value, callback, this.fetchForm.fetcheeType);
            },
            trigger: 'blur'
          }
        ]
      },
      dynamicRules: []
    };
  },
  mounted() {
    //检查是否有登录
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const userInfo = JSON.parse(loggedInUser);
      this.nowUser = userInfo.username;
    } else {
      this.$router.push("/");
    }
    //组件第一次挂载时，向后端发送请求获取一次原始信息，然后每三十秒获取一次
    this.fetchTransData(); // 在组件挂载时先执行一次获取数据的逻辑
    this.fetchCardData();
    this.fetchStatisticalData();
    this.intervalId = setInterval(() => {
      this.fetchTransData(); // 每30秒执行一次获取数据的逻辑
      this.fetchCardData();
      this.fetchStatisticalData();
    }, 30000); // 时间间隔为3秒，单位是毫秒
  },
  beforeUnmount() {
    clearInterval(this.intervalId); // 在组件销毁前清除定时器，避免内存泄漏
  },
  methods: {
    fetchTransData() {
      axios.post('/qry/getTransactionData', this.nowUser, {headers: {'Content-Type': 'text/plain'}}) // 根据实际后端接口调整URL
        // 发回的数据包格式
          .then((response) => {
            this.tableData_trans = response.data;
          })
          .catch((error) => {
            //this.$message.error("获取事务数据出错" + error.message);
            console.error('-', error);
          });
    },

    fetchCardData(){
      axios.post('/qry/getCardData', this.nowUser, {headers: {'Content-Type': 'text/plain'}}) // URL至后端
        .then((response) => {
          const data = response.data;
          // 从后端返回的数组中提取数据
          if(response.status === 201){
            this.$message.error("请注意添加卡片");
          }
          else{
            this.main_card = data[0] || {}; // 主卡信息
            this.tableData = data[1] || []; // 表格数据
            this.other_cards = data[2] || {}; // 其他信息
          }
        })
        .catch((error) => {
          //this.$message.error("获取卡数据出错" + error.message);
          console.error('-', error);
        });
    },

    fetchStatisticalData(){
      axios.post('/qry/getMonthlyStats', this.nowUser) // URL至后端
        .then((response) => {
          const { transCount, totalReceived, totalTransferred } = response.data;
          this.stats.transCount = transCount
          this.stats.totalReceived = totalReceived
          this.stats.totalTransferred = totalTransferred
        })
        .catch((error) => {
          //this.$message.error("获取统计数据出错" + error.message);
          console.error('-', error);
        });
    },

    handleVerifyClick(cardNum) {
      console.log(cardNum);
      this.last_op_card = cardNum;
      this.dialogOfcardVerifyVisible=true;
    },

    verifyCodeAndUpdateStatus(cardNum) {
      this.emailCode = ''
      axios.post('/api/verifyCardStatus', {
        cardNum: cardNum
      }) // URL至后端
      .then((response) => {
      // 处理成功响应
      if (response.data.success) {
        this.$message.success("银行卡验证成功");
        this.dialogOfcardVerifyVisible = false; // 关闭对话框
        this.fetchCardData(); // 更新卡片状态
      } else {
        this.$message.error(response.data.message || "验证码错误，请重试");
      }
      })
      .catch((error) => {
        alert('银行卡状态更新失败：' + error.message);
      });
    },

    handleLogout() {
      axios.post("/api/logout", this.nowUser) //URL
        .then(response => {
          if (response.status === 200){
            this.$message.success("登出成功！");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("token");
            this.$router.push("/");
          }else{
            this.$message.error("登出失败！");
          }
        })      
        .catch((error) => {
          this.$message.error("服务器错误" + error.message);
        });
    },

    handlePayClick() {
      // 转账
      console.log('点击了发起转账卡片');
      this.dialogOfPayVisible = true;
    },
    
    handleFetchClick() {
      // 发起收款
      console.log('点击了发起收款卡片');
      this.dialogOfFetchVisible = true;
    },

    handleTransClick(){
      // 处理请求
      console.log('点击了处理请求卡片');
      if(this.getRequest(this.nowUser)) {this.dialogOfTransVisible = true;}
    },

    getRequest(user) {
      // 获取与当前id有关的请求
      axios.post('/qry/getRequest', user)
      .then((response) => {
        if (response.status === 200) {
          this.transForm = response.data;
          if(response.data.length === 0) 
          { this.$message.error('暂无请求')
            return false;}
          return true;
        } else {
          this.$message.error('获取失败')
          return false;
        }
      })
      .catch((error) => {
        alert('请求错误 '+error.message);
        return false;
      })
    },

    handleGetDetail(transNum) {
      // 事务详情
      console.log(transNum);
      axios.post('/qry/getDetail', {
        User: this.nowUser,
        transNum: transNum
      })
      .then(response => {
        if(response.status === 200) {
          this.queryForm = response.data;
          this.dialogOfQuery = true;
        }else{
          this.$message.error("查询失败，请稍后重试");
        }
      })
      .catch((error) => {
        this.$message.error('服务器错误 '+error.message);
      })
    },

    handleAddCard() {
      // 添加银行卡
      console.log('点击了添加银行卡');
      this.dialogOfAddCard = true;
    },

    addCard() {
      axios.post('/req/addCard', {
        User: this.nowUser,
        CardData: this.addCardData
      })
      .then(response => {
        if(response.status === 200) {
          this.fetchCardData();
          this.dialogOfAddCard = false;
        }else{
          this.$message.error("添加失败，请检查信息后重试");
        }
      })
      .catch((error) => {
        this.$message.error('服务器错误 '+error.message);
      })
    },

    handleTrans(index) {
      // 处理事务
      console.log('点击了处理事务' + index);
      axios.post('/req/handleTrans', {
        User: this.nowUser,
        Trans: this.transForm[index]
      })
      .then(response => {
        if(response.status === 200) {
          this.$message.success("处理成功");
          this.getRequest(this.nowUser)
        }else{
          this.$message.error("处理失败，请检查你的余额或稍后重试");
        }
      })
      .catch((error) => {
        this.$message.error('服务器错误 '+error.message);
        return false;
      })
    },

    async handlePaySubmit() {
      //处理转账事务
      console.log('提交转账');
      this.$refs.payForm.validate((valid) => {
        if (valid) {
          axios.post("/req/paysubmit", {
          username: this.nowUser,
          payForm:  this.payForm
          })//URL
          .then(response => {
            if (response.status === 200){
              this.$message.success("转账成功");
              this.payOutForm = response.data;
              this.payOutVisible = true;
              this.dialogOfPayVisible = false;
            }else{
              this.$message.error("转账失败 "+response.data);
            }
          })
          .catch((error) => {
              this.$message.error("服务器错误 " + error.message);
          });
        } else {
          this.$message.error('请填写完整信息！');
        }
      });
    },

    handleFetchSubmit() {
      // 处理收款事务
      console.log('提交收款');
      if (this.fetchForm.extraPayers.length === 0) {
        // 处理单收款事务
        this.$refs.fetchForm.validate((valid) =>{
          if (valid) {
            axios.post("/req/singleFetch", {
              username: this.nowUser,
              fetchForm:this.fetchForm
            })//URL
            .then(response =>{
              if (response.status === 200){
                this.$message.success("收款成功");
                this.fetchOutForm = response.data;
                this.fetchOutVisible = true;
                this.dialogOfFetchVisible = false;
              }else{
                this.$message.error("转账失败 "+response.data)
              }
            })
            .catch((error) => {
              this.$message.error("服务器错误 "+ error.message)
            });
          }
          else {
            this.$message.error('请填写完整信息！');
          }
        });
      } 
      else {
        // 处理多收款任务
        this.$refs.fetchForm.validate((valid) => {
          if (valid) {
            const extraValidations = this.fetchForm.extraPayers.map((payer, index) => {
              return new Promise((resolve, reject) => {
                const rules = this.dynamicRules[index]?.infofetchee;
                if (!rules) {
                  resolve(true);
                  return;
                }
                this.$refs[`extraForm${index}`].validateField(`extraPayers[${index}].infofetchee`, (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(true);
                  }
                });
              });
            });

            Promise.all(extraValidations)
            .then(() => {
              axios.post("/req/multiFetch", {
                username: this.nowUser,
                fetchForm:this.fetchForm
              })//URL
              .then(response =>{
                if (response.status === 200){
                  this.$message.success("收款成功");
                  this.fetchOutForm = response.data;
                  this.fetchOutVisible = true;
                  this.dialogOfFetchVisible = false;
                }else{
                  this.$message.error("转账失败 "+response.data)
                }
              })
              .catch((error) => {
                this.$message.error("服务器错误 "+ error.message)
              });
            })
            .catch((error) => {
              this.$message.error("请检查付款方信息是否填写完整"+ error.message);
            });
          } else {
            this.$message.error("请检查表单信息是否填写完整");
          }
        });
      }
    },

    addNewPayer() {
      this.fetchForm.extraPayers.push({
      infofetchee: "",
      fetcheeType: "email",
      amount: ""});
      this.dynamicRules.push({
        infofetchee: [
        { required: true, message: "付款方不能为空", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              const index = this.dynamicRules.length - 1;
              this.typeCheck(rule, value, callback, this.fetchForm.extraPayers[index].fetcheeType);
            },
            trigger: "blur",
          },
        ],
      });
    },

    removePayer(index) {
      this.fetchForm.extraPayers.splice(index, 1);
      this.dynamicRules.splice(index, 1);
    },

    typeCheck(rule, value, callback, type) {
      if (type === 'email') {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!emailRegex.test(value)) {
          callback(new Error('请输入有效的邮箱地址'));
        } else {
          callback();
        }
      } else if (type === 'phone') {
        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(value)){
          callback(new Error('手机号必须为11位纯数字'));
        } else {
          callback();
        }
      } else {
        callback();
      }
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