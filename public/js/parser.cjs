//import fetch from 'node-fetch';


//const fetch = require('node-fetch'); 
const cheerio = require('cheerio'); 

let currentWeekGlobal = null;

function createPair(type, subject = '', teacher = '', teacherLink = '', location = '', subgroup = [], subgroupLinks = []) {
    return {
      type,
      subject,
      teacher,
      teacherLink, 
      location,
      subgroup,
      subgroupLinks
    };
}

function createScheduleCell(weekDay, time, pairs = []) {
    return {
        weekDay,
        time,
        pairs
    };
}

async function parseSchedule(groupId, weekNumber) {
    const url = `https://ssau.ru/rasp?groupId=${groupId}&selectedWeek=${weekNumber}`;  
    const response = await fetch(url);
    const html = await response.text();  
    const schedule = parseHtmlToSchedule(html);
    return schedule;
  }

async function parseTeacherSchedule(groupId, weekNumber) {
    const url = `https://ssau.ru/rasp?staffId=${groupId}&selectedWeek=${weekNumber}`;  
    const response = await fetch(url);
    const html = await response.text();
    const teacherSchedule = parseHtmlToSchedule(html);
    return teacherSchedule;
}



function parseHtmlToSchedule(html) {
    const $ = cheerio.load(html);
    const name = $("div.page-header h1").text().trim();
    let scheduleItems = $('.schedule .schedule__items > div.schedule__item');
    const dateElements = scheduleItems.slice(1, 7);
    const datesByDay = [];
    dateElements.each((index, elem) => 
    {
        const date = $(elem).find('.schedule__head-date').text().trim();
        datesByDay.push(date);
    })
    const timeBlocks = $('.schedule .schedule__time');
    let timeStrings = [];

    timeBlocks.each((_, timeElem) => {
        const start = $(timeElem).find('div').eq(0).text().trim();
        const end = $(timeElem).find('div').eq(1).text().trim();
        const timeStr = `${start} - ${end}`;
        timeStrings.push(timeStr);
    });

    const schedule = {};
    let timeCounter = 0;
    
    const lessonItems = scheduleItems.slice(7);
    lessonItems.each((index, elem) => {
        const cell = $(elem);
        const dayIndex = index % 6;
    
        const timeString = timeStrings[timeCounter] || '';
    
        if (cell.text().trim() === '') {
            if (dayIndex === 5) timeCounter++;
            return;
        }
    
        const lessonBlocks = cell.find('.schedule__lesson');
        const pairs = [];
    
        lessonBlocks.each((_, lessonElem) => {
            const lesson = $(lessonElem);
            const type = lesson.find('.schedule__lesson-type > div').text().trim();
    
            const info = lesson.find('.schedule__lesson-info');
            const subject = info.find('.schedule__discipline').text().trim();
            const location = info.find('.schedule__place').text().trim();
    
            const teacherLinkElem = info.find('.schedule__teacher a');
            const teacher = teacherLinkElem.text().trim();
            const teacherLink = teacherLinkElem.attr('href') || '';

            //const groupElems = info.find('.schedule__groups a');
            const subgroupElems = info.find('.schedule__groups span.caption-text');
            const teacherGroups = info.find('a.schedule__group');
            const groups = [];
            const groupLinks = [];
            // groupElems.each((_, groupElem) => {
            //     groups.push($(groupElem).text().trim());
            //     groupLinks.push($(groupElem).attr('href') || '');
            // });
            subgroupElems.each((_, subgroupElem) => {
                groups.push($(subgroupElem).text().trim());
            });
            teacherGroups.each((_, elem) => {
                groups.push($(elem).text().trim());
                //console.log(elem);
                groupLinks.push($(elem).attr('href') || '');
            });
            const pair = createPair(type, subject, teacher, teacherLink, location, groups, groupLinks);
            pairs.push(pair);
        });
    
        const cellData = createScheduleCell(dayIndex, timeString, pairs);
    
        if (!schedule[dayIndex]) schedule[dayIndex] = {};
        if (!schedule[dayIndex][timeString]) schedule[dayIndex][timeString] = [];
        schedule[dayIndex][timeString].push(cellData);   
        if (dayIndex === 5) timeCounter++; 
    });
    


    return {dates: datesByDay, pairs: schedule, name: name};
}
  

  module.exports = { parseSchedule, parseTeacherSchedule };