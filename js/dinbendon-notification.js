var endHour = 16;
var endMinute = 0;
var remindPeriodInSecond = 28800;
var remindIntervalInSecond = 3600;

function init() {
    chrome.notifications.onClicked.addListener(function (notificationId) {
      console.log(notificationId);
      window.open('http://dinbendon.net');
      setNextDayAlarm();
    });
    chrome.notifications.onButtonClicked.addListener(function (notificationId) {
      console.log(notificationId);
      setNextDayAlarm();
    });
    updateConfig();
    chrome.alarms.onAlarm.addListener(popNotification);
}
function updateConfig() {
  chrome.storage.sync.get(
    ['endHour', 'endMinute', 'remindPeriodInSecond', 'remindIntervalInSecond'],
    function(items) {
      if(!items.endHour) {
        chrome.storage.sync.set({
          endHour: endHour,
          endMinute: endMinute,
          remindPeriodInSecond: remindPeriodInSecond,
          remindIntervalInSecond: remindIntervalInSecond
        }, function() {});
      } else {
        endHour = items.endHour;
        endMinute = items.endMinute;
        remindPeriodInSecond = items.remindPeriodInSecond;
        remindIntervalInSecond = items.remindIntervalInSecond;
      }
      setNextAlarm(true);
    });
}

function getEndTime() {
  var time = new Date();
  var yy = time.getFullYear();
  var mm = time.getMonth();
  var dd = time.getDate();
  return new Date(yy, mm, dd, endHour, endMinute);
}

function getStartTime() {
  // Start reminding from 20 minutes ago
  return new Date(getEndTime().getTime() - remindPeriodInSecond * 1000);
}

function getNextDayStartTime() {
  return new Date(getStartTime().getTime() + 86400000);
}

function setNextAlarm(initialize) {
  var time = new Date();
  var endTime = getEndTime();
  var startTime = getStartTime();
  if (time < startTime) {
    chrome.alarms.create('dinbendon', {when: startTime.getTime()});
  } else if (time > startTime && time < endTime) {
    if(initialize) {
      popNotification({name: 'dinbendon'});
    }
    if (endTime - time >= remindIntervalInSecond * 1000) {
      chrome.alarms.create('dinbendon',
                              {delayInMinutes: remindIntervalInSecond / 60});
    } else {
      setNextDayAlarm();
    }
  } else {
    setNextDayAlarm();
  }
}

function setNextDayAlarm() {
  chrome.alarms.create('dinbendon', {when: getNextDayStartTime().getTime()});

  var opt = {
    type: 'basic',
    title: '訂便當',
    message: '將於明天提醒您訂便當。',
    iconUrl: 'style/icons/128.png'
  };
  chrome.notifications.clear('nextday', function() {});
  chrome.notifications.create('nextday', opt, function() {});
}

function popNotification(alarm) {
  if(alarm.name == 'dinbendon') {
    if (chrome.notifications) {
      var opt = {
        type: 'basic',
        title: '訂便當',
        message: '提醒您，訂便當的時間到了，請記得下單。按我跳轉',
        iconUrl: 'style/icons/128.png',
        buttons: [{title: '停止提醒'}]
      };
      chrome.notifications.clear('dinbendon', function() {});
      chrome.notifications.create('dinbendon', opt, function() {});
      setNextAlarm();
    }
  }
}

init();
