let currentWeek = 30;

const groupNumberIds = {
  "6411-100503D": "1282690301",
  "6412-100503D": "1282690279",
  "6413-100503D": "1213641978"
};

document.getElementById('prevWeek').addEventListener('click', async () => {
  currentWeek--;
  updateWeekHeader();
  await loadAndRenderWeek(currentWeek);
});

document.getElementById('nextWeek').addEventListener('click', async () => {
  currentWeek++;
  updateWeekHeader();
  await loadAndRenderWeek(currentWeek);
});

document.getElementById('groupSelect').addEventListener('change', async () => {
  currentWeek = 30;
  updateWeekHeader();
  await loadAndRenderWeek(currentWeek);
});


function updateWeekHeader() {
  document.getElementById('weekHeader').textContent = `${currentWeek} неделя`;
}




async function loadAndRenderWeek(week) {
  let data = null;
  const groupNumber = document.getElementById('groupSelect').value;
  if (!groupNumber) return;

  const groupValue = groupNumberIds[groupNumber];

  try {
      const res = await fetch(`http://localhost:3000/api/schedule?groupId=${groupValue}&week=${week}`);
      //console.log(`http://localhost:3000/api/schedule?groupId=${groupValue}&week=${week}`);
      data = await res.json();
      //console.log(data);

    renderSchedule(data);
  } catch (err) {
    console.error('Ошибка при загрузке недели:', err);
  }
}





  async function renderSchedule(data)
  {
    const tbodyRows = document.querySelectorAll('#scheduleBody tr');
    const weekDays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

    const headerCells = document.querySelectorAll('thead th');
    for(let i = 0; i < 6; i++)
      {
        const date = data.dates[i];
        headerCells[i+1].innerHTML = `${weekDays[i]}<br><small>${date}<small>`;
      }
      
      tbodyRows.forEach(row => {
        const cells = row.querySelectorAll('.schedule-cell');
        cells.forEach(cell => (cell.innerHTML = ''));
    })

    for(const dayIndex in data.pairs)
    {
        const day = data.pairs[dayIndex];
        
        const cells = [];

        for(let rowIdx = 0; rowIdx < tbodyRows.length; rowIdx++)
        {
            const row = tbodyRows[rowIdx];
            const timeRaw = row.querySelector('td').innerText.trim().replace(/\s+/g, '');
            const timeLabel = `${timeRaw.slice(0, 5)} - ${timeRaw.slice(5)}`;

            if(day[timeLabel])
            {
                const cell = row.querySelectorAll('.schedule-cell')[dayIndex];
                const cellContent = [];

                day[timeLabel].forEach(item => {
                    item.pairs.forEach(pair => {
                        let groupsHtml = '';
                        if (pair.subgroup.length && pair.subgroupLinks?.length) {
                          groupsHtml = pair.subgroup.map((g, i) => {
                            const link = pair.subgroupLinks[i].match(/\d+/)[0];
                            console.log(link)
                            return `<a href="linkedPage.html?groupId=${link}&week=${currentWeek}" class="me-1">${g}</a>`;
                          }).join(' ');
                        }
                        let teacherLink = "";
                        if(pair.teacherLink != "")
                        {
                          teacherLink = pair.teacherLink.match(/\d+/)[0];
                        }
                        const html = `<div class="mb-2">  <strong>${pair.subject}</strong> 
                        (${pair.type})<br> 
                        <a href="linkedPage.html?staffId=${teacherLink}&week=${currentWeek}">${pair.teacher}</a>
                        <br><small>${pair.location}</small><br>
                        ${groupsHtml ? `<small>${groupsHtml}</small>` : ''}</div>`;
                        cellContent.push(html);
                    });
                });
                cell.innerHTML = cellContent.join('');
            }
        }
    }
  }
