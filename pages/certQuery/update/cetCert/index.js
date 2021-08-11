const HTTP = require('../../../../utils/http.js')

Page({

  data: {
    stepList: {
      current: 0,
      names: ['基本信息', '证书上传', '补充信息']
    },

    certType: {//证书类型
      current: 0,
      names: ['四级证书', '六级证书',],
      code: ['CET_4', 'CET_6']
    },

    submitData: {
      certificateType: "CET_4_6",                     //证书类型(主)
      certificatePublishDate: '2020-08',              //发证时间(Y-M)

      //***-------------- STEP1 --------------****//
      rank: '',                                       //证书小类(CET_4/CET_6)
      certificateGrade: '',                           //考试成绩(560)
      certificatePublishTime: '',                     //发证时间戳(ms)

      //***-------------- STEP2 --------------****//
      pictureUrl: '',                                 //证书图片

      extInfo: {
        //***-------------- STEP3 --------------****//
        description: '',                              //全部信息
      }
    }
  },

  onLoad: function (options) {
    var that = this

    var nowPage = getCurrentPages()
    var backPage = nowPage[nowPage.length - 2]

    // var oldData = JSON.parse(options.detail)
    var oldData = backPage.data
    var submitData = that.data.submitData


    that.setData({
      submitData: {
        certificateId: oldData.certificateId,

        certificateType: oldData.certificateType,              //证书类型(主)
        certificatePublishDate: '2020-08',              //发证时间(Y-M)

        //***-------------- STEP1 --------------****//
        rank: oldData.rank,                                       //证书小类(CET_4/CET_6)
        certificateGrade: oldData.certificateGrade,                           //考试成绩(560)
        certificatePublishTime: oldData.certificatePublishTime,                     //发证时间戳(ms)

        //***-------------- STEP2 --------------****//
        pictureUrl: oldData.pictureUrl,                                 //证书图片

        //***-------------- STEP3 --------------****//
        extInfo: oldData.extInfo,
      }
    })


    // 同步证书类型certType
    for (var i in that.data.certType.code) {
      if (that.data.certType.code[i] == oldData.rank) {
        that.setData({ ["certType.current"]: i })
        break
      }
    }

    // 同步发证时间
    var dateArr = oldData.certificatePublishTime.replace('年', '-').replace('月', '-').replace('日', '-').split('-')
    var tmpTimestamp = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]).getTime()
    var util = require('../../../../utils/newutil.js')
    that.setData({
      ["submitData.certificatePublishTime"]: tmpTimestamp,
      ["submitData.certificatePublishDate"]: util.timeStamp2Time(tmpTimestamp / 1000, 'Y-M')
    })
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

  // 证书类型更改
  typeChange: function (s) {
    var that = this
    var tmpTypeCode = that.data.certType.code[s.detail.value]
    that.setData({ ['certType.current']: s.detail.value, ['submitData.rank']: tmpTypeCode })
  },

  // 更新考试成绩
  updateCertRank: function (s) {
    this.setData({ ['submitData.certificateGrade']: s.detail.value })
  },

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
  // 更新证书详情
  updateTextarea: function (s) { this.setData({ ['submitData.extInfo.description']: s.detail.value }) },



  // 检查是否填写完整
  checkItems: function () {
    var that = this
    var submitData = that.data.submitData


    if (
      submitData.rank == "" ||
      submitData.certificateGrade == "" ||
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
      // submitData.extInfo.description == ""
      0
    ) {
      wx.showToast({ title: '1.请检查第三步必填项\n2.请检查是否出现特殊字符', icon: "none" })
      that.setData({ ['stepList.current']: 2 })
      return
    }

    that.confirmSubmit()
  },

  // 提交数据(检测通过)
  confirmSubmit: function () {
    var that = this

    wx.showLoading({ title: '请稍后', mask: true })

    HTTP.PUT_json(
      '/certificate/modify',
      that.data.submitData,
      function (res) {
        wx.showToast({ title: '修改成功', mask: true })

        const nowPage = getCurrentPages()
        const backPage = nowPage[nowPage.length - 3]
        backPage.data.refreshState = true

        HTTP.subscribeMsg('i6pErfUiZ1p4iycqGuHTBfbgMd3LtT9_oObbXS_-faI', function (s) { setTimeout(function () { wx.navigateBack({ delta: 2 }) }, 1000) })
      },
      function () { }
    )

  },

})