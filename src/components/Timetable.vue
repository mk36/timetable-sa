<template>
  <section class="p-4 bg-accent min-h-[100vh]">
    <h2 class="text-secondary font-bold text-2xl mb-4">Timetable</h2>

    <section class="flex justify-center">
      <section @click="openFileDialog" class="cursor-pointer bg-secondary flex basis-1/2 p-12 items-center justify-center border-dashed border-4 flex-wrap">
        <p class="w-full text-center mb-2">Drop your excel timetable file here</p>
        <i class="flex-full fa-solid fa-upload text-accent text-3xl"></i>
      </section>
      <input id="excel-input" class="hidden" type="file" name="file" @input="onChangeFile" accept="text/csv">
    </section>


    <section v-if="report.taList" class="p-4 bg-secondary rounded mt-6">
      <p class="font-bold mb-2">Please select a staff member to see their timetable</p>
      <select v-model="taSelected" class="w-full bg-accent text-secondary">
        <option value="">Choose a staff member</option>
        <option v-for="(ta, key) in report.taList" :value="ta" :key="ta.name">{{ key }}</option>
      </select>
    </section>

    <h3 class="text-secondary my-4 font-bold"
        v-if="taSelected">Showing timetable results for: </h3>

    <section class="bg-secondary rounded" v-if="taSelected">
      <section class="">
        <section class="p-2 grid sm:grid-cols-4 grid-cols-1">
          <p class="font-bold">Period</p>
          <p class="font-bold">Subject</p>
          <p class="font-bold">Room</p>
          <p class="font-bold">Students</p>
        </section>
        <section v-for="(key, index) in taSelected" :key="index">
          <section class="p-2 grid sm:grid-cols-4 grid-cols-1 border-t" v-if="index.includes('period')">
            <p>{{ key.period }}</p>
            <p>{{ key.subject }}</p>
            <p>{{ key.room }}</p>

            <ul>
              <li v-for="student in key.students" :key="student.name">{{ student.name }}</li>
            </ul>
          </section>
        </section>
      </section>
    </section>

    <section v-if="report.responsibilities.length > 0">
      <h3 class="text-secondary my-4 font-bold">Responsibilities</h3>

      <section class="bg-secondary rounded mt-6 p-4">
        <p :class="role.isTitle ? 'font-bold' : ''" v-for="(role, index) in report.responsibilities" :key="index">{{role.text}}</p>
      </section>
    </section>
  </section>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'Timetable',
  props: {},
  data() {
    return {
      weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      taSelected: '',
      csv: null,
      timetable: null,
      report: {
        periods: [],
        students: [],
        taList: null,
        responsibilities: [],
      },
      tableIndex: {
        cat: 1,
        form: 2,
        period_1: 4,
        period_2: 6,
        period_3: 8,
        period_4: 10,
        period_5: 18,
        period_6: 20,
        name: 0,
        need: 1,
        year_form: 2,
        notes: 3,
        period_1_ta: 5,
        period_2_ta: 7,
        period_3_ta: 9,
        period_4_ta: 11,
        lunch_duty: 12,
        lunch_ta: 13,
        period_5_ta: 19,
        period_6_ta: 21,
      },
      responsibilityKeys: [
        'lift duty',
        'ssc/work collection',
        'reserve',
        'sensory circuits',
        'taxis',
        'laptops',
        'physio',
        'chair',
        'srp'
      ]
    };
  },
  mounted() {
  },
  methods: {
    openFileDialog() {
      const input = document.querySelector('#excel-input');
      input.click()
    },
    onChangeFile(event) {
      this.csv = event.target.files[0]

      Papa.parse(this.csv, {
        // header: true,
        encoding: "utf-8",
        complete: (result) => {
          this.timetable = result.data
          this.processCSV(this.timetable);
          this.setTaListFromStudents(this.report.students)
        }
      })
    },
    setTaListFromStudents(students) {
      // object containing individual tas and their students
      let tas = {}

      students.forEach(student => {
        for (let i = 1; i < 7; i++) {
          const taList = student['period_' + i + '_ta'];

          taList.forEach(ta => {
            if (ta) { // if a ta exists
              if (!tas[ta]) { // create ta key
                tas[ta] = this.createDefaultTaObject()
              }

              tas[ta]['period_' + i].students.push(student);
              tas[ta]['period_' + i].room = student['period_' + i + '_room']
              tas[ta]['period_' + i].subject = student['period_' + i]
              tas[ta]['period_' + i].period = this.report.periods[i - 1]
            }
          })
        }
      })

      this.report.taList = tas;
    },
    createDefaultTaObject() {
      return {
        period_1: this.createDefaultTaStudentObject(),
        period_2: this.createDefaultTaStudentObject(),
        period_3: this.createDefaultTaStudentObject(),
        period_4: this.createDefaultTaStudentObject(),
        period_5: this.createDefaultTaStudentObject(),
        period_6: this.createDefaultTaStudentObject(),
      }
    },
    createDefaultTaStudentObject() {
      return {
        students: [],
        room: '',
        subject: '',
        period: '',
      }
    },
    processCSV(csv) {
      this.report.periods = [];
      this.report.students = [];
      this.report.responsibilities = [];
      let processing_students = true
      let blank_count = 0
      let processing_responsibilities = false;

      csv.forEach((row, index) => {
        if (index === 2) { // periods
          this.report.periods = this.getPeriods(row);
        }

        // student processing, starts at index 3
        if (index > 3 && processing_students) {
          let name_blank = row[0] === "";
          let is_blank = name_blank && row[1] === "" && row[2] === "";

          if (is_blank) {
            blank_count += 1

            if (blank_count === 2) {
              processing_students = false;
            }
          }

          if (!is_blank) { // add the student if row isn't blank
            blank_count = 0 // reset the blank count
            if (!name_blank) {
              this.report.students.push(this.getStudent(row, index));
            }
          }
        }

        // processing after students
        if (!processing_students) {
          if (processing_responsibilities) {
            let resp = {
              isTitle: this.responsibilityKeys.includes(row[0].toLowerCase().trim()),
              text: row[0]
            }
            this.report.responsibilities.push(resp);
          }

          // if a weekday is found, it's the start of responsibilities
          if(this.weekdays.includes(row[0].toLowerCase().trim())) {
            processing_responsibilities = true;
          }
        }
      })
    },
    getStudent(data, index) {
      return {
        name: data[this.tableIndex.name],
        need: data[this.tableIndex.need],
        notes: data[this.tableIndex.notes],
        period_1: data[this.tableIndex.period_1],
        period_1_room: this.timetable[index + 1][this.tableIndex.period_1],
        // period_1_ta: this.timetable[index + 1][this.tableIndex.period_1_ta],
        period_1_ta: this.getPeriodTasFromIndex(index, this.tableIndex.period_1_ta),
        period_2: data[this.tableIndex.period_2],
        period_2_room: this.timetable[index + 1][this.tableIndex.period_2],
        // period_2_ta: this.timetable[index + 1][this.tableIndex.period_2_ta],
        period_2_ta: this.getPeriodTasFromIndex(index, this.tableIndex.period_2_ta),
        period_3: data[this.tableIndex.period_3],
        period_3_room: this.timetable[index + 1][this.tableIndex.period_3],
        // period_3_ta: this.timetable[index + 1][this.tableIndex.period_3_ta],
        period_3_ta: this.getPeriodTasFromIndex(index, this.tableIndex.period_3_ta),
        period_4: data[this.tableIndex.period_4],
        period_4_room: this.timetable[index + 1][this.tableIndex.period_4],
        // period_4_ta: this.timetable[index + 1][this.tableIndex.period_4_ta],
        period_4_ta: this.getPeriodTasFromIndex(index, this.tableIndex.period_4_ta),
        period_5: data[this.tableIndex.period_5],
        period_5_room: this.timetable[index + 1][this.tableIndex.period_5],
        // period_5_ta: this.timetable[index + 1][this.tableIndex.period_5_ta],
        period_5_ta: this.getPeriodTasFromIndex(index, this.tableIndex.period_5_ta),
        period_6: data[this.tableIndex.period_6],
        period_6_room: this.timetable[index + 1][this.tableIndex.period_6],
        // period_6_ta: this.timetable[index + 1][this.tableIndex.period_6_ta],
        period_6_ta: this.getPeriodTasFromIndex(index, this.tableIndex.period_6_ta)
      };
    },
    getPeriodTasFromIndex(index, periodIndex) {
      // return this.timetable[index][periodIndex]
      return [this.timetable[index][periodIndex], this.timetable[index + 1][periodIndex]]
    },
    getPeriods(data) {
      let periods = []
      let text = 'Period'

      for (let i = 1; i < 7; i++) {
        let keyName = 'period_' + i;
        const periodName = data[this.tableIndex[keyName]];

        if (periodName) {
          periods.push(`${text} ${i} : ${periodName}`)
        }
      }

      return periods;
    }
  },
};
</script>
