const fs = require('fs');
const path = require('path');

// Функция для чтения и обработки списка чеков из файла
const getChecksFromFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line); 
};

// Функция для группировки чеков по месяцам и нахождения неоплаченных услуг
const processChecks = (checkList) => {
  const servicesByMonth = {};
  const allServices = new Set();

  for (const check of checkList) {
    const [service, month] = check.split('_');
    const monthName = month.replace('.pdf', '');

    allServices.add(service);

    if (!servicesByMonth[monthName]) {
      servicesByMonth[monthName] = new Set();
    }
    servicesByMonth[monthName].add(service);
  }

  const unpaidServices = {};
  for (const [month, services] of Object.entries(servicesByMonth)) { // <--- Исправлено!
    unpaidServices[month] = Array.from(allServices)
      .filter(service => !services.has(service));
  }

  return { servicesByMonth, unpaidServices };
};

// Функция для генерации выходных данных
const generateOutput = ({ servicesByMonth, unpaidServices }) => {
  let output = '';

  // Формируем список оплаченных услуг
  for (const [month, services] of Object.entries(servicesByMonth)) {
    for (const service of services) {
      output += `${month}/${service}_${month}.pdf\n`;
    }
  }

  // Добавляем список неоплаченных услуг
  output += '\nне оплачены:\n';
  for (const [month, services] of Object.entries(unpaidServices)) {
    if (services.length > 0) { 
      output += `${month}:\n${services.join('\n')}\n`; 
    }
  }

  return output;
};

// Основная функция
const main = () => {
  const checkList = getChecksFromFile('чеки.txt');
  const processedData = processChecks(checkList);
  const output = generateOutput(processedData);

  const scriptDir = __dirname;
  fs.writeFileSync(path.join(scriptDir, 'чеки_по_папкам.txt'), output);
};

main();