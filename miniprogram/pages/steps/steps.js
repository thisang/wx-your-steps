import * as echarts from '../../components/ec-canvas/echarts';

Page({
  onShareAppMessage: res => {
    return {
      title: '你也来看看你的步数吧',
      path: 'pages/steps/steps',
      success: function () { },
      fail: function () { }
    }
  },

  onLoad: function () {
    this.getWxStepsData().then(() => {
      // 获取组件
      this.ecComponent = this.selectComponent('#mychart-dom-bar');
      wx.cloud.callFunction({
        name: 'stepsComment',
        data: {
          step: this.data.allSteps / this.data.stepsList.length
        },
        success: (res) => {
          const text = res.result.text;
          this.setData({
            infoComment: text
          })
          this.initChart()
        }
      })
    })
  },

  data: {
    ec: {
      lazyLoad: true
    },
    showType: 'month', // 展示类型: month || day
    allSteps: 0, // month steps
    infoSteps: 0, // 展示步数
    infoTime: '最近一个月', // 展示时间
    infoComment: '', // 展示评论
    stepsList: [], // 近一月步数
    timeRange: [], // 近一月时间区间
    loading: true, // 图表加载状态
  },

  // 获取微信步数
  getWxStepsData: function () {
    let _this = this;
    return new Promise(resolve => {
      wx.getWeRunData({
        success (res) {
          const cloudID = res.cloudID
          wx.cloud.callFunction({
            name: 'steps',
            data: {
              weRunData: wx.cloud.CloudID(cloudID),
            },
            success: function(stepsData) {
              let _all = 0;
              let _list = stepsData.result.data.stepInfoList.map(item => {
                _all += item.step
                return [
                  echarts.format.formatTime('yyyy-MM-dd', item.timestamp * 1000),
                  item.step
                ]
              })
              let _range = [];
              _range.push(_list[0][0])
              _range.push(_list[_list.length - 1][0])
              _this.setData({
                stepsList: _list,
                timeRange: _range,
                allSteps: _all,
                infoSteps: _all,
              })
              resolve()
            }
          })
        }
      })
    })
  },

  // 初始化图表
  initChart: function () {
    this.ecComponent.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      let option = {
        tooltip: {},
        calendar: {
            top: '40',
            left: 'center',
            orient: 'vertical',
            cellSize: 40,
            yearLabel: {
              show: false,
            },
            dayLabel: {
              firstDay: 7,
              nameMap: 'cn',
              color: '#999999',
            },
            monthLabel: {
              show: false,
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#999999',
                width: 1,
                type: 'dashed'
              }
            },
            itemStyle: {
              color: '#f6f6f6',
              borderWidth: 1,
              borderColor: '#999999',
              borderType: 'dashed'
            },
            range: null
        },
        visualMap: {
            min: 0,
            max: 10000,
            inRange: {
              color: ['#d1ffe7', '#06ae56']
            },
            show: false
        },
        series: [{
            type: 'scatter',
            coordinateSystem: 'calendar',
            symbolSize: function (val) {
              return val[1] / 300;
            },
            data: null
        }]
      }

      option.series[0].data = this.data.stepsList;
      option.calendar.range = this.data.timeRange;

      chart.setOption(option);

      chart.on('click', (params) => {
        this.handleDaySteps(params.value)
      });

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        loading: false,
      });

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  // 显示某一天的步数
  handleDaySteps: function (dataArr) {
    // dataArr: ['2020-02-02', 8973]
    const _this = this;
    wx.cloud.callFunction({
      name: 'stepsComment',
      data: {
        step: dataArr[1]
      },
      success: function(res) {
        const text = res.result.text;
        _this.setData({
          showType: 'day',
          infoTime: dataArr[0],
          infoSteps: dataArr[1],
          infoComment: text
        })
      }
    })
  },

  // 重新显示最近一月的统计数据
  reset: function () {
    wx.cloud.callFunction({
      name: 'stepsComment',
      data: {
        step: this.data.allSteps / this.data.stepsList.length
      },
      success: (res) => {
        const text = res.result.text;
        this.setData({
          showType: 'month',
          infoTime: '最近一个月',
          infoSteps: this.data.allSteps,
          infoComment: text
        })
      }
    })
  },

  onUnload: function () {
    if (this.chart) {
      this.chart.dispose();
    }
  },
});