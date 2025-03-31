const { createApp } = Vue;

createApp({
  data() {
    return {
      currentWeek: 30,
      scheduleData: null,
      pageTitle: "Schedule",
      weekDays: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      timeSlots: [
        "08:00 - 09:35",
        "09:45 - 11:20",
        "11:30 - 13:05",
        "13:30 - 15:05",
        "15:15 - 16:50",
        "17:00 - 18:35"
      ],
      staffId: null,
      groupId: null,
      groupNumberIds: {
        "1282690301": "6411-100503D",
        "1282690279": "6412-100503D",
        "1213641978": "6413-100503D"
      }
    };
  },
  methods: {
    async loadSchedule() {
      try {
        let url = "";
        if (this.staffId) {
          url = `/api/teacher?staffId=${this.staffId}&week=${this.currentWeek}`;
        } else if (this.groupId) {
          url = `/api/group?groupId=${this.groupId}&week=${this.currentWeek}`;
        } else {
          console.error("Нет staffId или groupId");
          return;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (this.staffId && data.name) {
          this.pageTitle = data.name;
        } else if (this.groupId) {
          const groupName = this.groupNumberIds[this.groupId] || this.groupId;
          this.pageTitle = `Расписание группы ${groupName}`;
        }
        this.scheduleData = data;
      } catch (err) {
        console.error("Ошибка при загрузке расписания:", err);
      }
    },
    nextWeek() {
      this.currentWeek++;
      this.loadSchedule();
    },
    prevWeek() {
      this.currentWeek--;
      this.loadSchedule();
    },
    getCellHtml(cellData) {
      return cellData.pairs.map(pair => {
        let groupsHtml = "";
        if (pair.subgroup.length && pair.subgroupLinks?.length) {
          groupsHtml = pair.subgroup.map((g, i) => {
            const link = pair.subgroupLinks[i]?.match(/\d+/)?.[0];
            return link
              ? `<a href="linkedPage.html?groupId=${link}&week=${this.currentWeek}" class="me-1">${g}</a>`
              : g;
          }).join(" ");
        } else {
          groupsHtml = pair.subgroup.join(", ");
        }

        let teacherLink = "";
        if (pair.teacherLink) {
          const match = pair.teacherLink.match(/\d+/);
          if (match) teacherLink = match[0];
        }

        return `
          <div class="mb-2">
            <strong>${pair.subject}</strong> (${pair.type})<br>
            <a href="linkedPage.html?staffId=${teacherLink}&week=${this.currentWeek}">
              ${pair.teacher}
            </a><br>
            <small>${pair.location}</small><br>
            ${groupsHtml ? `<small>${groupsHtml}</small>` : ""}
          </div>
        `;
      }).join("");
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const staffParam = urlParams.get("staffId");
    const groupParam = urlParams.get("groupId");
    const weekParam = urlParams.get("week");

    if (staffParam) {
      this.staffId = staffParam;
    }
    if (groupParam) {
      this.groupId = groupParam;
    }
    if (weekParam) {
      this.currentWeek = parseInt(weekParam, 10) || 30;
    }

    this.loadSchedule();
  }
}).mount("#app");
