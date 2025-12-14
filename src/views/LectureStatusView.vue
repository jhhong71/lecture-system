<template>
  <div class="page-container">
    <h2 class="common-title pd-mb10">강의 개설 현황</h2>

    <!-- 검색 영역 -->
    <div class="common-search-area pd-mb20">
      <div class="pd-flex- pd-align-center pd-space-between pd-py15 pd-px20">
          <div class="pd-flex- pd-align-center pd-space-between pd-gap10">
            <BaseSelect label="개설 연도" v-model="searchParams.year" :items="yearOptions" />
            <BaseSelect label="학기" v-model="searchParams.semester" :items="semesterOptions" />
            <BaseSelect label="이수 구분" v-model="searchParams.type" :items="typeOptions" />
          </div>
          <BaseButton label="조회" @click="fetchData" />
      </div>
    </div>

    <!-- 그리드 영역 -->
    <div class="common-grid-area pd-py15 pd-px20">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios'; // [필수] npm install axios
import BaseSelect from '../components/BaseSelect.vue';
import BaseButton from '../components/BaseButton.vue';
import PageableGridContent from '../components/ag-grid/PageableGridContent.vue';

// --- [Type Definition] DTO 정의 ---
// 백엔드(Java)의 LectureDto 클래스와 필드명이 일치해야 합니다.
interface LectureDto {
  id: number;
  no: number;
  year: string;
  semester: string;
  type: string;
  name: string;
  credits: number;
  professor: string;
  students: number;
  date: string;
}

interface LectureSearchRequest {
  year: string;
  semester: string;
  type: string;
}

// --- [Service Layer] API 서비스 ---
// [중요] 백엔드 서버 주소 설정 (Spring Boot 기본 포트: 8080)
const API_BASE_URL = 'http://localhost:8080/api/v1';

const LectureApiService = {
  /**
   * 강의 목록 조회
   * [Swagger] GET /lectures
   */
  getLectures: async (params: LectureSearchRequest): Promise<LectureDto[]> => {
    // 검색 조건 파라미터 준비
    // 백엔드에서 "전체"라는 문자열도 처리하도록 만들었으므로 그대로 보냅니다.
    const requestParams = {
        year: params.year,
        semester: params.semester,
        type: params.type 
    };

    try {
      console.log(`[API 요청] GET ${API_BASE_URL}/lectures`, requestParams);
      
      // [핵심] 실제 서버로 요청 전송
      const response = await axios.get(`${API_BASE_URL}/lectures`, { 
        params: requestParams 
      });
      
      console.log(`[API 응답] 성공: ${response.data.length}건`);
      return response.data; // Spring Boot에서 List<LectureDto>를 바로 반환하므로 .data가 배열입니다.

    } catch (error) {
      console.error('[API Error] 서버 통신 실패:', error);
      // alert("서버 연결에 실패했습니다. 백엔드가 켜져있는지 확인해주세요."); 
      return []; // 에러 시 빈 배열 반환
    }
  }
};

// --- 상태 관리 ---
const pageableGridContentRef = ref<any>(null);
const pageableDataSource = ref<LectureDto[]>([]);

// 검색 조건 (기본값)
const searchParams = ref<LectureSearchRequest>({ 
  year: '2025', 
  semester: '1학기', 
  type: '전체' 
});

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
        const colors: Record<string, string> = { 
            '전공필수': 'text-red-darken-2', 
            '전공선택': 'text-blue-darken-2', 
            '교양': 'text-grey-darken-1' 
        };
        const color = colors[params.value] || 'text-black';
        return `<span style="font-weight:bold" class="${color}">${params.value}</span>`;
    }
  },
  { headerName: "학기", field: "semester", width: 100, cellClass: "text-center" }, 
  { headerName: "강의명", field: "name", flex: 2, cellStyle: { fontWeight: 'bold' } },
  { headerName: "학점", field: "credits", width: 100, cellClass: "text-center", valueFormatter: (p: any) => p.value + "학점" },
  { headerName: "담당 교수", field: "professor", cellClass: "text-center" },
  { headerName: "수강 인원", field: "students", cellClass: "text-center", valueFormatter: (p: any) => p.value + "명" },
  { headerName: "개설 일자", field: "date", cellClass: "text-center" }
];

const gridOptions = {
  paginationPageSize: 10,
  rowSelection: 'multiple'
};

// --- 이벤트 핸들러 ---
const handlePageChange = (info: { currentPage: number, totalPages: number }) => {
  console.log(`페이지 변경: ${info.currentPage + 1}`);
};

const onPageableGridFilterActived = () => {
  console.log("그리드 자체 필터 작동");
};

const onSelectionChanged = () => {
  if (pageableGridContentRef.value) {
    const selectedRows = pageableGridContentRef.value.gridApi.getSelectedRows();
    console.log("선택된 행 개수:", selectedRows.length);
  }
};

/**
 * 데이터 조회 함수
 */
const fetchData = async () => {
  if(pageableGridContentRef.value?.gridApi) {
    pageableGridContentRef.value.gridApi.showLoadingOverlay();
  }
  
  // 실제 API 호출 (Mock 아님!)
  pageableDataSource.value = await LectureApiService.getLectures(searchParams.value);

  if(pageableGridContentRef.value?.gridApi) {
    pageableGridContentRef.value.gridApi.hideOverlay();
  }
};

onMounted(() => {
  fetchData();
});
</script>
