console.log('Loaded');

function formatMsg(msg) {
  const split = msg.split('期限');
  const date = split[1].split(')');

  return date[0];
}

function formatTime(unixTime, format = 'YYYY/MM/DD') {
  const theTime = new Date(unixTime);

  return format
    .replace('YYYY', `${theTime.getFullYear()}`)
    .replace('MM', `00${theTime.getMonth() + 1}`.slice(-2))
    .replace('DD', `00${theTime.getDate()}`.slice(-2));
}

function calculateVCoin() {
  const tableTopup = document.querySelector('table.tableTopup');
  const row = Array.from(tableTopup.querySelectorAll('tr'))
    .slice(2)
    .reverse();
  const formatVCoin = row.map(raw => {
    const msg = raw.querySelectorAll('td')[1].innerText;
    const price = Number(raw.querySelectorAll('td')[2].innerText);

    return { msg, price };
  });
  const positiveVCoin = formatVCoin
    .map(({ msg, price }) => {
      return price > 0
        ? {
            date: new Date(formatMsg(msg)).getTime(),
            price,
          }
        : null;
    })
    .filter(val => val)
    .sort((val1, val2) => val1.date - val2.date);
  let negativeVCoinTotal = formatVCoin
    .filter(({ price }) => price < 0)
    .map(({ price }) => Math.abs(price))
    .reduce((acc, cur) => acc + cur, 0);

  const expiringSoonIndex = positiveVCoin.reduce((acc, vCoin, index) => {
    if (negativeVCoinTotal > 0) {
      negativeVCoinTotal -= vCoin.price;
      return negativeVCoinTotal === 0 ? index + 1 : index;
    }

    return acc;
  }, 0);

  const expiringSoonObj = {
    price: positiveVCoin[expiringSoonIndex].price,
    date: formatTime(positiveVCoin[expiringSoonIndex].date),
  };

  let msg = `即將過期點數為：${expiringSoonObj.price}\n`;
  msg += `即將過期日期為：${expiringSoonObj.date}`;

  alert(msg);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.actions) {
    case 'calculate':
      calculateVCoin();
      break;

    default:
      break;
  }
  sendResponse('resolved');
});
