/**
 * 应用文本常量
 * 统一管理所有硬编码文本，便于未来国际化
 */

export const APP_TEXT = {
  // 通用
  common: {
    loading: "加载中...",
    error: "错误",
    success: "成功",
    confirm: "确认",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    submit: "提交",
    search: "搜索",
    filter: "筛选",
    sort: "排序",
    more: "更多",
    less: "收起",
    viewAll: "查看全部",
    noData: "暂无数据",
    retry: "重试",
  },

  // 排序选项
  sort: {
    relevance: "相关度",
    trending: "热门",
    latestArrivals: "最新上架",
    priceLowToHigh: "价格从低到高",
    priceHighToLow: "价格从高到低",
  },

  // 购物车
  cart: {
    title: "购物车",
    empty: "购物车是空的",
    addToCart: "加入购物车",
    outOfStock: "缺货",
    selectOption: "请选择规格",
    quantity: "数量",
    subtotal: "小计",
    total: "总计",
    checkout: "去结算",
    continueShopping: "继续购物",
    remove: "移除",
    update: "更新",
  },

  // 商品
  product: {
    details: "商品详情",
    specifications: "规格参数",
    reviews: "用户评价",
    description: "商品描述",
    price: "价格",
    compareAtPrice: "原价",
    inStock: "有货",
    outOfStock: "缺货",
    addToCart: "加入购物车",
    buyNow: "立即购买",
    selectVariant: "选择规格",
  },

  // 账户
  account: {
    profile: "个人信息",
    addresses: "收货地址",
    coupons: "优惠券",
    surveys: "我的审核",
    membership: "会员权益",
    orders: "订单管理",
    logout: "退出登录",
    login: "登录",
    register: "注册",
  },

  // 认证
  auth: {
    login: "登录",
    register: "注册",
    logout: "退出",
    email: "邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    forgotPassword: "忘记密码？",
    rememberMe: "记住我",
    noAccount: "还没有账号？",
    hasAccount: "已有账号？",
    loginNow: "立即登录",
    registerNow: "立即注册",
  },

  // 结算
  checkout: {
    title: "结算",
    shippingAddress: "收货地址",
    paymentMethod: "支付方式",
    orderSummary: "订单摘要",
    placeOrder: "提交订单",
    processing: "处理中...",
    success: "支付成功",
    failed: "支付失败",
    prescriptionReview: "处方审核",
  },

  // 订单
  order: {
    orderNumber: "订单号",
    orderDate: "下单时间",
    orderStatus: "订单状态",
    orderTotal: "订单总额",
    viewDetails: "查看详情",
    trackShipment: "物流追踪",
    cancelOrder: "取消订单",
    reorder: "再次购买",
  },

  // 错误消息
  errors: {
    generic: "操作失败，请稍后重试",
    network: "网络连接失败，请检查网络",
    notFound: "未找到相关内容",
    unauthorized: "请先登录",
    forbidden: "没有权限访问",
    validation: "请检查输入信息",
    serverError: "服务器错误，请稍后重试",
  },

  // 成功消息
  success: {
    saved: "保存成功",
    deleted: "删除成功",
    updated: "更新成功",
    added: "添加成功",
    submitted: "提交成功",
  },

  // Toast 持续时间配置
  toastDuration: {
    short: 3000,
    medium: 4500,
    long: 6000,
  },
} as const;

export type AppTextKey = keyof typeof APP_TEXT;
