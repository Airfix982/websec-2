const express = require('express');
const { parseSchedule, parseTeacherSchedule } = require('./parser.cjs');

const app = express();
const PORT = 3001;

app.use(express.static('public'));

app.get('/api/schedule', async (req, res) => {
    const groupId = req.query.groupId;
    const week = parseInt(req.query.week, 10);

    if (!groupId || isNaN(week))
    {
        return res.status(400).json({error: 'bad parameters'});
    }

    try
    {
        const schedule = await parseSchedule(groupId, week);
        return res.json(schedule);
    }
    catch(err)
    {
        console.error('error while getting schedule', err);
        return res.status(500).json({error: 'server error'});
    }
});

app.get('/api/teacher', async (req, res) => {
    const staffId = req.query.staffId;
    const week = parseInt(req.query.week, 10);

    if (!staffId || isNaN(week))
    {
        return res.status(400).json({error: 'bad parameters'});
    }

    try
    {
        const schedule = await parseTeacherSchedule(staffId, week);
        return res.json(schedule);
    }
    catch(err)
    {
        console.error('error while getting teacher schedule', err);
        return res.status(500).json({error: 'server error'});
    }
});

app.get('/api/group', async (req, res) => {
    const groupId = req.query.groupId;
    const week = parseInt(req.query.week, 10);

    if (!groupId || isNaN(week))
    {
        return res.status(400).json({error: 'bad parameters'});
    }

    try
    {
        const schedule = await parseSchedule(groupId, week);
        return res.json(schedule);
    }
    catch(err)
    {
        console.error('error while getting teacher schedule', err);
        return res.status(500).json({error: 'server error'});
    }
});

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});