import React, { useEffect, useState } from 'react';
import '../index.css';

const defaultGroups = ['6411-100503D', '6412-100503D', '6413-100503D'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const timeSlots = [
  '08:00 - 09:35',
  '09:45 - 11:20',
  '11:30 - 13:05',
  '13:30 - 15:05',
  '15:15 - 16:50',
  '17:00 - 18:35',
];
const groupNumberIds = {
  '6411-100503D': '1282690301',
  '6412-100503D': '1282690279',
  '6413-100503D': '1213641978',
};

function App() {
  const [week, setWeek] = useState(30);
  const [group, setGroup] = useState('');
  const [dates, setDates] = useState([]);
  const [scheduleMap, setScheduleMap] = useState({});

  const handlePrevWeek = () => setWeek((w) => w - 1);
  const handleNextWeek = () => setWeek((w) => w + 1);
  const handleGroupChange = (e) => setGroup(e.target.value);

  useEffect(() => {
    if (!group) return;

    const fetchSchedule = async () => {
      try {
        const groupId = groupNumberIds[group];
        const res = await fetch(`/api/schedule?groupId=${encodeURIComponent(groupId)}&week=${week}`);

        const json = await res.json();
        const result = {};
        timeSlots.forEach((time) => {
          result[time] = {};
          for (let i = 0; i < 6; i++) result[time][i] = [];
        });

        const rawPairs = json.pairs;

        for (const [dayIndex, dayData] of Object.entries(rawPairs)) {
          const dayNum = parseInt(dayIndex, 10);
          for (const [time, entries] of Object.entries(dayData)) {
            entries.forEach((entry) => {
              if (Array.isArray(entry.pairs)) {
                result[time][dayNum].push(...entry.pairs);
              }
            });
          }
        }

        setScheduleMap(result);
        setDates(json.dates || []);
      } catch (err) {
        console.error('Ошибка загрузки расписания:', err);
        setScheduleMap({});
        setDates([]);
      }
    };

    fetchSchedule();
  }, [group, week]);

  return (
    <div className="container py-4">
      <h1 className="mb-4">Schedule</h1>

      <div className="d-flex align-items-center mb-3">
        <button onClick={handlePrevWeek} className="btn btn-outline-primary me-2">
          &larr;
        </button>
        <div className="schedule-header flex-grow-1 text-center">Неделя {week}</div>
        <button onClick={handleNextWeek} className="btn btn-outline-primary ms-2">
          &rarr;
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="groupSelect" className="form-label">Группа:</label>
        <select
          id="groupSelect"
          className="form-select w-25"
          value={group}
          onChange={handleGroupChange}
        >
          <option value="">Выберите группу</option>
          {defaultGroups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>Время</th>
              {days.map((day, i) => (
                <th key={i}>
                  {day}
                  <br />
                  <small>{dates[i] || ''}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time, i) => (
              <tr key={i}>
                <td>
                  {time.split(' - ').map((t, j) => (
                    <div key={j}>{t}</div>
                  ))}
                </td>
                {days.map((_, dayIdx) => {
                  const lessons = scheduleMap[time]?.[dayIdx] || [];
                  return (
                    <td key={dayIdx} className="schedule-cell text-start">
                      {lessons.map((lesson, idx) => (
                        <div className="mb-2" key={idx}>
                          <strong>{lesson.subject}</strong>
                          <br />
                          <span>{lesson.type}</span>
                          <br />
                          {lesson.teacherLink ? (
                            <a href={`/linked?staffId=${lesson.teacherLink.match(/\d+/)[0]}&week=${week}`}>
                              {lesson.teacher}
                            </a>
                          ) : (
                            lesson.teacher
                          )}
                          <br />
                          <small>{lesson.location}</small>
                          <br />
                          {lesson.subgroup?.map((name, i) => {
                            const link = lesson.subgroupLinks?.[i];
                            const groupId = link?.match(/\d+/)?.[0];
                            return (
                              <div key={i}>
                                {groupId ? (
                                  <a href={`/linked?groupId=${groupId}&week=${week}`}>{name}</a>
                                ) : (
                                  name
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
