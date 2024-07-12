const fs = require('fs');
const path = require('path');

const readChecks = (filePath) => {
  const checkList = fs.readFileSync(filePath, 'utf8').split('\n').map(line => line.trim()).filter(line => line !== '');
  return checkList;
};

const getUniqueServices = (checkList) => {
  return checkList.reduce((acc, check) => {
    const [service] = check.split('_');
    acc.add(service);
    return acc;
  }, new Set());
};

const groupByMonth = (checkList) => {
  return checkList.reduce((acc, check) => {
    const [service, month] = check.split('_');
    const monthName = month.replace('.pdf', '');
    if (!acc[monthName]) {
      acc[monthName] = [];
    }
    acc[monthName].push(service);
    return acc;
  }, {});
};

const findUnpaidServices = (checksByMonth, allServices) => {
  return Object.entries(checksByMonth).reduce((acc, [month, services]) => {
    const unpaid = Array.from(allServices).filter(service => !services.includes(service));
    if (unpaid.length > 0) {
      acc[month] = unpaid;
    }
    return acc;
  }, {});
};

const generateOutput = (checksByMonth, unpaidServices) => {
  let output = '';
  for (const [month, services] of Object.entries(checksByMonth)) {
    for (const service of services) {
      output += /${month}/${service}_${month}.pdf\n;
    }
  }
  output += '\nне оплачены:\n';
  for (const [month, services] of Object.entries(unpaidServices)) {
    output += ${month}:\n;
    for (const service of services) {
      output += ${service}\n;
    }
  }
  return output;
};

const processChecks = (inputFilePath, outputDir) => {
  const checkList = readChecks(inputFilePath);
  const allServices = getUniqueServices(checkList);
  const checksByMonth = groupByMonth(checkList);
  const unpaidServices = findUnpaidServices(checksByMonth, allServices);
  const output = generateOutput(checksByMonth, unpaidServices);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'чеки_по_папкам.txt'), output);
};

processChecks('чеки.txt', 'output');