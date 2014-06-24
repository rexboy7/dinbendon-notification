/* globals chrome */

(function options() {
'use strict';

  var hourInput = document.getElementById('hour');
  var minInput = document.getElementById('min');
  var remindbeforeInput = document.getElementById('remindbefore');
  var remindeveryInput = document.getElementById('remindevery');
  var updateBtn = document.getElementById('update');
  var output = document.getElementById('output');
  var frequencyGroup = document.getElementById('frequencyGroup');
  var frequencySet;

  function onFrequencyChange(evt) {
    remindbeforeInput.disabled = remindeveryInput.disabled =
                                                (evt.target.value != 'custom');
    switch(evt.target.value) {
      case 'early':
        remindbeforeInput.value = 480;
        remindeveryInput.value = 60;
        break;
      case 'late':
        remindbeforeInput.value = 30;
        remindeveryInput.value = 3;
        break;
    }
  }

  function setFrequencyGroup(grpName) {
    var elements = document.getElementsByName('frequency');
    var i, checked;
    elements[0].checked = true;
    checked = 0;
    for(i = 0; i < elements.length; i++) {
      if(elements[i].value == grpName) {
        elements[i].checked = true;
        checked = i;
      }
    }
    onFrequencyChange({target: elements[checked]});
  }

  function getFrequencyGroup() {
    var elements = document.getElementsByName('frequency');
    for(var i = 0; i < elements.length; i++) {
      if(elements[i].checked) {
        return elements[i].value;
      }
    }
  }

  function saveSettings() {
    var opt = {
      endHour: hourInput.value,
      endMinute: minInput.value,
      remindPeriodInSecond: remindbeforeInput.value * 60,
      remindIntervalInSecond: remindeveryInput.value * 60,
      frequencyGroup: getFrequencyGroup()
    };
    console.log(opt);
    chrome.storage.sync.set(opt, function() {
      output.textContent = '設定已儲存';
      setTimeout(cleanOutput, 3000);
      chrome.extension.getBackgroundPage().updateConfig();
    });
  }

  function cleanOutput() {
    output.textContent = '';
  }

  function init() {
    chrome.storage.sync.get(
      ['endHour', 'endMinute', 'remindPeriodInSecond', 'remindIntervalInSecond',
       'frequencyGroup'],
      function(items) {
        hourInput.value = items.endHour;
        minInput.value = items.endMinute;
        remindbeforeInput.value = items.remindPeriodInSecond / 60;
        remindeveryInput.value = items.remindIntervalInSecond / 60;
        setFrequencyGroup(items.frequencyGroup);
      });
    updateBtn.addEventListener('click', saveSettings);
    frequencyGroup.addEventListener('change', onFrequencyChange);
  }

  init();
})();
