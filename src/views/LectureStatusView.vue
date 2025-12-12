<script setup lang="ts">
import { ref, onMounted } from 'vue';

// [수정됨] 공통 컴포넌트 import (상대 경로 사용)
import BaseSelect from '../components/BaseSelect.vue';
import BaseButton from '../components/BaseButton.vue';
import PageableGridContent from '../components/ag-grid/PageableGridContent.vue';

// --- 가상 API ---
const mockApi = {
  getLectures: (params: any) => {
    return new Promise<{ data: any[], status: number }>((resolve) => {
      setTimeout(() => {
        const baseData = [
          { type: "전공필수", code: "CS101", name: "소프트웨어 공학 개론", credits: 3, professor: "김철수", students: 45, date: "2025-02-15" },
          { type: "전공선택", code: "CS204", name: "웹 프론트엔드 실무(Vue.js)", credits: 3, professor: "이영희", students: 120, date: "2025-02-16" },
          { type: "교양", code: "GE105", name: "디자인 씽킹과 창업", credits: 2, professor: "박민수", students: 80, date: "2025-02-14" },
          { type: "전공심화", code: "CS401", name: "인공지능과 딥러닝", credits: 3, professor: "최지훈", students: 60, date: "2025-02-18" },
          { type: "전공필수", code: "CS102", name: "자료구조 및 알고리즘", credits: 3, professor: "정수진", students: 55, date: "2025-02-15" },
        ];
        
        let data: any[] = [];
        for(let i=0; i<15; i++) { // 데이터 개수를 늘려서 페이지네이션 테스트
            data = data.concat(baseData.map((item, idx) => ({ ...item, id: i*5 + idx })));
        }

        if (params.type && params.type !== '전체') {
            data = data.filter(item => item.type === params.type);
        }

        data = data.map((item, index) => ({ ...item, no: index + 1 }));
        resolve({ data: data, status: 200 });
      }, 500);
    });
  }
};

// --- 상태 관리 ---
const pageableGridContentRef = ref<any>(null); // 컴포넌트 ref
const pageableDataSource = ref<any[]>([]); // 그리드 데이터
const searchParams = ref({ year: '2025', semester: '1학기', type: '전체' });

// 옵션 데이터
const yearOptions = ['2025', '2024', '2023'];
const semesterOptions = ['1학기', '2학기', '여름학기', '겨울학기'];
const typeOptions = ['전체', '전공필수', '전공선택', '전공심화', '교양'];

// --- AG Grid 설정 ---
const columnDefs = [
  { headerName: "No", field: "no", width: 70, pinned: 'left', cellClass: "text-center" },
  { 
    headerName: "이수 구분", field: "type", width: 120, cellClass: "text-center",
    cellRenderer: (params: any) => {
        const colors: any = { '전공필수': 'text-red-darken-2', '전공선택': 'text-blue-darken-2', '교양': 'text-grey-darken-1' };
        const color = colors[params.value] || 'text-black';
        return `<span style="font-weight:bold" class="${color}">${params.value}</span>`;
    }
  },
  { headerName: "학수 번호", field: "code", cellClass: "text-center" },
  { headerName: "강의명", field: "name", flex: 2, cellStyle: { fontWeight: 'bold' } },
  { headerName: "학점", field: "credits", width: 100, cellClass: "text-center", valueFormatter: (p: any) => p.value + "학점" },
  { headerName: "담당 교수", field: "professor", cellClass: "text-center" },
  { headerName: "수강 인원", field: "students", cellClass: "text-center", valueFormatter: (p: any) => p.value + "명" },
  { headerName: "개설 일자", field: "date", cellClass: "text-center" }
];

const gridOptions = {
  // 추가적인 그리드 옵션이 필요하면 여기에 작성
  paginationPageSize: 15, // 페이지당 행 수 재설정 예시
};

// --- 이벤트 핸들러 ---
const handlePageChange = (info: { currentPage: number, totalPages: number }) => {
  console.log(`페이지 변경됨: ${info.currentPage + 1} / ${info.totalPages}`);
};

const onPageableGridFilterActived = () => {
  console.log("필터가 변경되었습니다.");
};

const onSelectionChanged = () => {
  if (pageableGridContentRef.value) {
    const selectedRows = pageableGridContentRef.value.gridApi.getSelectedRows();
    console.log("선택된 행:", selectedRows);
  }
};

const fetchData = async () => {
  // 로딩바 표시는 컴포넌트 내부 api를 통해 제어 가능
  if(pageableGridContentRef.value?.gridApi) {
    pageableGridContentRef.value.gridApi.showLoadingOverlay();
  }
  
  const res = await mockApi.getLectures(searchParams.value);
  pageableDataSource.value = res.data;
  
  if(pageableGridContentRef.value?.gridApi) {
    pageableGridContentRef.value.gridApi.hideOverlay();
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="page-container">
    <h2 class="page-title">강의 개설 현황</h2>

    <!-- 검색 영역 -->
    <div class="content-card search-area">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="10">
          <v-row dense>
            <v-col cols="12" sm="3" class="pr-4">
              <BaseSelect label="개설 연도" v-model="searchParams.year" :items="yearOptions" />
            </v-col>
            <v-col cols="12" sm="3" class="pr-4">
              <BaseSelect label="학기" v-model="searchParams.semester" :items="semesterOptions" />
            </v-col>
            <v-col cols="12" sm="3" class="pr-4">
              <BaseSelect label="이수 구분" v-model="searchParams.type" :items="typeOptions" />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" md="2" class="d-flex justify-end">
          <BaseButton @click="fetchData" />
        </v-col>
      </v-row>
    </div>

    <!-- 그리드 영역 (컴포넌트 사용) -->
    <PageableGridContent
      ref="pageableGridContentRef"
      :datasource="pageableDataSource"
      :columns="columnDefs"
      :options="gridOptions"
      :events="[
        { type: 'filterChanged', listener: onPageableGridFilterActived },
        { type: 'selectionChanged', listener: onSelectionChanged }
      ]"
      @page-changed="handlePageChange"
    />
  </div>
</template>

<style lang="scss" scoped>
// page-title, content-card 등은 main.scss 전역 스타일을 따르지만
// 여기서 덮어쓰거나 추가할 수 있습니다.
.page-container {
  // 필요시 로컬 스타일 작성
}
</style>