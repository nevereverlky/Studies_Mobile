const HTTP = require('../../../../utils/http.js')

Page({
  data: {
    stepList: {
      current: 0,
      names: ['基本信息', '证书上传', '证书信息', '补充信息']
    },

    submitData: {
      certificateType: 'SKILL',
      certificatePublishDate: '2020-08',              //发证时间(Y-M)
      expirationDate: '2020-08',                      //有效时间(Y-M)

      //***-------------- STEP1 --------------****//
      certificateName: '',                            //证书名称
      rank: '',                                       //证书等级
      certificatePublishTime: '',                     //发证时间戳(ms)

      //***-------------- STEP2 --------------****//
      pictureUrl: '',                                 //证书图片

      //***-------------- STEP3 --------------****//
      certificateNumber: '',                          //证书编号
      expirationTime: '',                             //有效时间戳(ms)

      extInfo: {
        //***-------------- STEP4 --------------****//
        description: '',                              //全部信息
      }
    },
  },

  onLoad: function () {
    var that = this
    var tmpData = that.data
    var submitData = that.data.submitData
    var nowTime = new Date()
    var nowYear = nowTime.getFullYear()
    var nowMonth = (nowTime.getMonth() + 1) < 10 ? '0' + (nowTime.getMonth() + 1).toString() : (nowTime.getMonth() + 1).toString()

    // 默认发证时间
    submitData.certificatePublishDate = nowYear + '-' + nowMonth
    submitData.certificatePublishTime = (new Date(nowTime.getFullYear(), nowTime.getMonth())).getTime()
    that.setData({ ['submitData.certificatePublishDate']: tmpData.submitData.certificatePublishDate })
    // 默认有效时间
    submitData.expirationDate = nowYear + '-' + nowMonth
    submitData.expirationTime = (new Date(nowTime.getFullYear(), nowTime.getMonth())).getTime()
    that.setData({ ['submitData.expirationDate']: tmpData.submitData.expirationDate })

  },
  // 手动滑动
  changeByHand: function (s) { this.setData({ ["stepList.current"]: s.detail.current }) },

  // 步骤切换
  changeStep: function (kk) {
    var that = this
    var resPage = that.data.stepList.current

    if (kk.currentTarget.dataset.type == "back") {
      resPage--
    } else {
      if (resPage == that.data.stepList.names.length - 1) {
        that.checkItems()
        return
      } else { resPage++ }
    }
    that.setData({ ['stepList.current']: resPage })
  },

  /**
   * ****---------------------------- STEP1 ----------------------------****
   */
  // 更新证书名称
  updateCertName: function (s) { this.setData({ ['submitData.certificateName']: s.detail.value }) },
  // 更新证书等级
  updateCertRank: function (s) { this.setData({ ['submitData.rank']: s.detail.value }) },
  // 选择发证时间
  updateDate: function (s) {
    var that = this
    var certDate = that.data.submitData.certificatePublishDate.split("-")
    var certTime = new Date(certDate[0], certDate[1] - 1).getTime()
    that.setData({ ['submitData.certificatePublishDate']: s.detail.value, ['submitData.certificatePublishTime']: certTime })
  },
  /**
   * ****---------------------------- STEP2 ----------------------------****
   */
  // 选择图片
  chooseImage() {
    var that = this
    HTTP.UPLOADIMG(function (s) { that.setData({ ['submitData.pictureUrl']: s.data.path }) })
  },
  // 删除图片
  delImg: function () {
    var that = this
    wx.showModal({ content: '确定要删除吗？', success: res => { if (res.confirm) { that.setData({ ['submitData.pictureUrl']: null }) } } })
  },

  /**
   * ****---------------------------- STEP3 ----------------------------****
   */
  // 更新证书编号
  updateCertNum: function (s) { this.setData({ ['submitData.certificateNumber']: s.detail.value }) },
  // 选择有效时间
  updateEndDate: function (s) {
    var that = this
    var certDate = that.data.submitData.expirationDate.split("-")
    var certTime = new Date(certDate[0], certDate[1] - 1).getTime()
    that.setData({ ['submitData.expirationDate']: s.detail.value, ['submitData.expirationTime']: certTime })
  },

  /**
   * ****---------------------------- STEP4 ----------------------------****
   */
  // 更新证书详情
  updateTextarea: function (s) { this.setData({ ['submitData.extInfo.description']: s.detail.value }) },


  // 检查是否填写完整
  checkItems: function () {
    var that = this
    var submitData = that.data.submitData

    // 检测字符是否有问题
    if (
      submitData.certificateName == "" ||
      submitData.rank == "" ||
      submitData.certificatePublishTime == ""
    ) {
      wx.showToast({ title: '1.请检查第一步必填项\n2.请检查是否出现特殊字符', icon: "none" })
      that.setData({ ['stepList.current']: 0 })
      return
    }

    if (
      submitData.pictureUrl == "" ||
      submitData.pictureUrl == null
    ) {
      wx.showToast({ title: '1.请检查第二页证书图片\n2.请检查是否出现特殊字符', icon: "none" })
      that.setData({ ['stepList.current']: 1 })
      return
    }
    if (
      submitData.certificateNumber == "" ||
      submitData.expirationTime == ""
    ) {
      wx.showToast({ title: '1.请检查第三步必填项\n2.请检查是否出现特殊字符', icon: "none" })
      that.setData({ ['stepList.current']: 2 })
      return
    }
    if (
      // submitData.extInfo.description == ""
      0
    ) {
      wx.showToast({ title: '1.请检查第四步必填项\n2.请检查是否出现特殊字符', icon: "none" })
      that.setData({ ['stepList.current']: 3 })
      return
    }

    that.confirmSubmit()
  },

  // 提交数据(检测通过)
  confirmSubmit: function () {
    var that = this
    that.data.submitData.extInfo.realName = getApp().globalData.userInfo.realName

    wx.showLoading({ title: '请稍后', mask: true })

    HTTP.POST_json(
      '/certificate/create',
      that.data.submitData,
      function (res) {
        wx.showToast({ title: '创建成功', mask: true })

        const nowPage = getCurrentPages()
        const backPage = nowPage[nowPage.length - 2]
        backPage.data.refreshState = true


        HTTP.subscribeMsg(
          'i6pErfUiZ1p4iycqGuHTBfbgMd3LtT9_oObbXS_-faI',
          function (s) {
            setTimeout(function () { wx.navigateBack() }, 1000)
          }
        )
      },
      function () {
        wx.showToast({ title: '创建失败', icon: 'none', mask: true })
      }
    )
  },

})