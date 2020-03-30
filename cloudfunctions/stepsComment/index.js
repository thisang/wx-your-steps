// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const randomNum = function (max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const getCommentBySteps = function (type) {
    const commentData = {
      0: ['没打开微信运动吧'],
      1: ['你也太懒了吧', '如果你被非法隔离了就眨眨眼', '除了床，都是外面'],
      2: ['没出门，家里大', '干嘛要出门，游戏不好玩？', '我这么好看，能看一天'],
      3: ['被麻麻赶出门了', '宁可多吃一口，也不多走一步', '外面太凶险了，还是家里安全'],
      4: ['出门打了一瓶酱油', '正常上班、上学', '风里来雨里去'],
      5: ['坐下，正常发挥', '遛狗，狗跑了', '把自己拧出去溜了溜'],
      6: ['太腻害了', '身体倍 er 棒', '跑路达人'],
      7: ['我愿称之为神仙！', 'CBD 还在沉睡，你已醒来', '当代神行太保！'],
    }

    const _typeArr = commentData[type];
    return _typeArr[randomNum(_typeArr.length - 1, 0)]
  }

  const _step = event.step;
  let _type;
  if (_step === 0) {
    _type = 0;
  } else if (_step <= 50) {
    _type = 1
  } else if (_step > 50 && _step <= 500) {
    _type = 2;
  } else if (_step > 500 && _step <= 3000) {
    _type = 3
  } else if (_step > 3000 && _step <= 8000) {
    _type = 4
  } else if (_step > 8000 && _step <= 12000) {
    _type = 5
  } else if (_step > 12000 && _step <= 20000) {
    _type = 6
  } else {
    _type = 7
  }

  const _text = getCommentBySteps(_type)

  return {
    text: _text
  }
}