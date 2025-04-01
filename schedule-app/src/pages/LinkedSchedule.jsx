import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../index.css';

const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const timeSlots = [
  '08:00 - 09:35',
  '09:45 - 11:20',
  '11:30 - 13:05',
  '13:30 - 15:05',
  '15:15 - 16:50',
  '17:00 - 18:35',
];

const groupIdToNumber = {
  "1282690301": "6411-100503D",
  "1282690279": "6412-100503D",
  "1213641978": "6413-100503D",
};

export default function LinkedSchedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [schedule, setSchedule] = useState(null);
  const [week, setWeek] = useState(+searchParams.get('week') || 30);

  const staffId = searchParams.get('staffId');
  const groupId = searchParams.get('groupId');

  useEffect(() => {
    const fetchData = async () => {
      if (!staffId && !groupId) return;

      try {
        const endpoint = staffId
          ? `/api/teacher?staffId=${staffId}&week=${week}`
          : `/api/group?groupId=${groupId}&week=${week}`;

        const res = await fetch(endpoint);
        const json = await res.json();

        setSchedule(json);
      } catch (err) {
        console.error('Ошибка при загрузке расписания:', err);
        setSchedule(null);
      }
    };

    fetchData();
  }, [staffId, groupId, week]);

  const handlePrevWeek = () => setWeek((w) => w - 1);
  const handleNextWeek = () => setWeek((w) => w + 1);

  useEffect(() => {
    const params = {};
    if (staffId) params.staffId = staffId;
    if (groupId) params.groupId = groupId;
    params.week = week;
    setSearchParams(params);
  }, [week]);

  return (
    <div className="container py-4">
      <h1 className="mb-4">
        {schedule?.name || 'Загрузка...'}
      </h1>

      <div className="d-flex align-items-center mb-3">
        <button className="btn btn-outline-primary me-2" onClick={handlePrevWeek}>&larr;</button>
        <div className="schedule-header flex-grow-1 text-center">{week} неделя</div>
        <button className="btn btn-outline-primary ms-2" onClick={handleNextWeek}>&rarr;</button>
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
                  <small>{schedule?.dates?.[i] || ''}</small>
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
                  const raw = schedule?.pairs?.[dayIdx]?.[time] || [];
                  const lessons = raw.flatMap(r => r.pairs);
                  return (
                    <td key={dayIdx} className="schedule-cell text-start">
                      {lessons.map((lesson, k) => (
                        <div className="mb-2" key={k}>
                          <strong>{lesson.subject}</strong> ({lesson.type})<br />
                          {lesson.teacherLink ? (
                            <a href={`/linked?staffId=${lesson.teacherLink.match(/\d+/)[0]}&week=${week}`}>
                              {lesson.teacher}
                            </a>
                          ) : lesson.teacher}
                          <br />
                          <small>{lesson.location}</small><br />
                          {lesson.subgroup?.map((g, idx) => {
                            const link = lesson.subgroupLinks?.[idx];
                            const id = link?.match(/\d+/)?.[0];
                            return id ? (
                              <a
                                key={idx}
                                href={`/linked?groupId=${id}&week=${week}`}
                                className="me-1"
                              >
                                {g}
                              </a>
                            ) : <span key={idx}>{g}</span>;
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
