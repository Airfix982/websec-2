const { parseSchedule } = require('./parser.cjs');  // Имя файла, где парсинг

(async () => {
    const groupId = '1213641978';  // Пример группы
    const week = 30;               // Пример недели

    const result = await parseSchedule(groupId, week);
    pairs = result['30']['pairs'];
    console.dir(result, { depth: null, colors: true });

})();
