const fs = require('fs');

const readChecks = () => {
  const checkList = fs.readFileSync('чеки.txt', 'utf8').split('\n').map(line => line.trim());
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
    const unpaid = allServices.filter(service => !services.includes(service));
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

const main = () => {
  const checkList = readChecks();
  const allServices = getUniqueServices(checkList);
  const checksByMonth = groupByMonth(checkList);
  const unpaidServices = findUnpaidServices(checksByMonth, allServices);
  const output = generateOutput(checksByMonth, unpaidServices);
  fs.writeFileSync('чеки_по_папкам.txt', output);
};

main();